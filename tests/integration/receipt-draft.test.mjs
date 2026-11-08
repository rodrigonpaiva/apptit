import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { PrismaClient } from '../../services/kitchen/dist/generated/prisma/client.js';
import { ReceiptWorkspace, parseReceiptWorkspace } from '../../services/kitchen/dist/application/receipt-workspace.js';
import { readConfig } from '../../packages/runtime/dist/index.js';
const require = createRequire(new URL('../../services/kitchen/package.json', import.meta.url)); const { PrismaPg } = require('@prisma/adapter-pg');
const client = () => new PrismaClient({ adapter: new PrismaPg({ connectionString: readConfig('kitchen').databaseUrl, connectionTimeoutMillis: 3000 }) });
const unknown = {state:'unknown',reason:'Not observed'};
const known = value => ({state:'known',quality:'estimated',sourceRef:'operator/label',value});
function context() { return { scope:{tenantId:randomUUID(),siteId:randomUUID()},actor:{userId:randomUUID(),nameAtAction:'Synthetic receiver'},siteTimeZone:'Europe/Paris',sessionId:randomUUID(),correlationId:randomUUID(),capabilities:['receipt.draft.read','receipt.draft.write'],membershipVersion:1,authorizedAt:new Date().toISOString() }; }
function input(ctx) {
 const productId=randomUUID(),lineId=randomUUID();
 return {command:{schemaVersion:1,operationId:randomUUID(),scope:ctx.scope,receiptId:randomUUID(),expectedVersion:0,payload:{supplierReference:unknown,receivedAt:unknown,lines:[{id:lineId,product:{productId,presentationId:productId,presentationVersion:1},batch:{id:randomUUID(),code:known('BATCH-A'),expiry:unknown},received:known({amount:'50000',unit:'g',basis:'as_received',resolution:'1'}),disposition:unknown,destinationLocationId:unknown,evidenceIds:[]}]}},items:[{lineId,name:'Synthetic rice',presentation:'Checked 5 kg bags',barcode:'0012345678905',physicalMatch:true,pack:{count:'10',factor:'5000',unit:'g',checked:true}}]};
}
test('receipt save/reopen keeps two same-code batches, exact checked conversion, pending data and authoritative actor without catalogue or stock effects',async()=>{
 const db=client(), reopened=client();try {
 const ctx=context(),value=input(ctx),first=value.command.payload.lines[0]; const second=structuredClone(first);second.id=randomUUID();second.batch={id:randomUUID(),code:known('BATCH-B'),expiry:known({kind:'best_before',date:'2027-01-01',sourceRef:'operator/label'})};value.command.payload.lines.push(second);value.items.push({...structuredClone(value.items[0]),lineId:second.id});
 const location=await db.receiptLocation.create({data:{id:randomUUID(),...ctx.scope,name:'Synthetic reserve'}});first.destinationLocationId=known(location.id);
 const catalogueBefore=await db.catalogueProduct.count({where:ctx.scope});const app=new ReceiptWorkspace(db);const result=await app.save(value,ctx);
 assert.equal(result.draft.state,'draft');assert.equal(result.draft.version,1);assert.deepEqual(result.draft.createdBy,ctx.actor);assert.equal(result.draft.data.lines[0].received.value.amount,'50000');assert.equal(result.draft.data.lines[0].batch.expiry.state,'unknown');assert.notEqual(result.draft.data.lines[0].batch.id,result.draft.data.lines[1].batch.id);assert.equal(result.draft.data.lines[0].disposition.state,'unknown');assert.equal(await db.catalogueProduct.count({where:ctx.scope}),catalogueBefore);assert.ok(!('stock' in result));
 assert.deepEqual(await new ReceiptWorkspace(reopened).read({scope:ctx.scope,id:value.command.receiptId},ctx),result);
 assert.equal((await app.list({scope:ctx.scope},ctx))[0].lineCount,2);assert.equal((await app.locations({scope:ctx.scope},ctx))[0].id,location.id);
 const revision=await db.receiptDraftRevision.findFirst({where:{receiptId:result.draft.id}});assert.equal(revision.sessionId,ctx.sessionId);assert.equal(revision.correlationId,ctx.correlationId);await assert.rejects(db.receiptDraftRevision.update({where:{receiptId_version:{receiptId:result.draft.id,version:1}},data:{actorId:randomUUID()}}));
 }finally{await db.$disconnect();await reopened.$disconnect();}
});
test('receipt operations replay once across concurrent retries and reject changed payloads without new revisions',async()=>{
 const db=client();try{const ctx=context(),value=input(ctx),app=new ReceiptWorkspace(db);const results=await Promise.all([app.save(value,ctx),app.save(value,ctx)]);assert.deepEqual(results[0],results[1]);assert.equal(await db.receiptDraftRevision.count({where:{receiptId:value.command.receiptId}}),1);
 const changed=structuredClone(value);changed.items[0].name='Different';await assert.rejects(app.save(changed,ctx),e=>e.code==='IDEMPOTENCY_MISMATCH');
 const next=structuredClone(value);next.command.expectedVersion=1;next.command.operationId=randomUUID();next.command.payload.supplierReference=known('SYN-123');const updates=await Promise.all([app.save(next,ctx),app.save(next,ctx)]);assert.equal(updates[0].draft.version,2);assert.deepEqual(updates[0],updates[1]);assert.equal(await db.receiptDraftRevision.count({where:{receiptId:value.command.receiptId}}),2);
 }finally{await db.$disconnect();}
});
test('competing receipt versions produce one winner and transactional audit; stale revisions cannot overwrite',async()=>{
 const db=client();try{const ctx=context(),value=input(ctx),app=new ReceiptWorkspace(db);await app.save(value,ctx);const a=structuredClone(value),b=structuredClone(value);for(const v of[a,b]){v.command.expectedVersion=1;v.command.operationId=randomUUID();}a.items[0].name='Winner A';b.items[0].name='Winner B';const results=await Promise.allSettled([app.save(a,ctx),app.save(b,ctx)]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.code,'VERSION_CONFLICT');assert.equal(await db.receiptDraftRevision.count({where:{receiptId:value.command.receiptId}}),2);assert.equal(await db.receiptDraftOperation.count({where:{...ctx.scope}}),2);
 }finally{await db.$disconnect();}
});
test('receipt scope/capability/destination checks prevent foreign reads and writes and leave no partial draft',async()=>{
 const db=client();try{const ctx=context(),value=input(ctx),app=new ReceiptWorkspace(db);await app.save(value,ctx);const foreign=context();await assert.rejects(app.read({scope:foreign.scope,id:value.command.receiptId},foreign),e=>e.code==='NOT_FOUND');assert.deepEqual(await app.list({scope:foreign.scope},foreign),[]);await assert.rejects(app.save(input(ctx),{...ctx,capabilities:['receipt.draft.read']}),e=>e.code==='FORBIDDEN');await assert.rejects(app.save(input(ctx),foreign),e=>e.code==='FORBIDDEN');
 const invalid=input(ctx);invalid.command.payload.lines[0].destinationLocationId=known(randomUUID());await assert.rejects(app.save(invalid,ctx),e=>e.code==='INVALID_DESTINATION');assert.equal(await db.receiptDraft.count({where:{id:invalid.command.receiptId}}),0);assert.equal(await db.receiptDraftRevision.count({where:{receiptId:invalid.command.receiptId}}),0);
 }finally{await db.$disconnect();}
});
test('invalid conversion, forged metadata, unsupported evidence and duplicate lines cannot be persisted',()=>{
 const ctx=context();for(const mutate of[v=>v.items[0].pack.checked=false,v=>v.items[0].pack.count='1.5',v=>v.items[0].pack.factor='0',v=>v.command.payload.lines[0].received.value.amount='49999',v=>v.command.actor={userId:randomUUID()},v=>v.command.payload.lines[0].evidenceIds=[randomUUID()],v=>v.command.payload.lines.push(structuredClone(v.command.payload.lines[0]))]){const value=input(ctx);mutate(value);assert.throws(()=>parseReceiptWorkspace(value));}
});

