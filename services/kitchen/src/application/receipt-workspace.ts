import { labelReview, reviewMatchesLine } from './label-review.js';
import type { EvidenceView } from '@apptit/contracts';
import { createHash } from 'node:crypto';
import type { AuthorizedSiteContext, ReceiptItemDetails, ReceiptOperationResult, ReceiptWorkspaceSnapshot, SaveReceiptWorkspace, Scope } from '@apptit/contracts';
import { InputError, invalid, object, productBarcode, receiptOperationIdentity, saveReceiptDraft, scope, text, uuid, decimal, scaledDecimal, fromScaled } from '@apptit/domain-values';
import { Prisma } from '../generated/prisma/client.js';
import type { PrismaClient } from '../generated/prisma/client.js';
export class ReceiptFailure extends Error { constructor(public readonly code: string, public readonly status = 400) { super(code); } }
export function parseReceiptWorkspace(input: unknown): SaveReceiptWorkspace {
  const value = object(input, ['command', 'items'], 'workspace');
  const command = saveReceiptDraft(value['command']);
  if (!Array.isArray(value['items']) || value['items'].length !== command.payload.lines.length) invalid('items', 'INVALID_LIST', 'One private identity snapshot per line is required.');
  const items: ReceiptItemDetails[] = value['items'].map((input, index) => {
    const item = object(input, ['lineId', 'name', 'presentation', 'barcode', 'physicalMatch', 'pack', 'labelReview'], `items[${index}]`);
    if (typeof item['physicalMatch'] !== 'boolean') invalid('physicalMatch', 'INVALID_MATCH', 'Explicit match state required.');
    let pack: ReceiptItemDetails['pack'] = null;
    if (item['pack'] !== null) {
      const raw = object(item['pack'], ['count', 'factor', 'unit', 'checked'], 'pack');
      const count = decimal(raw['count'], 'pack.count'); const factor = decimal(raw['factor'], 'pack.factor');
      if (count.includes('.') || scaledDecimal(count) <= 0n || scaledDecimal(factor) <= 0n || raw['checked'] !== true || !['g', 'ml', 'each'].includes(raw['unit'] as string)) invalid('pack', 'INVALID_CONVERSION', 'Positive whole-pack count, positive checked factor and supported unit required.');
      if (raw['unit'] === 'each' && factor.includes('.')) invalid('pack.factor', 'INVALID_CONVERSION', 'Item conversion must be whole.');
      pack = { count, factor, unit: raw['unit'] as 'g' | 'ml' | 'each', checked: true };
    }
    return { lineId: uuid(item['lineId'], 'lineId'), name: text(item['name'], 'name', 200), presentation: text(item['presentation'], 'presentation', 200), barcode: item['barcode'] === null ? null : productBarcode(item['barcode']), physicalMatch: item['physicalMatch'] as boolean, ...(item['labelReview'] === undefined ? {} : { labelReview: labelReview(item['labelReview']) }), pack };
  });
  if (new Set(items.map(item => item.lineId)).size !== items.length) invalid('items', 'DUPLICATE_ID', 'Duplicate line details.');
  for (const line of command.payload.lines) {
    const item = items.find(item => item.lineId === line.id);
    if (!item) invalid('items', 'MISSING_IDENTITY', 'Line identity is required.');
    if (line.disposition.state !== 'unknown' || line.evidenceIds.length) invalid('lines', 'CAPABILITY_DISABLED', 'Disposition/evidence remain pending in this package.');
    if (item.pack) {
      const expected = fromScaled(BigInt(item.pack.count) * scaledDecimal(item.pack.factor));
      if (line.received.state !== 'known' || line.received.value.amount !== expected || line.received.value.unit !== item.pack.unit || line.received.quality !== 'estimated') invalid('pack', 'CONVERSION_MISMATCH', 'Quantity must match the checked pack preview and remain an estimate.');
    }
  }
  return { command, items };
}
function json(value: unknown): Prisma.InputJsonObject { return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject; }
function snapshot(value: unknown): ReceiptWorkspaceSnapshot { return value as ReceiptWorkspaceSnapshot; }
/** Online adapters supply fresh Identity context; client payloads cannot supply authority. */
export class ReceiptWorkspace {
  constructor(private readonly db: PrismaClient, private readonly clock: () => Date = () => new Date()) {}
  private authorize(context: AuthorizedSiteContext, capability: 'receipt.draft.read' | 'receipt.draft.write', requested: Scope) {
    if (!context?.capabilities.includes(capability)) throw new ReceiptFailure('FORBIDDEN', 403);
    if (context.scope.siteId !== requested.siteId || context.scope.tenantId !== requested.tenantId) throw new ReceiptFailure('FORBIDDEN', 403);
  }
  async save(input: unknown, context: AuthorizedSiteContext): Promise<ReceiptWorkspaceSnapshot> {
    const { command, items } = parseReceiptWorkspace(input); this.authorize(context, 'receipt.draft.write', command.scope);
    const intent = receiptOperationIdentity(command, context.actor.userId, 'receipt.draft.save');
    const intentHash = createHash('sha256').update(intent.canonicalIntent + JSON.stringify([...items].sort((a, b) => a.lineId.localeCompare(b.lineId)))).digest('hex');
    const key = { ...command.scope, actorId: context.actor.userId, operationId: command.operationId };
    const existing = await this.db.receiptDraftOperation.findUnique({ where: { tenantId_siteId_actorId_operationId: key } });
    if (existing) { if (existing.intentHash !== intentHash) throw new ReceiptFailure('IDEMPOTENCY_MISMATCH', 409); return snapshot(existing.snapshot); }
    try {
      return await this.db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${command.receiptId}, 0))`;
        const linked = await tx.receiptEvidence.findMany({ where: { ...command.scope, receiptId: command.receiptId } });
        for (const record of linked) {
          const links = (record.snapshot as unknown as { links: { lineId: string; productId: string; presentationId: string; batchId: string } }).links;
          const line = command.payload.lines.find(line => line.id === links.lineId);
          if (!line || line.product.productId !== links.productId || line.product.presentationId !== links.presentationId || line.batch.id !== links.batchId) throw new ReceiptFailure('EVIDENCE_LINK_CONFLICT', 409);
        }
        for (const item of items) if (item.labelReview) {
          if (!context.capabilities.includes('evidence.read') || !context.capabilities.includes('evidence.write')) throw new ReceiptFailure('FORBIDDEN', 403);
          const line = command.payload.lines.find(line => line.id === item.lineId)!;
          const evidence = linked.find(record => record.id === item.labelReview!.evidenceId)?.snapshot as unknown as EvidenceView | undefined;
          if (!reviewMatchesLine(item.labelReview, line, evidence)) throw new ReceiptFailure('LABEL_REVIEW_CONFLICT', 409);
        }
        const observations = await tx.receiptObservation.findMany({ where: { ...command.scope, receiptId: command.receiptId } });
        for (const row of observations) {
          const target = (row.snapshot as unknown as { target: { lineId: string; productId: string; presentationId: string; batchId: string } }).target;
          const line = command.payload.lines.find(line => line.id === target.lineId);
          if (!line || line.product.productId !== target.productId || line.product.presentationId !== target.presentationId || line.batch.id !== target.batchId) throw new ReceiptFailure('OBSERVATION_LINK_CONFLICT', 409);
        }
        const where = { id: command.receiptId, ...command.scope };
        const before = await tx.receiptDraft.findFirst({ where });
        if (!before && command.expectedVersion !== 0) throw new ReceiptFailure('NOT_FOUND', 404);
        if (before && before.version !== command.expectedVersion) throw new ReceiptFailure('VERSION_CONFLICT', 409);
        const locations = command.payload.lines.flatMap(line => line.destinationLocationId.state === 'known' ? [line.destinationLocationId.value] : []);
        if (locations.length) {
          const found = await tx.receiptLocation.count({ where: { ...command.scope, id: { in: [...new Set(locations)] } } });
          if (found !== new Set(locations).size) throw new ReceiptFailure('INVALID_DESTINATION', 400);
        }
        const recordedAt = this.clock().toISOString(); const previous = before ? snapshot(before.snapshot) : null;
        const value: ReceiptWorkspaceSnapshot = { draft: { id: command.receiptId, scope: command.scope, version: command.expectedVersion + 1, state: 'draft', data: command.payload, createdBy: previous?.draft.createdBy ?? context.actor, updatedBy: context.actor, recordedAt }, items };
        if (!before) await tx.receiptDraft.create({ data: { ...where, version: 1, snapshot: json(value), recordedAt } });
        else {
          const updated = await tx.receiptDraft.updateMany({ where: { ...where, version: command.expectedVersion }, data: { version: { increment: 1 }, snapshot: json(value), recordedAt } });
          if (updated.count !== 1) throw new ReceiptFailure('VERSION_CONFLICT', 409);
        }
        await tx.receiptDraftRevision.create({ data: { receiptId: command.receiptId, ...command.scope, version: value.draft.version, actorId: context.actor.userId, sessionId: context.sessionId, correlationId: context.correlationId, recordedAt, snapshot: json(value) } });
        await tx.receiptDraftOperation.create({ data: { ...key, intentHash, recordedAt, snapshot: json(value) } });
        return value;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 5000 });
    } catch (error) {
      if ((error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') || (error instanceof ReceiptFailure && error.code === 'VERSION_CONFLICT')) {
        const outcome = await this.db.receiptDraftOperation.findUnique({ where: { tenantId_siteId_actorId_operationId: key } });
        if (outcome) { if (outcome.intentHash !== intentHash) throw new ReceiptFailure('IDEMPOTENCY_MISMATCH', 409); return snapshot(outcome.snapshot); }
        const visible = await this.db.receiptDraft.findFirst({ where: { id: command.receiptId, ...command.scope } });
        throw new ReceiptFailure(visible ? 'VERSION_CONFLICT' : 'NOT_FOUND', visible ? 409 : 404);
      }
      throw error;
    }
  }
  async operation(input: unknown, context: AuthorizedSiteContext): Promise<ReceiptOperationResult> {
    const value = object(input, ['scope', 'operationId', 'receiptId'], 'operation'); const requested = scope(value['scope']);
    this.authorize(context, 'receipt.draft.read', requested);
    const operationId = uuid(value['operationId'], 'operationId'), receiptId = uuid(value['receiptId'], 'receiptId');
    const found = await this.db.receiptDraftOperation.findUnique({ where: { tenantId_siteId_actorId_operationId: { ...requested, actorId: context.actor.userId, operationId } } });
    if (!found) return { state: 'unconfirmed' };
    const result = snapshot(found.snapshot);
    if (result.draft.id !== receiptId) return { state: 'unconfirmed' };
    return { state: 'recorded', snapshot: result };
  }
  async read(input: unknown, context: AuthorizedSiteContext) {
    const value = object(input, ['scope', 'id'], 'query'); const requested = scope(value['scope']); this.authorize(context, 'receipt.draft.read', requested);
    const found = await this.db.receiptDraft.findFirst({ where: { ...requested, id: uuid(value['id'], 'id') } });
    if (!found) throw new ReceiptFailure('NOT_FOUND', 404);
    return snapshot(found.snapshot);
  }
  async list(input: unknown, context: AuthorizedSiteContext) {
    const value = object(input, ['scope'], 'query'); const requested = scope(value['scope']); this.authorize(context, 'receipt.draft.read', requested);
    const rows = await this.db.receiptDraft.findMany({ where: requested, orderBy: [{ recordedAt: 'desc' }, { id: 'asc' }], take: 30 });
    return rows.map(row => ({ id: row.id, version: row.version, recordedAt: row.recordedAt.toISOString(), lineCount: snapshot(row.snapshot).draft.data.lines.length }));
  }
  async locations(input: unknown, context: AuthorizedSiteContext) {
    const value = object(input, ['scope'], 'query'); const requested = scope(value['scope']); this.authorize(context, 'receipt.draft.read', requested);
    return this.db.receiptLocation.findMany({ where: requested, select: { id: true, name: true }, orderBy: { name: 'asc' }, take: 50 });
  }
}
export { InputError };
