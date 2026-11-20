import { createHash, randomUUID } from 'node:crypto';
import type { AuthorizedSiteContext, EvidenceUploadIntent, ReceiptWorkspaceSnapshot, Scope, EvidenceView, EvidenceListing } from '@apptit/contracts';
import { evidenceUploadIntent, object, scope, uuid } from '@apptit/domain-values';
import type { RuntimeConfig } from '@apptit/runtime';
import { Prisma } from '../generated/prisma/client.js';
import type { PrismaClient, ReceiptEvidence } from '../generated/prisma/client.js';
import { evidenceTypes, EvidenceStorageFailure, PrivateEvidenceStore } from '../infra/private-evidence-store.js';
import { ReceiptFailure } from './receipt-workspace.js';

const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
export class EvidenceWorkspace {
  constructor(private readonly db: PrismaClient, private readonly config: RuntimeConfig) {}
  private authorize(context: AuthorizedSiteContext, requested: Scope, write = false) {
    if (!context?.capabilities.includes(write ? 'evidence.write' : 'evidence.read') || context.scope.tenantId !== requested.tenantId || context.scope.siteId !== requested.siteId) throw new ReceiptFailure('FORBIDDEN', 403);
  }
  private enabled() { if (this.config.evidenceMode !== 'fixture') throw new ReceiptFailure('CAPABILITY_DISABLED', 503); }
  private store() { return new PrivateEvidenceStore(this.config.evidenceRoot!, this.config.evidenceMaxBytes); }
  private view(row: ReceiptEvidence): EvidenceView { return row.snapshot as unknown as EvidenceView; }
  private async receipt(db: Prisma.TransactionClient, requested: Scope, id: string) {
    const found = await db.receiptDraft.findFirst({ where: { ...requested, id } });
    if (!found) throw new ReceiptFailure('NOT_FOUND', 404);
    return found.snapshot as unknown as ReceiptWorkspaceSnapshot;
  }
  private async find(input: unknown, context: AuthorizedSiteContext, write = false) {
    const value = object(input, ['scope', 'id'], 'evidence'); const requested = scope(value['scope']); this.authorize(context, requested, write); this.enabled();
    const row = await this.db.receiptEvidence.findFirst({ where: { ...requested, id: uuid(value['id'], 'id') } });
    if (!row) throw new ReceiptFailure('NOT_FOUND', 404);
    // The original linked receipt must remain accessible; no caller path or URL is accepted.
    await this.receipt(this.db, requested, row.receiptId);
    return row;
  }
  private async event(tx: Prisma.TransactionClient, row: ReceiptEvidence, value: EvidenceView, context: AuthorizedSiteContext) {
    await tx.receiptEvidenceEvent.create({ data: { id: randomUUID(), evidenceId: row.id, tenantId: row.tenantId, siteId: row.siteId, actorId: context.actor.userId, sessionId: context.sessionId, correlationId: context.correlationId, recordedAt: new Date(), snapshot: json(value) } });
  }
  async begin(input: unknown, context: AuthorizedSiteContext): Promise<EvidenceView> {
    this.enabled();
    const intent = evidenceUploadIntent(input, { maxBytes: this.config.evidenceMaxBytes, allowedMediaTypes: evidenceTypes }); this.authorize(context, intent.scope, true);
    const hash = createHash('sha256').update(JSON.stringify(intent)).digest('hex');
    const key = { ...intent.scope, actorId: context.actor.userId, uploadId: intent.uploadId };
    try { return await this.db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${intent.links.receiptId}, 0))`;
      const receipt = await this.receipt(tx, intent.scope, intent.links.receiptId);
      this.checkLinks(receipt, intent);
      const previous = await tx.receiptEvidence.findUnique({ where: { tenantId_siteId_actorId_uploadId: key } });
      if (previous) { if (previous.intentHash !== hash) throw new ReceiptFailure('IDEMPOTENCY_MISMATCH', 409); return this.view(previous); }
      if (await tx.receiptEvidence.count({ where: { ...intent.scope, receiptId: intent.links.receiptId, lineId: intent.links.lineId } }) >= 20) throw new ReceiptFailure('EVIDENCE_LIMIT', 400);
      const id = randomUUID(); const recordedAt = new Date().toISOString();
      const value: EvidenceView = { id, uploadId: intent.uploadId, scope: intent.scope, links: intent.links, originalFilename: intent.originalFilename, author: context.actor, recordedAt, capturedAt: intent.capturedAt, synthetic: true, state: 'upload_pending', declared: intent.declared, readability: { state: 'unreviewed' }, extraction: { state: 'disabled' } };
      const row = await tx.receiptEvidence.create({ data: { id, ...key, receiptId: intent.links.receiptId, lineId: intent.links.lineId, intentHash: hash, snapshot: json(value), recordedAt } });
      await this.event(tx, row, value, context); return value;
    }); } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const previous = await this.db.receiptEvidence.findUnique({ where: { tenantId_siteId_actorId_uploadId: key } });
        if (previous) { if (previous.intentHash !== hash) throw new ReceiptFailure('IDEMPOTENCY_MISMATCH', 409); return this.view(previous); }
      }
      throw error;
    }
  }
  private checkLinks(receipt: ReceiptWorkspaceSnapshot, intent: Pick<EvidenceUploadIntent, 'links'>) {
    const line = receipt.draft.data.lines.find(line => line.id === intent.links.lineId);
    if (!line || line.product.productId !== intent.links.productId || line.product.presentationId !== intent.links.presentationId || line.batch.id !== intent.links.batchId) throw new ReceiptFailure('INVALID_EVIDENCE_LINK', 400);
  }
  async list(input: unknown, context: AuthorizedSiteContext): Promise<EvidenceListing> {
    const value = object(input, ['scope', 'receiptId'], 'query'); const requested = scope(value['scope']); this.authorize(context, requested);
    const receiptId = uuid(value['receiptId'], 'receiptId'); await this.receipt(this.db, requested, receiptId);
    if (this.config.evidenceMode !== 'fixture') return { mode: 'disabled', maxBytes: 0, mediaTypes: [], items: [] };
    const rows = await this.db.receiptEvidence.findMany({ where: { ...requested, receiptId }, orderBy: [{ recordedAt: 'asc' }, { id: 'asc' }], take: 1001 });
    if (rows.length > 1000) throw new ReceiptFailure('EVIDENCE_LIMIT', 400);
    return { localLabelOcr: this.config.ocrMode === 'browser_local', mode: 'fixture', maxBytes: this.config.evidenceMaxBytes, mediaTypes: [...evidenceTypes], items: rows.map(row => this.view(row)) };
  }
  async upload(input: unknown, context: AuthorizedSiteContext, bytes: Buffer) {
    const row = await this.find(input, context, true);
    if (row.actorId !== context.actor.userId) throw new ReceiptFailure('FORBIDDEN', 403);
    return this.db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${row.receiptId}, 0))`;
      const current = (await tx.receiptEvidence.findUnique({ where: { id: row.id } }))!; const before = this.view(current);
      this.checkLinks(await this.receipt(tx, context.scope, row.receiptId), before);
      try {
        await this.store().write(row.id, bytes, before.declared);
      } catch (error) {
        if (before.state === 'available') throw new ReceiptFailure('UPLOAD_REJECTED', 400);
        const failure = error instanceof EvidenceStorageFailure ? error.code : 'STORAGE_UNAVAILABLE';
        const value: EvidenceView = { ...before, state: 'failed', failure };
        await tx.receiptEvidence.update({ where: { id: row.id }, data: { snapshot: json(value) } }); await this.event(tx, row, value, context); return value;
      }
      if (before.state === 'available') return before;
      const clean = { ...before }; delete clean.failure;
      const value: EvidenceView = { ...clean, state: 'available', availableAt: new Date().toISOString() };
      await tx.receiptEvidence.update({ where: { id: row.id }, data: { snapshot: json(value) } }); await this.event(tx, row, value, context); return value;
    }, { timeout: 10000 });
  }
  async read(input: unknown, context: AuthorizedSiteContext) {
    const row = await this.find(input, context); const value = this.view(row);
    if (value.state !== 'available') throw new ReceiptFailure('EVIDENCE_NOT_AVAILABLE', 409);
    try { return { bytes: await this.store().read(row.id, value.declared), mediaType: value.declared.mediaType }; }
    catch { throw new ReceiptFailure('EVIDENCE_NOT_AVAILABLE', 503); }
  }
  async review(input: unknown, context: AuthorizedSiteContext) {
    const value = object(input, ['scope', 'id', 'readability'], 'review');
    if (value['readability'] !== 'readable' && value['readability'] !== 'unreadable') throw new ReceiptFailure('INVALID_INPUT', 400);
    const row = await this.find({ scope: value['scope'], id: value['id'] }, context, true);
    return this.db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${row.receiptId}, 0))`;
      const before = this.view((await tx.receiptEvidence.findUnique({ where: { id: row.id } }))!);
      if (before.state !== 'available') throw new ReceiptFailure('EVIDENCE_NOT_AVAILABLE', 409);
      const result: EvidenceView = { ...before, readability: { state: value['readability'] as 'readable' | 'unreadable', reviewedBy: context.actor, reviewedAt: new Date().toISOString() } };
      await tx.receiptEvidence.update({ where: { id: row.id }, data: { snapshot: json(result) } }); await this.event(tx, row, result, context); return result;
    });
  }
}
