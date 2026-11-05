import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../../services/kitchen/dist/generated/prisma/client.js';
import { PrismaQuantityDraftRepository } from '../../services/kitchen/dist/infra/prisma/prisma-quantity-draft.repository.js';
import { QuantityDraftApplication } from '../../services/kitchen/dist/application/quantity-draft.application.js';
import { readConfig } from '../../packages/runtime/dist/index.js';
const require = createRequire(new URL('../../services/kitchen/package.json', import.meta.url));
const { PrismaPg } = require('@prisma/adapter-pg');
const config = readConfig('kitchen');
const client = () => new PrismaClient({ adapter: new PrismaPg({ connectionString: config.databaseUrl, connectionTimeoutMillis: 3000 }) });
function context() {
  return { actor: { userId: randomUUID(), nameAtAction: 'Synthetic Chef' }, scope: { tenantId: randomUUID(), siteId: randomUUID() }, siteTimeZone: 'Europe/Paris', sessionId: randomUUID(), correlationId: randomUUID(), capabilities: ['quantity-draft.read', 'quantity-draft.write'] };
}
const unknown = { state: 'unknown', reason: 'Not observed' };
function data(amount = '0') {
  return { label: 'Synthetic quantity draft', quantity: { state: 'known', quality: 'measured', sourceRef: 'fixture/scales', value: { amount, unit: 'g', basis: 'raw_net', resolution: '0.000000001' } },
    expiry: { state: 'known', quality: 'imported', sourceRef: 'fixture/label', value: { kind: 'best_before', date: '2026-03-29', sourceRef: 'fixture/photo' } },
    observedAt: { state: 'known', quality: 'measured', sourceRef: 'fixture/operator', value: '2026-03-28T23:30:00.000Z' } };
}
function command(ctx, payload = data()) { return { id: randomUUID(), scope: ctx.scope, expectedVersion: 0, data: payload }; }

