import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { readConfig } from '@apptit/runtime';
import { accessSmoke } from '../scripts/access-smoke.mjs';
const require = createRequire(new URL('../services/kitchen/package.json', import.meta.url)); const { Pool } = require('pg');
const gateway = readConfig('gateway-api'), web = readConfig('web'), kitchen = readConfig('kitchen');
const db = new Pool({ connectionString: kitchen.databaseUrl, connectionTimeoutMillis: 3000 });
function redact(message) { for (const [key, value] of Object.entries(process.env)) if (/PASSWORD|TOKEN|SECRET|DATABASE_URL/.test(key) && value) message = message.replaceAll(value, '[redacted]'); return message; }
async function counts() {
  const tables = (await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename ~* '(stock|ledger|movement|reservation|balance)' ORDER BY tablename")).rows;
  const values = {};
  for (const { tablename } of tables) { assert.match(tablename, /^[A-Za-z0-9_]+$/); values[tablename] = (await db.query(`SELECT count(*)::text AS count FROM "${tablename}"`)).rows[0].count; }
  return values;
}
try {
  assert.equal((await fetch(web.webOrigin)).status, 200);
  const before = await counts(); const fixture = (await db.query('SELECT payload FROM "RuntimeFixture" WHERE id=$1', ['synthetic-runtime-v1'])).rows[0].payload;
  assert.equal(fixture.data.stockEnabled, false);
  const cookies = new Map();
  async function request(route, init = {}) {
    const response = await fetch(web.webOrigin + route, { redirect: 'manual', ...init, headers: { cookie: [...cookies].map(([name, value]) => `${name}=${value}`).join('; '), ...init.headers } });
    for (const header of response.headers.getSetCookie()) { const pair = header.split(';')[0], index = pair.indexOf('='); cookies.set(pair.slice(0, index), pair.slice(index + 1)); }
    return response;
  }
  async function post(route, input) { const bootstrap = await request('/api/session/csrf'); const { csrfToken } = await bootstrap.json(); return request(route, { method: 'POST', headers: { 'content-type': 'application/json', origin: web.webOrigin, 'x-csrf-token': csrfToken }, body: JSON.stringify(input) }); }
  const login = await post('/api/session/login', { login: 'stock.a@apptit.test', password: process.env.FIXTURE_STOREKEEPER_A_PASSWORD }); assert.ok(login.ok); const profile = await login.json();
  const scope = { tenantId: profile.selectedSite.tenantId, siteId: profile.selectedSite.siteId }, unknown = { state: 'unknown', reason: 'Synthetic container probe — not observed' };
  const line = { id: randomUUID(), product: { productId: randomUUID(), presentationId: randomUUID(), presentationVersion: 1 }, batch: { id: randomUUID(), code: unknown, expiry: unknown }, received: unknown, disposition: unknown, destinationLocationId: unknown, evidenceIds: [] };
  const receiptId = randomUUID(); const saved = await post('/api/receipts/save', { command: { schemaVersion: 1, scope, operationId: randomUUID(), receiptId, expectedVersion: 0, payload: { supplierReference: unknown, receivedAt: unknown, lines: [line] } }, items: [{ lineId: line.id, name: 'Container synthetic draft', presentation: 'No actual goods', barcode: null, physicalMatch: false, pack: null }] });
  assert.ok(saved.ok); const draft = await saved.json(); assert.equal(draft.draft.state, 'draft'); assert.equal(draft.draft.data.lines[0].disposition.state, 'unknown');
  const sp205 = existsSync(new URL('../services/kitchen/dist/application/receiving-observations.js', import.meta.url));
  if (sp205) {
    const observed = await post('/api/observations/save', { schemaVersion: 1, scope, id: randomUUID(), operationId: randomUUID(), expectedVersion: 0, expectedReceiptVersion: 1, target: { receiptId, lineId: line.id, productId: line.product.productId, presentationId: line.product.presentationId, batchId: line.batch.id }, profile: { id: 'fixture-chilled-receiving', version: 1 }, data: { temperature: { state: 'pending', reason: 'No actual thermometer reading' }, condition: { state: 'pending', reason: 'Not observed' }, notes: null }, correctionReason: null });
    assert.ok(observed.ok); const value = await observed.json(); assert.equal(value.assessment.overall, 'pending'); assert.equal(value.disposition, 'not_activated'); assert.equal(value.profile.synthetic, true); assert.equal(value.profile.validatedForOperation, false);
  }
  const unavailable = await accessSmoke(gateway, web);
  assert.deepEqual(await counts(), before);
  console.log(JSON.stringify({ phase: 'ready', web: 200, draftState: 'draft', sp205InImage: sp205, observationStaysPending: sp205, stockFlagFalse: true, inventoryCountsUnchanged: true, inheritedAccessSmoke: true }));
  process.stdin.resume(); await new Promise(resolve => process.stdin.once('data', resolve));
  assert.equal((await fetch(`${gateway.gatewayOrigin}/health/ready`)).status, 503); await unavailable();
  console.log(JSON.stringify({ phase: 'complete', dependencyFailureVerified: true, passed: true }));
} catch (error) { console.error(redact(error.message)); process.exitCode = 1; }
finally { await db.end(); process.stdin.pause(); }
