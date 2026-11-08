import { PrismaPg } from '@prisma/adapter-pg';
import { readConfig, reportStartupFailure } from '@apptit/runtime';
import { PrismaClient } from './generated/prisma/client.js';
import { catalogueFixtures } from './catalogue-fixtures.js';
async function seed(): Promise<void> {
  const config = readConfig('kitchen');
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: config.databaseUrl!, connectionTimeoutMillis: config.internalTimeoutMs }) });
  try {
    for (const product of catalogueFixtures) await db.catalogueProduct.upsert({ where: { id: product.id }, create: product, update: {} });
    const scopes = [...new Map(catalogueFixtures.map(product => [product.siteId, { tenantId: product.tenantId, siteId: product.siteId }])).values()];
    for (const [index, scope] of scopes.entries()) for (const [offset, name] of ['Réserve synthétique', 'Cuisine synthétique'].entries()) {
      const location = { id: `60000000-0000-4000-8000-${String(index * 2 + offset + 1).padStart(12, '0')}`, ...scope, name };
      await db.receiptLocation.upsert({ where: { id: location.id }, create: location, update: {} });
    }
    const payload = { mode: 'synthetic', service: 'kitchen', data: { products: [{ id: 'fixture-rice-a', name: 'Synthetic rice', site: 'fixture-site-a' }], stockEnabled: false } };
    await db.runtimeFixture.upsert({ where: { id: 'synthetic-runtime-v1' }, create: { id: 'synthetic-runtime-v1', payload }, update: { payload } });
    console.log('Synthetic kitchen runtime fixture seeded; no operational feature enabled.');
  } finally { await db.$disconnect(); }
}
seed().catch(error => { reportStartupFailure('kitchen seed', error); process.exitCode = 1; });