test('round-trip exact maximum/zero/unknown data, immutable author snapshots and read from a fresh connection', async () => {
  const db = client();
  const reopened = client();
  try {
    const app = new QuantityDraftApplication(new PrismaQuantityDraftRepository(db), () => new Date('2026-11-04T12:00:00Z'));
    const ctx = context();
    const input = command(ctx, data('999999999999999.999999999'));
    const created = await app.save(input, ctx);
    assert.equal(created.ok, true);
    assert.equal(created.value.version, 1);
    assert.deepEqual(created.value.data, input.data);
    const renamed = { ...ctx, actor: { ...ctx.actor, nameAtAction: 'Synthetic Chef Renamed' }, correlationId: randomUUID() };
    const changed = await app.save({ ...input, expectedVersion: 1, data: data() }, renamed);
    assert.equal(changed.ok, true);
    assert.equal(changed.value.data.quantity.value.amount, '0');
    assert.equal(changed.value.createdBy.nameAtAction, 'Synthetic Chef');
    assert.equal(changed.value.updatedBy.nameAtAction, 'Synthetic Chef Renamed');
    const allUnknown = { label: 'Explicit unknowns', quantity: unknown, expiry: unknown, observedAt: unknown };
    const last = await app.save({ ...input, expectedVersion: 2, data: allUnknown }, renamed);
    assert.equal(last.ok, true);
    const readAfterReopen = await new QuantityDraftApplication(new PrismaQuantityDraftRepository(reopened)).find(input.id, renamed);
    assert.deepEqual(readAfterReopen.value, last.value);
    const history = await app.history(input.id, ctx);
    assert.equal(history.value.length, 3);
    assert.equal(history.value[0].before, null);
    assert.deepEqual(history.value[1].before, created.value);
    assert.deepEqual(history.value[1].after, changed.value);
    assert.equal(history.value[0].actor.nameAtAction, 'Synthetic Chef');
    assert.equal(history.value[0].sessionId, ctx.sessionId);
    assert.equal(history.value[0].after.data.expiry.value.date, '2026-03-29');
    assert.equal(history.value[0].after.data.observedAt.value, '2026-03-28T23:30:00.000Z');
    await assert.rejects(db.quantityDraftRevision.update({ where: { draftId_version: { draftId: input.id, version: 1 } }, data: { actorName: 'Overwritten' } }));
    await assert.rejects(db.quantityDraftRevision.delete({ where: { draftId_version: { draftId: input.id, version: 1 } } }));
    assert.equal((await app.history(input.id, ctx)).value[0].actor.nameAtAction, 'Synthetic Chef');
  } finally { await db.$disconnect(); await reopened.$disconnect(); }
});
test('missing trusted principal, wrong capability/scope, forged metadata and foreign resource IDs cannot write/read another site', async () => {
  const db = client();
  try {
    const app = new QuantityDraftApplication(new PrismaQuantityDraftRepository(db));
    const ctx = context();
    const input = command(ctx);
    assert.equal((await app.save(input)).error.code, 'UNAUTHENTICATED');
    assert.equal((await app.save(input, { ...ctx, capabilities: ['quantity-draft.read'] })).error.code, 'FORBIDDEN');
    assert.equal((await app.save({ ...input, scope: context().scope }, ctx)).error.code, 'FORBIDDEN');
    assert.equal((await app.save({ ...input, actorId: randomUUID() }, ctx)).error.code, 'INVALID_INPUT');
    assert.equal((await app.save(input, ctx)).ok, true);
    const otherSite = { ...ctx, scope: { ...ctx.scope, siteId: randomUUID() } };
    const otherTenant = { ...ctx, scope: { tenantId: randomUUID(), siteId: ctx.scope.siteId } };
    for (const foreign of [otherSite, otherTenant]) {
      assert.equal((await app.find(input.id, foreign)).error.code, 'NOT_FOUND');
      assert.equal((await app.history(input.id, foreign)).error.code, 'NOT_FOUND');
      assert.equal((await app.save({ ...input, scope: foreign.scope, expectedVersion: 1 }, foreign)).error.code, 'NOT_FOUND');
      assert.equal((await app.save({ ...input, scope: foreign.scope }, foreign)).error.code, 'NOT_FOUND');
    }
    assert.equal((await app.history(input.id, ctx)).value.length, 1);
  } finally { await db.$disconnect(); }
});
test('two simultaneous updates of one version produce one winner and one conflict, with no extra revision', async () => {
  const db = client();
  const competing = client();
  try {
    const ctx = context();
    const app = new QuantityDraftApplication(new PrismaQuantityDraftRepository(db));
    const otherApp = new QuantityDraftApplication(new PrismaQuantityDraftRepository(competing));
    const input = command(ctx);
    assert.equal((await app.save(input, ctx)).ok, true);
    const outcomes = await Promise.all([
      app.save({ ...input, expectedVersion: 1, data: data('3') }, ctx),
      otherApp.save({ ...input, expectedVersion: 1, data: data('7') }, { ...ctx, correlationId: randomUUID() }),
    ]);
    assert.equal(outcomes.filter(result => result.ok).length, 1);
    assert.equal(outcomes.find(result => !result.ok).error.code, 'VERSION_CONFLICT');
    assert.deepEqual((await app.find(input.id, ctx)).value, outcomes.find(result => result.ok).value);
    assert.equal((await app.history(input.id, ctx)).value.length, 2);
    assert.equal((await app.save({ ...input, expectedVersion: 1 }, ctx)).error.code, 'VERSION_CONFLICT');
    assert.equal((await app.save({ ...input, expectedVersion: 0 }, ctx)).error.code, 'VERSION_CONFLICT');
  } finally { await db.$disconnect(); await competing.$disconnect(); }
});
test('audit-write failure rolls back a real draft update and returns no fabricated save', async () => {
  const db = client();
  try {
    const ctx = context();
    const input = command(ctx);
    const app = new QuantityDraftApplication(new PrismaQuantityDraftRepository(db));
    const original = await app.save(input, ctx);
    assert.equal(original.ok, true);
    // Fault injection only at the audit write; the draft update still runs against PostgreSQL.
    const faulted = db.$extends({ query: { quantityDraftRevision: { create() { throw new Error('Synthetic audit failure'); } } } });
    const failedApp = new QuantityDraftApplication(new PrismaQuantityDraftRepository(faulted));
    assert.equal((await failedApp.save({ ...input, expectedVersion: 1, data: data('20') }, ctx)).error.code, 'DEPENDENCY_UNAVAILABLE');
    assert.deepEqual((await app.find(input.id, ctx)).value, original.value);
    assert.equal((await app.history(input.id, ctx)).value.length, 1);
    const newInput = command(ctx);
    assert.equal((await failedApp.save(newInput, ctx)).error.code, 'DEPENDENCY_UNAVAILABLE');
    assert.equal((await app.find(newInput.id, ctx)).error.code, 'NOT_FOUND');
  } finally { await db.$disconnect(); }
});
test('invalid unit/precision/date/state returns recoverable issues before writing', async () => {
  const db = client();
  try {
    const app = new QuantityDraftApplication(new PrismaQuantityDraftRepository(db));
    const ctx = context();
    for (const change of [
      payload => { payload.quantity.value.unit = 'kg'; },
      payload => { payload.quantity.value.amount = '1.0000000001'; },
      payload => { payload.expiry.value.date = '2026-02-30'; },
      payload => { payload.quantity = { ...unknown, value: '0' }; },
    ]) {
      const payload = data(); change(payload);
      const input = command(ctx, payload);
      const result = await app.save(input, ctx);
      assert.equal(result.error.code, 'INVALID_INPUT');
      assert.equal(result.error.retry, 'after_review');
      assert.ok(result.error.issues[0].field);
      assert.equal((await app.find(input.id, ctx)).error.code, 'NOT_FOUND');
    }
  } finally { await db.$disconnect(); }
});

