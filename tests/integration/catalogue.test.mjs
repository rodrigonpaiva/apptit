import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { PrismaClient } from '../../services/kitchen/dist/generated/prisma/client.js';
import { CatalogueRepository } from '../../services/kitchen/dist/infra/prisma/catalogue.repository.js';
import { readConfig } from '../../packages/runtime/dist/index.js';
const require = createRequire(new URL('../../services/kitchen/package.json', import.meta.url));
const { PrismaPg } = require('@prisma/adapter-pg');
const settings = readConfig('kitchen');
const connect = () => new PrismaClient({ adapter: new PrismaPg({ connectionString: settings.databaseUrl, connectionTimeoutMillis: 3000 }) });
const context = scope => ({ scope, capabilities: ['catalogue.read'] });
test('catalogue read keeps both scope IDs, textual leading zeros and a real empty state; missing capability is denied', async () => {
  const db = connect();
  const a = { tenantId: randomUUID(), siteId: randomUUID() };
  const b = { tenantId: randomUUID(), siteId: randomUUID() };
  try {
    const id = randomUUID();
    await db.catalogueProduct.createMany({ data: [
      { id, ...a, name: 'Synthetic A', presentation: 'Bag of 5 kg reference only', barcode: '0000012345678' },
      { id: randomUUID(), ...b, name: 'Synthetic B', presentation: 'Bulk', barcode: null },
    ] });
    const repository = new CatalogueRepository(db);
    const result = await repository.list(context(a));
    assert.deepEqual(result, { items: [{ id, name: 'Synthetic A', presentation: 'Bag of 5 kg reference only', barcode: '0000012345678', imageUrl: null }], hasMore: false });
    assert.equal((await repository.list(context(b))).items[0].barcode, null);
    for (const scope of [{ tenantId: a.tenantId, siteId: b.siteId }, { tenantId: b.tenantId, siteId: a.siteId }, { tenantId: randomUUID(), siteId: randomUUID() }]) {
      assert.deepEqual(await repository.list(context(scope)), { items: [], hasMore: false });
    }
    await assert.rejects(repository.list({ scope: a, capabilities: ['site.read'] }), error => error.code === 'FORBIDDEN');
  } finally { await db.$disconnect(); }
});
test('catalogue read is bounded, deterministic and reports truncation rather than claiming completeness', async () => {
  const db = connect();
  const scope = { tenantId: randomUUID(), siteId: randomUUID() };
  try {
    await db.catalogueProduct.createMany({ data: Array.from({ length: 101 }, (_, index) => ({ id: randomUUID(), ...scope, name: `Synthetic ${String(index).padStart(3, '0')}`, presentation: 'Bulk reference', barcode: null })) });
    const page = await new CatalogueRepository(db).list(context(scope));
    assert.equal(page.items.length, 100);
    assert.equal(page.hasMore, true);
    assert.equal(page.items[0].name, 'Synthetic 000');
    assert.equal(page.items[99].name, 'Synthetic 099');
  } finally { await db.$disconnect(); }
});
