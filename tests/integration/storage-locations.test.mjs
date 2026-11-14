import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { PrismaClient } from '../../services/kitchen/dist/generated/prisma/client.js';
import { StorageLocations, storageLock } from '../../services/kitchen/dist/application/storage-locations.js';
import { ReceiptWorkspace } from '../../services/kitchen/dist/application/receipt-workspace.js';
import { readConfig } from '../../packages/runtime/dist/index.js';
const require = createRequire(new URL('../../services/kitchen/package.json', import.meta.url)), { PrismaPg } = require('@prisma/adapter-pg');
const connect = () => new PrismaClient({ adapter: new PrismaPg({ connectionString: readConfig('kitchen').databaseUrl, connectionTimeoutMillis: 3000 }) });
const unknown = { state: 'unknown', reason: 'Synthetic pending' }, known = value => ({ state: 'known', value, quality: 'estimated', sourceRef: 'operator/label' });
const context = () => ({ scope: { tenantId: randomUUID(), siteId: randomUUID() }, actor: { userId: randomUUID(), nameAtAction: 'Synthetic chef' }, sessionId: randomUUID(), correlationId: randomUUID(), capabilities: ['receipt.draft.read', 'receipt.draft.write', 'storage.location.manage'], siteTimeZone: 'Europe/Paris' });
const location = (ctx, name = 'Chambre BOF 1', category = 'cold_bof') => ({ scope: ctx.scope, id: randomUUID(), expectedVersion: 0, name, category, isActive: true });
function receipt(ctx, destinations) {
 const lines = destinations.map(id => ({ id: randomUUID(), product: { productId: randomUUID(), presentationId: randomUUID(), presentationVersion: 1 }, batch: { id: randomUUID(), code: unknown, expiry: unknown }, received: unknown, disposition: unknown, destinationLocationId: id ? known(id) : unknown, evidenceIds: [] }));
 return { command: { schemaVersion: 1, operationId: randomUUID(), receiptId: randomUUID(), scope: ctx.scope, expectedVersion: 0, payload: { supplierReference: unknown, receivedAt: unknown, lines } }, items: lines.map(line => ({ lineId: line.id, name: 'Synthetic reference', presentation: 'Reference pack', barcode: null, physicalMatch: false, pack: null })) };
}
test('chef configures multiple distinct rooms/economats with closed categories, optimistic versions and scoped immutable audit', async () => {
 const db = connect(); try {
  const ctx = context(), app = new StorageLocations(db), input = location(ctx); const a = await app.save(input, ctx); assert.deepEqual(await app.save(input, ctx), a);
  await app.save(location(ctx, 'Chambre BOF 2'), ctx); await app.save(location(ctx, 'Économat 1', 'dry'), ctx); await app.save(location(ctx, 'Économat 2', 'dry'), ctx);
  const listed = await app.list({ scope: ctx.scope }, ctx); assert.equal(listed.length, 4); assert.equal(new Set(listed.map(row => row.id)).size, 4); assert.equal(listed.filter(row => row.category === 'cold_bof').length, 2);
  await assert.rejects(app.save({ ...location(ctx), category: 'freezer' }, ctx), error => error.code === 'INVALID_INPUT');
  await assert.rejects(app.save(location(ctx), { ...ctx, capabilities: ['receipt.draft.write'] }), error => error.code === 'FORBIDDEN');
  const foreign = context(); await assert.rejects(app.list({ scope: ctx.scope }, foreign), error => error.code === 'FORBIDDEN'); await assert.rejects(app.save({ ...input, expectedVersion: 1 }, foreign), error => error.code === 'FORBIDDEN');
  for (const scope of [{ tenantId: ctx.scope.tenantId, siteId: randomUUID() }, { tenantId: randomUUID(), siteId: ctx.scope.siteId }]) assert.deepEqual(await app.list({ scope }, { ...ctx, scope }), []);
  const updated = await app.save({ ...input, expectedVersion: 1, name: 'Chambre BOF renommée' }, ctx); assert.equal(updated.version, 2);
  await assert.rejects(app.save({ ...input, expectedVersion: 1 }, ctx), error => error.code === 'VERSION_CONFLICT');
  assert.equal(await db.receiptLocationRevision.count({ where: { locationId: a.id } }), 2); const audit = await db.receiptLocationRevision.findFirst({ where: { locationId: a.id, version: 2 } }); assert.equal(audit.actorId, ctx.actor.userId); assert.equal(audit.before.name, input.name);
  await assert.rejects(db.receiptLocationRevision.updateMany({ where: { locationId: a.id }, data: { actorId: randomUUID() } }));
  await assert.rejects(db.receiptLocation.create({ data: { id: randomUUID(), ...ctx.scope, name: 'Invalid database category', category: 'rogue' } }));
 } finally { await db.$disconnect(); }
});
test('per-line physical destinations survive reopen/rename and inactive/foreign choices never write a receipt revision', async () => {
 const db = connect(); try {
  const ctx = context(), config = new StorageLocations(db), app = new ReceiptWorkspace(db), a = await config.save(location(ctx), ctx), b = await config.save(location(ctx, 'Chambre BOF 2'), ctx);
  const input = receipt(ctx, [a.id, b.id]), saved = await app.save(input, ctx); assert.deepEqual(saved.items.map(item => item.destinationSnapshot.id), [a.id, b.id]);
  await config.save({ ...location(ctx), id: a.id, expectedVersion: 1, name: 'Renamed current room' }, ctx);
  assert.equal((await app.read({ scope: ctx.scope, id: saved.draft.id }, ctx)).items[0].destinationSnapshot.name, 'Chambre BOF 1');
  const next = structuredClone(input); next.command.expectedVersion = 1; next.command.operationId = randomUUID(); const v2 = await app.save(next, ctx); assert.equal(v2.items[0].destinationSnapshot.name, 'Chambre BOF 1');
  await config.save({ ...location(ctx, b.name), id: b.id, expectedVersion: 1, isActive: false }, ctx);
  assert.deepEqual((await app.locations({ scope: ctx.scope }, ctx)).map(row => row.id), [a.id]);
  const invalid = structuredClone(next); invalid.command.expectedVersion = 2; invalid.command.operationId = randomUUID(); await assert.rejects(app.save(invalid, ctx), error => error.code === 'INVALID_DESTINATION');
  for (const scope of [{ tenantId: ctx.scope.tenantId, siteId: randomUUID() }, { tenantId: randomUUID(), siteId: ctx.scope.siteId }]) {
   const other = await db.receiptLocation.create({ data: { id: randomUUID(), ...scope, name: 'Foreign location', category: 'dry' } }); const forged = receipt(ctx, [other.id]); await assert.rejects(app.save(forged, ctx), error => error.code === 'INVALID_DESTINATION'); assert.equal(await db.receiptDraft.count({ where: { id: forged.command.receiptId } }), 0);
  }
  assert.equal(await db.receiptDraftRevision.count({ where: { receiptId: saved.draft.id } }), 2);
 } finally { await db.$disconnect(); }
});
test('legacy raw destinations remain readable and are retained on explicit replacement; historical finalized fixture is read-only', async () => {
 const db = connect(); try {
  const ctx = context(), app = new ReceiptWorkspace(db), input = receipt(ctx, []); const lineInput = receipt(ctx, [null]);
  lineInput.command.payload.lines[0].destinationLocationId = known('Ancienne réserve libre non associable');
  const old = { draft: { id: lineInput.command.receiptId, scope: ctx.scope, version: 1, state: 'draft', data: lineInput.command.payload, createdBy: ctx.actor, updatedBy: ctx.actor, recordedAt: new Date().toISOString() }, items: lineInput.items };
  await db.receiptDraft.create({ data: { id: old.draft.id, ...ctx.scope, version: 1, snapshot: old, recordedAt: new Date() } });
  assert.equal((await app.read({ scope: ctx.scope, id: old.draft.id }, ctx)).draft.data.lines[0].destinationLocationId.value, 'Ancienne réserve libre non associable');
  const room = await new StorageLocations(db).save(location(ctx), ctx); lineInput.command.expectedVersion = 1; lineInput.command.payload.lines[0].destinationLocationId = known(room.id);
  const replaced = await app.save(lineInput, ctx); assert.equal(replaced.items[0].legacyDestination, 'Ancienne réserve libre non associable');
  const finalized = { ...old, draft: { ...old.draft, id: input.command.receiptId, state: 'finalized', data: replaced.draft.data } }; await db.receiptDraft.create({ data: { id: finalized.draft.id, ...ctx.scope, version: 1, snapshot: finalized, recordedAt: new Date() } });
  const read = await app.read({ scope: ctx.scope, id: finalized.draft.id }, ctx); assert.equal(read.readOnly, true); assert.equal(read.draft.state, 'finalized'); assert.equal(read.draft.data.lines[0].destinationLocationId.value, room.id);
  const attempt = structuredClone(lineInput); attempt.command.receiptId = finalized.draft.id; attempt.command.expectedVersion = 1; attempt.command.operationId = randomUUID(); await assert.rejects(app.save(attempt, ctx), error => error.code === 'RECEIPT_READ_ONLY');
 } finally { await db.$disconnect(); }
});
test('destination save serializes with deactivation across real PostgreSQL connections', async () => {
 const db = connect(), other = connect(); try {
  const ctx = context(), row = await new StorageLocations(db).save(location(ctx), ctx); let release, locked; const gate = new Promise(resolve => { release = resolve; }), ready = new Promise(resolve => { locked = resolve; });
  const deactivate = other.$transaction(async tx => { await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${storageLock(ctx.scope.tenantId, ctx.scope.siteId)},0))`; await tx.receiptLocation.update({ where: { id: row.id }, data: { isActive: false } }); locked(); await gate; });
  await ready; const pending = new ReceiptWorkspace(db).save(receipt(ctx, [row.id]), ctx); const outcome = assert.rejects(pending, error => error.code === 'INVALID_DESTINATION'); release(); await deactivate; await outcome;
 } finally { await db.$disconnect(); await other.$disconnect(); }
});