test('versioned migration chain builds the same storage from empty schema without changing existing records', async () => {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: config.databaseUrl, connectionTimeoutMillis: 3000 });
  const connection = await pool.connect();
  const schema = 'sp103_' + randomUUID().replaceAll('-', '');
  try {
    await connection.query(`CREATE SCHEMA "${schema}"`);
    await connection.query(`SET search_path TO "${schema}", pg_catalog`);
    for (const directory of ['202611040001_runtime_fixture', '202611040002_quantity_draft']) {
      const sql = readFileSync(new URL(`../../services/kitchen/prisma/migrations/${directory}/migration.sql`, import.meta.url), 'utf8');
      await connection.query(sql);
    }
    const tables = await connection.query('SELECT tablename FROM pg_tables WHERE schemaname=$1 ORDER BY tablename', [schema]);
    assert.deepEqual(tables.rows.map(row => row.tablename), ['QuantityDraft', 'QuantityDraftRevision', 'RuntimeFixture']);
    const decimalType = await connection.query("SELECT numeric_precision, numeric_scale FROM information_schema.columns WHERE table_schema=$1 AND table_name='QuantityDraft' AND column_name='amount'", [schema]);
    assert.equal(decimalType.rows[0].numeric_precision, 24);
    assert.equal(decimalType.rows[0].numeric_scale, 9);
    const dateType = await connection.query("SELECT data_type FROM information_schema.columns WHERE table_schema=$1 AND table_name='QuantityDraft' AND column_name='expiryDate'", [schema]);
    assert.equal(dateType.rows[0].data_type, 'date');
  } finally {
    await connection.query('ROLLBACK');
    await connection.query('SET search_path TO public');
    // Only the unique disposable schema created by this test is removed.
    await connection.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    connection.release();
    await pool.end();
  }
});
