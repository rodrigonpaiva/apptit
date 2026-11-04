import { PrismaPg } from '@prisma/adapter-pg';
import { readConfig, reportStartupFailure } from '@apptit/runtime';
import { PrismaClient } from './generated/prisma/client.js';
async function seed(): Promise<void> {
  const config = readConfig('kitchen');
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: config.databaseUrl!, connectionTimeoutMillis: config.internalTimeoutMs }) });
  try {
    const payload = { mode: 'synthetic', service: 'kitchen', data: { products: [{ id: 'fixture-rice-a', name: 'Synthetic rice', site: 'fixture-site-a' }], stockEnabled: false } };
    await db.runtimeFixture.upsert({ where: { id: 'synthetic-runtime-v1' }, create: { id: 'synthetic-runtime-v1', payload }, update: { payload } });
    console.log('Synthetic kitchen runtime fixture seeded; no operational feature enabled.');
  } finally { await db.$disconnect(); }
}
seed().catch(error => { reportStartupFailure('kitchen seed', error); process.exitCode = 1; });