test('receipt audit or outcome failure rolls back the draft, revision and operation together', async () => {
 const db=client();try {
  const ctx=context(),value=input(ctx),app=new ReceiptWorkspace(db);const original=await app.save(value,ctx);
  for(const model of ['receiptDraftRevision','receiptDraftOperation']) {
   const faulted=db.$extends({query:{[model]:{create(){throw new Error('Synthetic receipt write failure');}}}});
   const failed=new ReceiptWorkspace(faulted), next=structuredClone(value);next.command.expectedVersion=1;next.command.operationId=randomUUID();next.items[0].name='Must roll back';
   await assert.rejects(failed.save(next,ctx),/Synthetic receipt write failure/);
   assert.deepEqual(await app.read({scope:ctx.scope,id:value.command.receiptId},ctx),original);
   const fresh=input(ctx);await assert.rejects(failed.save(fresh,ctx),/Synthetic receipt write failure/);
   assert.equal(await db.receiptDraft.count({where:{id:fresh.command.receiptId}}),0);
   assert.equal(await db.receiptDraftRevision.count({where:{receiptId:value.command.receiptId}}),1);
   assert.equal(await db.receiptDraftOperation.count({where:{...ctx.scope}}),1);
  }
 }finally{await db.$disconnect();}
});
test('full Kitchen migration chain adds receipt drafts while preserving populated foundation data', async () => {
 const {Pool}=require('pg');const pool=new Pool({connectionString:readConfig('kitchen').databaseUrl,connectionTimeoutMillis:3000});const connection=await pool.connect();const schema='receipt_review_'+randomUUID().replaceAll('-','');const preservedReceipt=randomUUID(),preservedScope={tenantId:randomUUID(),siteId:randomUUID()};
 try {
  await connection.query(`CREATE SCHEMA "${schema}"`);await connection.query(`SET search_path TO "${schema}"`);
  const root=new URL('../../services/kitchen/prisma/migrations/',import.meta.url);
  for(const name of readdirSync(root).filter(name=>/^\d/.test(name)).sort()) {
   await connection.query(readFileSync(new URL(name+'/migration.sql',root),'utf8'));
   if(name==='202611060001_receipt_drafts') await connection.query('INSERT INTO "ReceiptDraft" (id,"tenantId","siteId",version,snapshot,"recordedAt") VALUES ($1,$2,$3,1,$4,now())',[preservedReceipt,preservedScope.tenantId,preservedScope.siteId,{preserved:true}]);
   if(name==='202611040001_runtime_fixture') await connection.query(`INSERT INTO "RuntimeFixture" (id, payload) VALUES ('receipt-preservation', '{"preserved":true}')`);
  }
  const tables=(await connection.query('SELECT tablename FROM pg_tables WHERE schemaname=$1',[schema])).rows.map(row=>row.tablename);
  for(const name of ['ReceiptDraft','ReceiptDraftRevision','ReceiptDraftOperation','ReceiptLocation','ReceiptEvidence','ReceiptEvidenceEvent'])assert.ok(tables.includes(name));
  assert.deepEqual((await connection.query('SELECT snapshot FROM "ReceiptDraft" WHERE id=$1',[preservedReceipt])).rows[0].snapshot,{preserved:true});
  assert.deepEqual((await connection.query(`SELECT payload FROM "RuntimeFixture" WHERE id='receipt-preservation'`)).rows[0].payload,{preserved:true});
 }finally{await connection.query('ROLLBACK');await connection.query('SET search_path TO public');await connection.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);connection.release();await pool.end();}
});
