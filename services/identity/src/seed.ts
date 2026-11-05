import { PrismaPg } from '@prisma/adapter-pg';
import { readConfig, reportStartupFailure } from '@apptit/runtime';
import { fixtureAccounts, fixtureSites } from './fixtures.js';
import { ArgonPasswordHasher } from './infra/password-hasher.js';
import { PrismaClient } from './generated/prisma/client.js';
async function seed(): Promise<void> {
  const config = readConfig('identity');
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: config.databaseUrl!, connectionTimeoutMillis: config.internalTimeoutMs }) });
  try {
    const passwords = new ArgonPasswordHasher();
    for (const site of fixtureSites) {
      await db.tenant.upsert({ where: { id: site.tenantId }, create: { id: site.tenantId, name: site.name, isActive: true }, update: {} });
      await db.site.upsert({ where: { id: site.id }, create: site, update: {} });
    }
    for (const account of fixtureAccounts) {
      const password = process.env[account.passwordKey];
      if (!password || password.length < 32 || password.includes('__GENERATE')) throw new Error('Missing fixture password');
      const existing = await db.identityUser.findUnique({ where: { id: account.id } });
      const unchanged = existing && await passwords.verify(existing.passwordHash, password);
      const passwordHash = unchanged ? existing.passwordHash : await passwords.hash(password);
      await db.$transaction(async tx => {
        await tx.identityUser.upsert({ where: { id: account.id }, create: { id: account.id, login: account.login, name: account.name, passwordHash }, update: unchanged ? {} : { passwordHash } });
        if (!unchanged) await tx.accessSession.updateMany({ where: { userId: account.id, revokedAt: null }, data: { revokedAt: new Date() } });
        for (const index of account.sites) {
          const siteId = fixtureSites[index]!.id;
          await tx.siteMembership.upsert({ where: { userId_siteId: { userId: account.id, siteId } }, create: { userId: account.id, siteId, role: account.role }, update: {} });
        }
      });
    }
    const payload = { mode: 'synthetic', service: 'identity', data: { authenticationEnabled: true, fixtureAccounts: fixtureAccounts.length } };
    await db.runtimeFixture.upsert({ where: { id: 'synthetic-runtime-v1' }, create: { id: 'synthetic-runtime-v1', payload }, update: { payload } });
    console.log('Synthetic identity individual accounts seeded; no stock or production operation enabled.');
  } finally { await db.$disconnect(); }
}
seed().catch(error => { reportStartupFailure('identity seed', error); process.exitCode = 1; });
