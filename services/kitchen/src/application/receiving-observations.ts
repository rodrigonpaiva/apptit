import { createHash } from 'node:crypto';
import type { AuthorizedSiteContext, ReceivingObservationHistory, ReceivingObservationListing, ReceivingObservationProfile, ReceivingObservationSnapshot, ReceiptWorkspaceSnapshot, Scope } from '@apptit/contracts';
import type { RuntimeConfig } from '@apptit/runtime';
import { assessReceivingObservation, object, saveReceivingObservation, scope, uuid } from '@apptit/domain-values';
import { Prisma } from '../generated/prisma/client.js';
import type { PrismaClient } from '../generated/prisma/client.js';
import { ReceiptFailure } from './receipt-workspace.js';
import { receivingFixtureProfiles } from './receiving-profiles.js';
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
const snapshot = (value: unknown) => value as ReceivingObservationSnapshot;
export class ReceivingObservations {
  constructor(private readonly db: PrismaClient, private readonly config: RuntimeConfig, private readonly clock: () => Date = () => new Date(), private readonly profiles: (scope: Scope) => ReceivingObservationProfile[] = receivingFixtureProfiles) {}
  private authorize(context: AuthorizedSiteContext, requested: Scope, write = false) {
    if (!context?.capabilities.includes(write ? 'observation.capture' : 'observation.read') || context.scope.tenantId !== requested.tenantId || context.scope.siteId !== requested.siteId) throw new ReceiptFailure('FORBIDDEN', 403);
  }
  async list(input: unknown, context: AuthorizedSiteContext): Promise<ReceivingObservationListing> {
    const value = object(input, ['scope', 'receiptId'], 'query'); const requested = scope(value['scope']); this.authorize(context, requested);
    const receiptId = uuid(value['receiptId'], 'receiptId');
    if (!await this.db.receiptDraft.findFirst({ where: { ...requested, id: receiptId } })) throw new ReceiptFailure('NOT_FOUND', 404);
    const rows = await this.db.receiptObservation.findMany({ where: { ...requested, receiptId }, orderBy: { lineId: 'asc' }, take: 51 });
    if (rows.length > 50) throw new ReceiptFailure('OBSERVATION_LIMIT', 400);
    return { mode: this.config.observationMode, profiles: this.config.observationMode === 'fixture' ? this.profiles(requested) : [], entries: rows.map(row => snapshot(row.snapshot)) };
  }
  async history(input: unknown, context: AuthorizedSiteContext): Promise<ReceivingObservationHistory> {
    const value = object(input, ['scope', 'id', 'beforeVersion'], 'query'); const requested = scope(value['scope']); this.authorize(context, requested); const id = uuid(value['id'], 'id');
    if (value['beforeVersion'] !== undefined && (!Number.isInteger(value['beforeVersion']) || (value['beforeVersion'] as number) < 1 || (value['beforeVersion'] as number) >= 2147483647)) throw new ReceiptFailure('INVALID_INPUT', 400);
    if (!await this.db.receiptObservation.findFirst({ where: { ...requested, id } })) throw new ReceiptFailure('NOT_FOUND', 404);
    const rows = await this.db.receiptObservationRevision.findMany({ where: { ...requested, observationId: id, ...(value['beforeVersion'] === undefined ? {} : { version: { lt: value['beforeVersion'] as number } }) }, orderBy: { version: 'desc' }, take: 21 });
    const page = rows.slice(0, 20); return { items: page.map(row => snapshot(row.snapshot)), nextBeforeVersion: rows.length > 20 ? page.at(-1)!.version : null };
  }
  async save(input: unknown, context: AuthorizedSiteContext): Promise<ReceivingObservationSnapshot> {
    const command = saveReceivingObservation(input); this.authorize(context, command.scope, true);
    const intentHash = createHash('sha256').update(JSON.stringify(command)).digest('hex'); const key = { ...command.scope, actorId: context.actor.userId, operationId: command.operationId };
    const replay = await this.db.receiptObservationOperation.findUnique({ where: { tenantId_siteId_actorId_operationId: key } });
    if (replay) { if (replay.intentHash !== intentHash) throw new ReceiptFailure('IDEMPOTENCY_MISMATCH', 409); return snapshot(replay.snapshot); }
    if (this.config.observationMode !== 'fixture') throw new ReceiptFailure('CAPABILITY_DISABLED', 503);
    try { return await this.db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${command.target.receiptId}, 0))`;
      const completed = await tx.receiptObservationOperation.findUnique({ where: { tenantId_siteId_actorId_operationId: key } });
      if (completed) { if (completed.intentHash !== intentHash) throw new ReceiptFailure('IDEMPOTENCY_MISMATCH', 409); return snapshot(completed.snapshot); }
      const found = await tx.receiptDraft.findFirst({ where: { ...command.scope, id: command.target.receiptId } });
      if (!found) throw new ReceiptFailure('NOT_FOUND', 404);
      if (found.version !== command.expectedReceiptVersion) throw new ReceiptFailure('RECEIPT_VERSION_CONFLICT', 409);
      const receipt = found.snapshot as unknown as ReceiptWorkspaceSnapshot; const line = receipt.draft.data.lines.find(line => line.id === command.target.lineId);
      if (!line || line.product.productId !== command.target.productId || line.product.presentationId !== command.target.presentationId || line.batch.id !== command.target.batchId) throw new ReceiptFailure('INVALID_OBSERVATION_LINK', 400);
      const previous = await tx.receiptObservation.findFirst({ where: { ...command.scope, receiptId: command.target.receiptId, lineId: command.target.lineId } });
      if (previous && (previous.id !== command.id || previous.version !== command.expectedVersion)) throw new ReceiptFailure('VERSION_CONFLICT', 409);
      if (!previous && command.expectedVersion !== 0) throw new ReceiptFailure('NOT_FOUND', 404);
      const before = previous ? snapshot(previous.snapshot) : null;
      const profile = before?.profile ?? this.profiles(command.scope).find(profile => profile.id === command.profile.id && profile.version === command.profile.version);
      if (!profile || profile.id !== command.profile.id || profile.version !== command.profile.version || profile.scope.tenantId !== command.scope.tenantId || profile.scope.siteId !== command.scope.siteId) throw new ReceiptFailure('PROFILE_VERSION_CONFLICT', 409);
      const now = this.clock(); const recordedAt = now.toISOString(); const assessment = assessReceivingObservation(command.data, profile, now);
      const result: ReceivingObservationSnapshot = { id: command.id, scope: command.scope, version: command.expectedVersion + 1, target: command.target, receiptVersion: found.version, profile: structuredClone(profile), data: command.data, assessment, originalAuthor: before?.originalAuthor ?? context.actor, updatedBy: context.actor, firstRecordedAt: before?.firstRecordedAt ?? recordedAt, recordedAt, correctionReason: command.correctionReason, taskState: [assessment.temperature.state, assessment.condition.state].some(state => state === 'pending' || state === 'inconclusive') ? 'in_progress' : 'recorded', disposition: 'not_activated' };
      if (!previous) await tx.receiptObservation.create({ data: { id: result.id, ...command.scope, receiptId: command.target.receiptId, lineId: command.target.lineId, version: 1, snapshot: json(result), recordedAt } });
      else { const changed = await tx.receiptObservation.updateMany({ where: { id: result.id, ...command.scope, version: command.expectedVersion }, data: { version: { increment: 1 }, snapshot: json(result), recordedAt } }); if (changed.count !== 1) throw new ReceiptFailure('VERSION_CONFLICT', 409); }
      await tx.receiptObservationRevision.create({ data: { observationId: result.id, ...command.scope, version: result.version, actorId: context.actor.userId, sessionId: context.sessionId, correlationId: context.correlationId, recordedAt, snapshot: json(result) } });
      await tx.receiptObservationOperation.create({ data: { ...key, intentHash, recordedAt, snapshot: json(result) } });
      return result;
    }, { timeout: 5000 }); } catch (error) {
      if ((error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') || (error instanceof ReceiptFailure && error.code === 'VERSION_CONFLICT')) {
        const outcome = await this.db.receiptObservationOperation.findUnique({ where: { tenantId_siteId_actorId_operationId: key } });
        if (outcome) { if (outcome.intentHash !== intentHash) throw new ReceiptFailure('IDEMPOTENCY_MISMATCH', 409); return snapshot(outcome.snapshot); }
        const visible = await this.db.receiptObservation.findFirst({ where: { ...command.scope, receiptId: command.target.receiptId, lineId: command.target.lineId } });
        throw new ReceiptFailure(visible ? 'VERSION_CONFLICT' : 'NOT_FOUND', visible ? 409 : 404);
      }
      throw error;
    }
  }
}
