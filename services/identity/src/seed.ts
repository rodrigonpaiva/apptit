import { PrismaPg } from '@prisma/adapter-pg';
import { readConfig, reportStartupFailure } from '@apptit/runtime';
import { PrismaClient } from './generated/prisma/client.js';
async function seed(): Promise<void> {
  const config = readConfig('identity');
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: config.databaseUrl!, connectionTimeoutMillis: config.internalTimeoutMs }) });
  try {
    const payload = { mode: 'synthetic', service: 'identity', data: { users: [{ id: 'fixture-chef-a', name: 'Synthetic Chef A', site: 'fixture-site-a' }, { id: 'fixture-storekeeper-b', name: 'Synthetic Storekeeper B', site: 'fixture-site-b' }], authenticationEnabled: false } };
    await db.runtimeFixture.upsert({ where: { id: 'synthetic-runtime-v1' }, create: { id: 'synthetic-runtime-v1', payload }, update: { payload } });
    console.log('Synthetic identity runtime fixture seeded; no operational feature enabled.');
  } finally { await db.$disconnect(); }
}
seed().catch(error => { reportStartupFailure('identity seed', error); process.exitCode = 1; });
