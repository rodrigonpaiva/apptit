import type { QuantityDraftRevision, SaveQuantityDraft, Scope, TrustedActorContext, VersionedQuantityDraft } from '@apptit/contracts';
import type { QuantityDraftRepository } from '../../application/quantity-draft.repository.js';
import { DraftRepositoryError } from '../../application/quantity-draft.repository.js';
import { Prisma } from '../../generated/prisma/client.js';
import type { PrismaClient } from '../../generated/prisma/client.js';
import { draftColumns, mapDraft } from './quantity-draft.mapper.js';
function snapshot(value: VersionedQuantityDraft): Prisma.InputJsonObject {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
}
export class PrismaQuantityDraftRepository implements QuantityDraftRepository {
  constructor(private readonly db: PrismaClient) {}
  async save(command: SaveQuantityDraft, context: TrustedActorContext, recordedAt: string): Promise<VersionedQuantityDraft> {
    try {
      return await this.db.$transaction(async tx => {
        const where = { id: command.id, ...command.scope };
        const beforeRow = await tx.quantityDraft.findFirst({ where });
        if (command.expectedVersion > 0 && !beforeRow) throw new DraftRepositoryError('NOT_FOUND');
        if (beforeRow && beforeRow.version !== command.expectedVersion) throw new DraftRepositoryError('VERSION_CONFLICT');
        const before = beforeRow ? mapDraft(beforeRow) : null;
        const stamp = { updatedById: context.actor.userId, updatedByName: context.actor.nameAtAction, updatedAt: new Date(recordedAt) };
        let after: VersionedQuantityDraft;
        if (!beforeRow) {
          after = mapDraft(await tx.quantityDraft.create({ data: { ...where, ...draftColumns(command.data), ...stamp,
            siteTimeZone: context.siteTimeZone, version: 1, createdById: context.actor.userId, createdByName: context.actor.nameAtAction, createdAt: new Date(recordedAt) } }));
        } else {
          const update = await tx.quantityDraft.updateMany({ where: { ...where, version: command.expectedVersion },
            data: { ...draftColumns(command.data), ...stamp, version: { increment: 1 } } });
          if (update.count !== 1) throw new DraftRepositoryError('VERSION_CONFLICT');
          after = mapDraft(await tx.quantityDraft.findFirstOrThrow({ where }));
        }
        await tx.quantityDraftRevision.create({ data: { draftId: after.id, ...after.scope, version: after.version,
          actorId: context.actor.userId, actorName: context.actor.nameAtAction, sessionId: context.sessionId, correlationId: context.correlationId,
          recordedAt: new Date(recordedAt), before: before ? snapshot(before) : Prisma.DbNull, after: snapshot(after) } });
        return after;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 5000 });
    } catch (failure) {
      if (failure instanceof Prisma.PrismaClientKnownRequestError && failure.code === 'P2002') {
        const visible = await this.db.quantityDraft.findFirst({ where: { id: command.id, ...command.scope } });
        throw new DraftRepositoryError(visible ? 'VERSION_CONFLICT' : 'NOT_FOUND');
      }
      throw failure;
    }
  }
  async find(id: string, scope: Scope): Promise<VersionedQuantityDraft | null> {
    const row = await this.db.quantityDraft.findFirst({ where: { id, ...scope } });
    return row ? mapDraft(row) : null;
  }
  async history(id: string, scope: Scope): Promise<QuantityDraftRevision[]> {
    const rows = await this.db.quantityDraftRevision.findMany({ where: { draftId: id, ...scope }, orderBy: { version: 'asc' } });
    return rows.map(row => ({ draftId: row.draftId, scope: { tenantId: row.tenantId, siteId: row.siteId }, version: row.version,
      actor: { userId: row.actorId, nameAtAction: row.actorName }, sessionId: row.sessionId, correlationId: row.correlationId,
      recordedAt: row.recordedAt.toISOString(), before: row.before as unknown as VersionedQuantityDraft | null, after: row.after as unknown as VersionedQuantityDraft }));
  }
}
