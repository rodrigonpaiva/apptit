import { randomUUID } from 'node:crypto';
import { storageCategories } from '@apptit/contracts';
import type { AuthorizedSiteContext, StorageCategory, StorageLocation } from '@apptit/contracts';
import { object, scope, text, uuid } from '@apptit/domain-values';
import type { PrismaClient } from '../generated/prisma/client.js';
import { Prisma } from '../generated/prisma/client.js';
import { ReceiptFailure } from './receipt-workspace.js';
export const storageLock = (tenantId: string, siteId: string) => `storage:${tenantId}:${siteId}`;
export class StorageLocations {
  constructor(private readonly db: PrismaClient) {}
  private authorize(input: unknown, context: AuthorizedSiteContext) {
    const requested = scope(input);
    if (!context.capabilities.includes('storage.location.manage') || context.scope.tenantId !== requested.tenantId || context.scope.siteId !== requested.siteId) throw new ReceiptFailure('FORBIDDEN', 403);
    return requested;
  }
  async list(input: unknown, context: AuthorizedSiteContext): Promise<StorageLocation[]> {
    const value = object(input, ['scope'], 'locations'), requested = this.authorize(value['scope'], context);
    const rows = await this.db.receiptLocation.findMany({ where: requested, orderBy: [{ name: 'asc' }, { id: 'asc' }], take: 201 });
    if (rows.length > 200) throw new ReceiptFailure('LOCATION_LIMIT', 400);
    return rows.map(({ id, name, category, isActive, version }) => ({ id, name, category: category as StorageCategory | null, isActive, version }));
  }
  async save(input: unknown, context: AuthorizedSiteContext): Promise<StorageLocation> {
    const value = object(input, ['scope', 'id', 'expectedVersion', 'name', 'category', 'isActive'], 'location'), requested = this.authorize(value['scope'], context);
    if (!storageCategories.includes(value['category'] as StorageCategory) || typeof value['isActive'] !== 'boolean' || !Number.isSafeInteger(value['expectedVersion']) || (value['expectedVersion'] as number) < 0 || (value['expectedVersion'] as number) > 2147483645) throw new ReceiptFailure('INVALID_INPUT', 400);
    const id = value['id'] === null ? randomUUID() : uuid(value['id'], 'id'), name = text(value['name'], 'name', 100);
    return this.db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${storageLock(requested.tenantId, requested.siteId)}, 0))`;
      const before = await tx.receiptLocation.findFirst({ where: { ...requested, id } });
      if (value['id'] !== null && value['expectedVersion'] !== 0 && !before) throw new ReceiptFailure('NOT_FOUND', 404);
      if (before?.version === 1 && value['expectedVersion'] === 0 && before.name === name && before.category === value['category'] && before.isActive === value['isActive']) return { id, name, category: before.category as StorageCategory, isActive: before.isActive, version: before.version };
      if ((before?.version ?? 0) !== value['expectedVersion']) throw new ReceiptFailure('VERSION_CONFLICT', 409);
      if (!before && await tx.receiptLocation.count({ where: requested }) >= 200) throw new ReceiptFailure('LOCATION_LIMIT', 400);
      const data = { ...requested, id, name, category: value['category'] as StorageCategory, isActive: value['isActive'] as boolean, version: (before?.version ?? 0) + 1 };
      if (before) await tx.receiptLocation.update({ where: { id }, data }); else await tx.receiptLocation.create({ data });
      const result = { id, name, category: data.category, isActive: data.isActive, version: data.version };
      await tx.receiptLocationRevision.create({ data: { id: randomUUID(), locationId: id, ...requested, version: data.version, actorId: context.actor.userId, sessionId: context.sessionId, correlationId: context.correlationId, recordedAt: new Date(), before: before ? JSON.parse(JSON.stringify(before)) as Prisma.InputJsonObject : Prisma.DbNull, snapshot: result } });
      return result;
    });
  }
}
