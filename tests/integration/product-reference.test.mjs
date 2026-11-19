import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { PrismaClient } from '../../services/kitchen/dist/generated/prisma/client.js';
import { ProductReferences, validateProductReference } from '../../services/kitchen/dist/application/product-reference.js';
import { ReceiptWorkspace } from '../../services/kitchen/dist/application/receipt-workspace.js';
import { CatalogueRepository } from '../../services/kitchen/dist/infra/prisma/catalogue.repository.js';
import { readConfig } from '../../packages/runtime/dist/index.js';
const require = createRequire(new URL('../../services/kitchen/package.json', import.meta.url)), { PrismaPg } = require('@prisma/adapter-pg');
const connect = () => new PrismaClient({ adapter: new PrismaPg({ connectionString: readConfig('kitchen').databaseUrl, connectionTimeoutMillis: 3000 }) });
const context = () => ({ scope: { tenantId: randomUUID(), siteId: randomUUID() }, actor: { userId: randomUUID(), nameAtAction: 'Synthetic receiver' }, sessionId: randomUUID(), correlationId: randomUUID(), capabilities: ['receipt.draft.read','receipt.draft.write','catalogue.read'], siteTimeZone: 'Europe/Paris' });
const request = (ctx, barcode = '0012345678905') => ({ scope: ctx.scope, operationId: randomUUID(), selection: null, name: 'Synthetic rice', presentation: '5 kg bag', barcode });
const unknown = { state: 'unknown', reason: 'Synthetic pending' };
function receipt(ctx, reference, barcode = '0012345678905') {
 const lineId = randomUUID();
 return { command: { schemaVersion: 1, operationId: randomUUID(), scope: ctx.scope, receiptId: randomUUID(), expectedVersion: 0, payload: { supplierReference: unknown, receivedAt: unknown, lines: [{ id: lineId, product: reference ?? { productId: randomUUID(), presentationId: randomUUID(), presentationVersion: 1 }, batch: { id: randomUUID(), code: unknown, expiry: unknown }, received: unknown, disposition: unknown, destinationLocationId: unknown, evidenceIds: [] }] } }, items: [{ lineId, name: 'Observed product', presentation: 'Observed package', barcode, physicalMatch: false, pack: null, ...(reference ? { catalogueReference: reference } : {}) }] };
}
test('persistent reference resolution is retry-safe and concurrent same-code receipts reuse one unreviewed identity', async () => {
 const db = connect(), other = connect(); try {
  const ctx = context(), app = new ProductReferences(db), input = request(ctx);
  const [a,b] = await Promise.all([app.resolve(input,ctx),new ProductReferences(other).resolve({ ...input, operationId: randomUUID() },ctx)]);
  assert.deepEqual(a,b); assert.notEqual(a.reference.productId,a.reference.presentationId); assert.equal(a.reviewState,'unreviewed'); assert.deepEqual(await app.resolve(input,ctx),a);
  await assert.rejects(app.resolve({ ...input, presentation:'Changed payload' },ctx), e=>e.code==='IDEMPOTENCY_MISMATCH');
  assert.equal(await db.catalogueProduct.count({where:ctx.scope}),1); assert.equal(await db.productPresentation.count({where:ctx.scope}),1); assert.equal(await db.productReferenceOperation.count({where:ctx.scope}),2);
  const audit=await db.productReferenceOperation.findFirst({where:ctx.scope}); assert.equal(audit.actorId,ctx.actor.userId); assert.equal(audit.sessionId,ctx.sessionId);
  await assert.rejects(db.productReferenceOperation.deleteMany({where:ctx.scope}));
  await assert.rejects(db.productPresentation.delete({where:{id:a.reference.presentationId}}));
  await assert.rejects(db.productPresentation.update({where:{id:a.reference.presentationId},data:{id:randomUUID()}}));
  const receipts = new ReceiptWorkspace(db), first = await receipts.save(receipt(ctx,a.reference),ctx), second = await receipts.save(receipt(ctx,b.reference),ctx);
  assert.deepEqual(first.draft.data.lines[0].product,second.draft.data.lines[0].product); assert.notEqual(first.draft.data.lines[0].batch.id,second.draft.data.lines[0].batch.id); assert.equal(first.items[0].identityState,'linked'); assert.equal(first.draft.state,'draft');
  assert.deepEqual(await receipts.read({scope:ctx.scope,id:first.draft.id},ctx),first);
 } finally {await db.$disconnect();await other.$disconnect();}
});
test('bulk identity requires explicit reuse and ambiguous/changed references never merge by name or barcode alone',async()=>{
 const db=connect();try{
  const ctx=context(),app=new ProductReferences(db),a=await app.resolve(request(ctx,null),ctx),b=await app.resolve(request(ctx,null),ctx);assert.notDeepEqual(a.reference,b.reference);
  assert.deepEqual(await app.resolve({...request(ctx,null),selection:a.reference},ctx),a);
  const code=request(ctx),c=await app.resolve(code,ctx);
  await assert.rejects(app.resolve({...code,operationId:randomUUID(),presentation:'Different nominal pack'},ctx),e=>e.code==='REFERENCE_SELECTION_REQUIRED');
  const sibling=await db.productPresentation.create({data:{id:randomUUID(),...ctx.scope,productId:c.reference.productId,label:'Another presentation',barcode:code.barcode}});
  await assert.rejects(app.resolve({...code,operationId:randomUUID()},ctx),e=>e.code==='REFERENCE_SELECTION_REQUIRED');
  assert.deepEqual((await app.resolve({...code,operationId:randomUUID(),selection:c.reference},ctx)).reference,c.reference);
  const page=await new CatalogueRepository(db).list(ctx);assert.ok(page.items.some(row=>row.reference?.presentationId===sibling.id));assert.equal(page.items.filter(row=>row.id===c.reference.productId).length,2);
 }finally{await db.$disconnect();}
});
test('resolver and receipt save deny wrong tenant/site/product pairing, inactive/version changes and missing capability',async()=>{
 const db=connect();try{
  const ctx=context(),app=new ProductReferences(db),input=request(ctx),resolved=await app.resolve(input,ctx),ref=resolved.reference,receipts=new ReceiptWorkspace(db);
  await assert.rejects(app.resolve(request(ctx),{...ctx,capabilities:['catalogue.read']}),e=>e.code==='FORBIDDEN');
  for(const scope of [{tenantId:ctx.scope.tenantId,siteId:randomUUID()},{tenantId:randomUUID(),siteId:ctx.scope.siteId}]){
   const foreign={...ctx,scope};await assert.rejects(app.resolve({...input,scope,operationId:randomUUID(),selection:ref},foreign),e=>e.code==='INVALID_REFERENCE');
   const forged=receipt(foreign,ref);await assert.rejects(receipts.save(forged,foreign),e=>e.code==='INVALID_REFERENCE');assert.equal(await db.receiptDraft.count({where:{id:forged.command.receiptId}}),0);
  }
  await assert.rejects(app.resolve({...input,operationId:randomUUID(),selection:{...ref,productId:randomUUID()}},ctx),e=>e.code==='INVALID_REFERENCE');
  await assert.rejects(receipts.save(receipt(ctx,ref,'0000000000123'),ctx),e=>e.code==='REFERENCE_MISMATCH');
  await db.productPresentation.update({where:{id:ref.presentationId},data:{version:2}});
  await assert.rejects(receipts.save(receipt(ctx,ref),ctx),e=>e.code==='REFERENCE_VERSION_CONFLICT');
  await db.productPresentation.update({where:{id:ref.presentationId},data:{version:1,isActive:false}});
  await assert.rejects(receipts.save(receipt(ctx,ref),ctx),e=>e.code==='INVALID_REFERENCE');await assert.rejects(app.resolve({...input,operationId:randomUUID()},ctx),e=>e.code==='INVALID_REFERENCE');
  await db.productPresentation.update({where:{id:ref.presentationId},data:{isActive:true}});await db.catalogueProduct.update({where:{id:ref.productId},data:{isActive:false}});
  await assert.rejects(receipts.save(receipt(ctx,ref),ctx),e=>e.code==='INVALID_REFERENCE');
  await assert.rejects(db.productPresentation.create({data:{id:randomUUID(),productId:ref.productId,tenantId:randomUUID(),siteId:ctx.scope.siteId,label:'Foreign FK'}}));
 }finally{await db.$disconnect();}
});
test('legacy drafts stay unresolved until explicitly linked without rewriting original IDs or allowing rebinding',async()=>{
 const db=connect();try{
  const ctx=context(),receipts=new ReceiptWorkspace(db),input=receipt(ctx,null),old=await receipts.save(input,ctx);assert.equal(old.items[0].identityState,'legacy_unresolved');
  const original=structuredClone(old.draft.data.lines[0].product),ref=(await new ProductReferences(db).resolve(request(ctx),ctx)).reference;
  const next=structuredClone(input);next.command.expectedVersion=1;next.command.operationId=randomUUID();next.items[0].catalogueReference=ref;
  const linked=await receipts.save(next,ctx);assert.deepEqual(linked.draft.data.lines[0].product,original);assert.deepEqual(linked.items[0].catalogueReference,ref);assert.equal(linked.items[0].identityState,'linked');
  assert.equal((await db.receiptDraftRevision.findFirst({where:{receiptId:old.draft.id,version:1}})).snapshot.items[0].identityState,'legacy_unresolved');
  const third=structuredClone(next);third.command.expectedVersion=2;third.command.operationId=randomUUID();delete third.items[0].catalogueReference;assert.deepEqual((await receipts.save(third,ctx)).items[0].catalogueReference,ref);
  const rewritten=structuredClone(third);rewritten.command.expectedVersion=3;rewritten.command.operationId=randomUUID();rewritten.command.payload.lines[0].product=ref;await assert.rejects(receipts.save(rewritten,ctx),e=>e.code==='REFERENCE_LINK_CONFLICT');
  const bad=structuredClone(third);bad.command.expectedVersion=3;bad.command.operationId=randomUUID();bad.items[0].catalogueReference=null;await assert.rejects(receipts.save(bad,ctx),e=>e.code==='REFERENCE_LINK_CONFLICT');
  const fresh=receipt(ctx,ref);fresh.command.payload.lines[0].product.presentationId=randomUUID();await assert.rejects(receipts.save(fresh,ctx),e=>e.code==='INVALID_REFERENCE');
  const forged=receipt(ctx,ref);forged.items[0].identityState='linked';await assert.rejects(receipts.save(forged,ctx));
 }finally{await db.$disconnect();}
});
test('reference validation locks master rows until the transaction commits; deactivation then rejects a new save',async()=>{
 const db=connect(),other=connect();try{
  const ctx=context(),ref=(await new ProductReferences(db).resolve(request(ctx),ctx)).reference;let unlock,ready;const gate=new Promise(r=>{unlock=r;}),locked=new Promise(r=>{ready=r;});
  const transaction=db.$transaction(async tx=>{await validateProductReference(tx,ctx.scope,ref);ready();await gate;});await locked;
  const update=other.productPresentation.update({where:{id:ref.presentationId},data:{isActive:false}});unlock();await transaction;await update;
  await assert.rejects(new ReceiptWorkspace(db).save(receipt(ctx,ref),ctx),e=>e.code==='INVALID_REFERENCE');
 }finally{await db.$disconnect();await other.$disconnect();}
});
