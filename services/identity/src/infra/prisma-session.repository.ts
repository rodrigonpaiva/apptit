import { randomUUID } from 'node:crypto';
import type { SiteAccess, SiteRole } from '@apptit/contracts';
import type { IdentityUser, SessionRepository, StoredSession } from '../application/session.repository.js';
import { roleCapabilities } from '../application/session.repository.js';
import type { PrismaClient } from '../generated/prisma/client.js';
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly db: PrismaClient) {}
  user(login: string): Promise<IdentityUser | null> { return this.db.identityUser.findUnique({ where: { login } }); }
  async memberships(userId: string): Promise<SiteAccess[]> {
    const rows = await this.db.siteMembership.findMany({ where: { userId, isActive: true, site: { isActive: true, tenant: { isActive: true } } }, include: { site: true }, orderBy: { siteId: 'asc' } });
    return rows.filter(row => ['chef', 'storekeeper', 'cook'].includes(row.role)).map(row => ({ tenantId: row.site.tenantId, siteId: row.siteId, name: row.site.name,
      timeZone: row.site.timeZone, role: row.role as SiteRole, membershipVersion: row.version, capabilities: roleCapabilities(row.role as SiteRole) }));
  }
  find(tokenHash: string): Promise<StoredSession | null> { return this.db.accessSession.findUnique({ where: { tokenHash }, include: { user: true } }); }
  async touch(id: string, now: Date, cutoff: Date): Promise<boolean> {
    const result = await this.db.accessSession.updateMany({ where: { id, revokedAt: null, expiresAt: { gt: now }, lastSeenAt: { gt: cutoff }, user: { isActive: true } }, data: { lastSeenAt: now } });
    return result.count === 1;
  }
  async create(user: IdentityUser, siteId: string, tokenHash: string, now: Date, expiresAt: Date, previousHash?: string): Promise<void> {
    await this.db.$transaction(async tx => {
      if (previousHash) {
        const old = await tx.accessSession.findUnique({ where: { tokenHash: previousHash } });
        if (old) {
          const revoked = await tx.accessSession.updateMany({ where: { id: old.id, revokedAt: null }, data: { revokedAt: now } });
          if (revoked.count) await tx.accessEvent.create({ data: { id: randomUUID(), sessionId: old.id, subjectUserId: old.userId, actorId: user.id, actorName: user.name, siteId: old.selectedSiteId, kind: 'replaced', recordedAt: now } });
        }
      }
      const session = await tx.accessSession.create({ data: { id: randomUUID(), userId: user.id, selectedSiteId: siteId, tokenHash, createdAt: now, lastSeenAt: now, expiresAt } });
      await tx.accessEvent.create({ data: { id: randomUUID(), sessionId: session.id, subjectUserId: user.id, actorId: user.id, actorName: user.name, siteId, kind: 'created', recordedAt: now } });
    });
  }
  async revoke(tokenHash: string, now: Date): Promise<void> {
    await this.db.$transaction(async tx => {
      const session = await tx.accessSession.findUnique({ where: { tokenHash }, include: { user: true } });
      if (!session) return;
      const result = await tx.accessSession.updateMany({ where: { id: session.id, revokedAt: null }, data: { revokedAt: now } });
      if (result.count) await tx.accessEvent.create({ data: { id: randomUUID(), sessionId: session.id, subjectUserId: session.userId, actorId: session.userId, actorName: session.user.name, siteId: session.selectedSiteId, kind: 'revoked', recordedAt: now } });
    });
  }
  async select(id: string, siteId: string, now: Date, cutoff: Date): Promise<boolean> {
    return this.db.$transaction(async tx => {
      const session = await tx.accessSession.findUnique({ where: { id }, include: { user: true } });
      if (!session) return false;
      const result = await tx.accessSession.updateMany({ where: { id, revokedAt: null, expiresAt: { gt: now }, lastSeenAt: { gt: cutoff }, user: { isActive: true } }, data: { selectedSiteId: siteId } });
      if (result.count) await tx.accessEvent.create({ data: { id: randomUUID(), sessionId: id, subjectUserId: session.userId, actorId: session.userId, actorName: session.user.name, siteId, kind: 'site_selected', recordedAt: now } });
      return result.count === 1;
    });
  }
  async attempt(keys: string[], now: Date, windowSeconds: number): Promise<number[]> {
    const cutoff = new Date(now.getTime() - windowSeconds * 1000);
    return this.db.$transaction(async tx => {
      const attempts: number[] = [];
      for (const key of keys) {
        const rows = await tx.$queryRaw<{ attempts: number }[]>`INSERT INTO "LoginRate" ("key", "startedAt", "attempts") VALUES (${key}, ${now}, 1)
          ON CONFLICT ("key") DO UPDATE SET "attempts" = CASE WHEN "LoginRate"."startedAt" <= ${cutoff} THEN 1 ELSE "LoginRate"."attempts" + 1 END,
          "startedAt" = CASE WHEN "LoginRate"."startedAt" <= ${cutoff} THEN ${now} ELSE "LoginRate"."startedAt" END RETURNING "attempts"`;
        attempts.push(rows[0]!.attempts);
      }
      return attempts;
    });
  }
}
