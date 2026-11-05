import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { PrismaClient } from '../../services/identity/dist/generated/prisma/client.js';
import { PrismaSessionRepository } from '../../services/identity/dist/infra/prisma-session.repository.js';
import { SessionService } from '../../services/identity/dist/application/session.service.js';
import { ArgonPasswordHasher } from '../../services/identity/dist/infra/password-hasher.js';
import { newSecret, readConfig, sessionHash, validSecret } from '../../packages/runtime/dist/index.js';
const require = createRequire(new URL('../../services/identity/package.json', import.meta.url));
const { PrismaPg } = require('@prisma/adapter-pg');
const settings = readConfig('identity');
async function setup(role = 'chef') {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: settings.databaseUrl, connectionTimeoutMillis: 3000 }) });
  const passwords = new ArgonPasswordHasher();
  const password = newSecret();
  const userId = randomUUID(), tenantId = randomUUID(), siteId = randomUUID();
  await db.tenant.create({ data: { id: tenantId, name: 'Synthetic test tenant' } });
  await db.site.create({ data: { id: siteId, tenantId, name: 'Synthetic test site', timeZone: 'Europe/Paris' } });
  const user = await db.identityUser.create({ data: { id: userId, login: `${userId}@apptit.test`, name: 'Synthetic individual', passwordHash: await passwords.hash(password) } });
  await db.siteMembership.create({ data: { userId, siteId, role } });
  let now = new Date('2026-11-05T12:00:00Z');
  const hash = secret => sessionHash(secret, settings.sessionHashKey);
  const service = new SessionService(new PrismaSessionRepository(db), passwords, { generate: newSecret, hash, valid: validSecret }, await passwords.hash(newSecret()),
    { idleSeconds: 30, absoluteSeconds: 60, loginLimit: 3, loginWindowSeconds: 60 }, () => now);
  const login = () => service.login({ login: user.login, password }, undefined, 'synthetic-' + userId);
  return { db, service, user, password, hash, login, scope: { tenantId, siteId }, advance(seconds) { now = new Date(now.getTime() + seconds * 1000); } };
}
test('individual login stores only hashes, constructs author context and blocks revoked sessions immediately', async () => {
  const fixture = await setup();
  try {
    const signedIn = await fixture.login();
    assert.equal(signedIn.profile.user.id, fixture.user.id);
    const row = await fixture.db.accessSession.findUnique({ where: { tokenHash: fixture.hash(signedIn.sessionSecret) } });
    assert.ok(row && row.tokenHash !== signedIn.sessionSecret);
    assert.ok(fixture.user.passwordHash.startsWith('$argon2id$v=19$m=65536,t=3,p=1$'));
    const context = await fixture.service.authorize({ scope: fixture.scope, capability: 'quantity-draft.write' }, signedIn.sessionSecret, randomUUID());
    assert.deepEqual(context.actor, { userId: fixture.user.id, nameAtAction: fixture.user.name });
    assert.equal(context.sessionId, row.id);
    await fixture.service.logout(signedIn.sessionSecret);
    await assert.rejects(fixture.service.current(signedIn.sessionSecret), error => error.code === 'SESSION_REVOKED');
    await assert.rejects(fixture.service.authorize({ scope: fixture.scope, capability: 'site.read' }, signedIn.sessionSecret, randomUUID()), error => error.code === 'SESSION_REVOKED');
    assert.equal(await fixture.db.accessEvent.count({ where: { sessionId: row.id, kind: 'revoked' } }), 1);
    await fixture.service.logout(signedIn.sessionSecret);
    assert.equal(await fixture.db.accessEvent.count({ where: { sessionId: row.id, kind: 'revoked' } }), 1);
  } finally { await fixture.db.$disconnect(); }
});
test('idle and absolute expiry cannot be revived by a new protected request', async () => {
  const fixture = await setup();
  try {
    const idle = await fixture.login();
    fixture.advance(31);
    await assert.rejects(fixture.service.current(idle.sessionSecret), error => error.code === 'SESSION_EXPIRED');
    const absolute = await fixture.login();
    fixture.advance(20); await fixture.service.current(absolute.sessionSecret);
    fixture.advance(20); await fixture.service.current(absolute.sessionSecret);
    fixture.advance(21);
    await assert.rejects(fixture.service.current(absolute.sessionSecret), error => error.code === 'SESSION_EXPIRED');
  } finally { await fixture.db.$disconnect(); }
});
test('membership/role/account changes are checked afresh and a wrong tenant/site is denied', async () => {
  const fixture = await setup('cook');
  try {
    const login = await fixture.login();
    await assert.rejects(fixture.service.authorize({ scope: fixture.scope, capability: 'quantity-draft.write' }, login.sessionSecret, randomUUID()), error => error.code === 'FORBIDDEN');
    await assert.rejects(fixture.service.authorize({ scope: { ...fixture.scope, tenantId: randomUUID() }, capability: 'site.read' }, login.sessionSecret, randomUUID()), error => error.code === 'FORBIDDEN');
    await fixture.db.siteMembership.update({ where: { userId_siteId: { userId: fixture.user.id, siteId: fixture.scope.siteId } }, data: { role: 'chef', version: { increment: 1 } } });
    const context = await fixture.service.authorize({ scope: fixture.scope, capability: 'quantity-draft.write' }, login.sessionSecret, randomUUID());
    assert.equal(context.membershipVersion, 2);
    await fixture.db.siteMembership.update({ where: { userId_siteId: { userId: fixture.user.id, siteId: fixture.scope.siteId } }, data: { isActive: false } });
    await assert.rejects(fixture.service.authorize({ scope: fixture.scope, capability: 'site.read' }, login.sessionSecret, randomUUID()), error => error.code === 'FORBIDDEN');
    assert.equal((await fixture.service.current(login.sessionSecret)).selectedSite, null);
    await fixture.db.identityUser.update({ where: { id: fixture.user.id }, data: { isActive: false } });
    await assert.rejects(fixture.service.current(login.sessionSecret), error => error.code === 'UNAUTHENTICATED');
  } finally { await fixture.db.$disconnect(); }
});
test('re-login rotates the secret and revokes the old session atomically; password failures remain generic and throttled', async () => {
  const fixture = await setup();
  try {
    const original = await fixture.login();
    const next = await fixture.service.login({ login: fixture.user.login, password: fixture.password }, original.sessionSecret, 'synthetic-' + fixture.user.id);
    assert.ok(original.sessionSecret !== next.sessionSecret);
    await assert.rejects(fixture.service.current(original.sessionSecret), error => error.code === 'SESSION_REVOKED');
    assert.equal((await fixture.service.current(next.sessionSecret)).user.id, fixture.user.id);
    const unknown = randomUUID() + '@apptit.test';
    for (let index = 0; index < 3; index++) await assert.rejects(fixture.service.login({ login: unknown, password: newSecret() }, undefined, 'synthetic-unknown-' + unknown), error => error.code === 'INVALID_CREDENTIALS');
    await assert.rejects(fixture.service.login({ login: unknown, password: newSecret() }, undefined, 'synthetic-unknown-' + unknown), error => error.code === 'RATE_LIMITED');
  } finally { await fixture.db.$disconnect(); }
});
