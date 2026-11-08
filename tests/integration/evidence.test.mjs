import { Buffer } from 'node:buffer';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdtemp, rm, readdir, symlink, chmod, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PrismaClient } from '../../services/kitchen/dist/generated/prisma/client.js';
import { ReceiptWorkspace } from '../../services/kitchen/dist/application/receipt-workspace.js';
import { EvidenceWorkspace } from '../../services/kitchen/dist/application/evidence-workspace.js';
import { PrivateEvidenceStore } from '../../services/kitchen/dist/infra/private-evidence-store.js';
import { readConfig } from '../../packages/runtime/dist/index.js';
const require=createRequire(new URL('../../services/kitchen/package.json',import.meta.url));const {PrismaPg}=require('@prisma/adapter-pg');
const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aSlkAAAAASUVORK5CYII=','base64');
const declared={mediaType:'image/png',sizeBytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
const unknown={state:'unknown',reason:'Not observed'};
async function fixture(){
 const config=readConfig('kitchen'),db=new PrismaClient({adapter:new PrismaPg({connectionString:config.databaseUrl,connectionTimeoutMillis:3000})});
 const root=await mkdtemp(path.join(tmpdir(),'apptit-evidence-'));const options={...config,evidenceMode:'fixture',evidenceRoot:root,evidenceMaxBytes:2097152};
 const context={scope:{tenantId:randomUUID(),siteId:randomUUID()},actor:{userId:randomUUID(),nameAtAction:'Synthetic evidence operator'},sessionId:randomUUID(),correlationId:randomUUID(),siteTimeZone:'Europe/Paris',membershipVersion:1,authorizedAt:new Date().toISOString(),capabilities:['receipt.draft.read','receipt.draft.write','evidence.read','evidence.write']};
 const line={id:randomUUID(),product:{productId:randomUUID(),presentationId:randomUUID(),presentationVersion:1},batch:{id:randomUUID(),code:unknown,expiry:unknown},received:unknown,disposition:unknown,destinationLocationId:unknown,evidenceIds:[]};
 const command={schemaVersion:1,operationId:randomUUID(),scope:context.scope,receiptId:randomUUID(),expectedVersion:0,payload:{supplierReference:unknown,receivedAt:unknown,lines:[line]}};
 const receiptInput={command,items:[{lineId:line.id,name:'Synthetic product',presentation:'Physical label pending',barcode:null,physicalMatch:false,pack:null}]};
 await new ReceiptWorkspace(db).save(receiptInput,context);
 const intent={uploadId:randomUUID(),scope:context.scope,links:{receiptId:command.receiptId,lineId:line.id,productId:line.product.productId,presentationId:line.product.presentationId,batchId:line.batch.id},originalFilename:'synthetic-label.png',capturedAt:unknown,declared};
 return {db,root,options,context,intent,receiptInput,app:new EvidenceWorkspace(db,options),close:async()=>{await db.$disconnect();await rm(root,{recursive:true,force:true});}};
}
test('private evidence preserves original links/author/times; concurrent retries and reload create one immutable image',async()=>{
 const f=await fixture();try{const {app,intent,context,db}=f;const beginnings=await Promise.all([app.begin(intent,context),app.begin(intent,context)]);assert.deepEqual(beginnings[0],beginnings[1]);const pending=beginnings[0];assert.equal(pending.state,'upload_pending');assert.deepEqual(pending.author,context.actor);assert.equal(pending.capturedAt.state,'unknown');
 const query={scope:context.scope,id:pending.id};const results=await Promise.all([app.upload(query,context,bytes),app.upload(query,context,bytes)]);assert.deepEqual(results[0],results[1]);assert.equal(results[0].state,'available');assert.equal(results[0].readability.state,'unreviewed');assert.equal(results[0].extraction.state,'disabled');assert.deepEqual((await app.read(query,context)).bytes,bytes);
 const reopened=new EvidenceWorkspace(db,f.options);assert.equal((await reopened.list({scope:context.scope,receiptId:intent.links.receiptId},context)).items.length,1);assert.equal((await readdir(f.root)).filter(name=>name.endsWith('.blob')).length,1);assert.equal(await db.receiptEvidenceEvent.count({where:{evidenceId:pending.id}}),2);assert.equal(JSON.stringify(results).includes('storageKey'),false);
 const review=await app.review({...query,readability:'unreadable'},context);assert.equal(review.readability.state,'unreadable');assert.deepEqual(review.author,context.actor);assert.deepEqual((await app.read(query,context)).bytes,bytes);
 const retake=await app.begin({...intent,uploadId:randomUUID()},context);assert.notEqual(retake.id,pending.id);assert.equal((await app.list({scope:context.scope,receiptId:intent.links.receiptId},context)).items.length,2);
 await assert.rejects(db.receiptEvidenceEvent.updateMany({where:{evidenceId:pending.id},data:{actorId:randomUUID()}}));
 }finally{await f.close();}
});
test('evidence authorization, foreign links, forged metadata and changed upload intent are rejected without disclosing bytes',async()=>{
 const f=await fixture();try{const {app,intent,context}=f;await assert.rejects(app.begin(intent,{...context,capabilities:['evidence.read']}),e=>e.code==='FORBIDDEN');await assert.rejects(app.begin({...intent,author:{userId:randomUUID()}},context));await assert.rejects(app.begin({...intent,links:{...intent.links,batchId:randomUUID()}},context),e=>e.code==='INVALID_EVIDENCE_LINK');
 const item=await app.begin(intent,context),query={scope:context.scope,id:item.id};await app.upload(query,context,bytes);await assert.rejects(app.begin({...intent,originalFilename:'changed.png'},context),e=>e.code==='IDEMPOTENCY_MISMATCH');
 const foreign={...context,scope:{tenantId:randomUUID(),siteId:randomUUID()}};await assert.rejects(app.read({scope:foreign.scope,id:item.id},foreign),e=>e.code==='NOT_FOUND');await assert.rejects(app.read(query,foreign),e=>e.code==='FORBIDDEN');await assert.rejects(app.read(query,{...context,capabilities:[]}),e=>e.code==='FORBIDDEN');
 const colleague={...context,actor:{userId:randomUUID(),nameAtAction:'Authorized colleague'}};assert.deepEqual((await app.read(query,colleague)).bytes,bytes);await assert.rejects(app.upload(query,colleague,bytes),e=>e.code==='FORBIDDEN');
 const next=structuredClone(f.receiptInput);next.command.operationId=randomUUID();next.command.expectedVersion=1;next.command.payload.lines[0].batch.id=randomUUID();await assert.rejects(new ReceiptWorkspace(f.db).save(next,context),e=>e.code==='EVIDENCE_LINK_CONFLICT');
 }finally{await f.close();}
});
test('failed/incomplete/tampered images never become available; same upload can recover without overwriting originals',async()=>{
 const f=await fixture();try{const {app,intent,context}=f;const pending=await app.begin(intent,context),query={scope:context.scope,id:pending.id};
 assert.equal((await app.upload(query,context,bytes.subarray(0,10))).failure,'UPLOAD_INCOMPLETE');await assert.rejects(app.read(query,context),e=>e.code==='EVIDENCE_NOT_AVAILABLE');
 const changed=Buffer.from(bytes);changed[changed.length-1]^=1;assert.equal((await app.upload(query,context,changed)).failure,'DIGEST_MISMATCH');
 assert.equal((await app.upload(query,context,Buffer.alloc(bytes.length))).failure,'TYPE_REJECTED');assert.equal((await app.upload(query,context,bytes)).state,'available');await assert.rejects(app.upload(query,context,changed),e=>e.code==='UPLOAD_REJECTED');assert.deepEqual((await app.read(query,context)).bytes,bytes);
 await rm(path.join(f.root,pending.id+'.blob'));await assert.rejects(app.read(query,context),e=>e.code==='EVIDENCE_NOT_AVAILABLE');
 }finally{await f.close();}
});
test('evidence metadata/audit rollback leaves no false availability and recovers durable bytes after lost DB commit',async()=>{
 const f=await fixture();try{const {context,intent,db}=f;const faulted=db.$extends({query:{receiptEvidenceEvent:{create(){throw new Error('Synthetic evidence audit failure');}}}});const failed=new EvidenceWorkspace(faulted,f.options);
 await assert.rejects(failed.begin(intent,context),/Synthetic evidence audit failure/);assert.equal(await db.receiptEvidence.count({where:context.scope}),0);
 const item=await f.app.begin(intent,context),query={scope:context.scope,id:item.id};await assert.rejects(failed.upload(query,context,bytes),/Synthetic evidence audit failure/);assert.equal((await f.app.list({scope:context.scope,receiptId:intent.links.receiptId},context)).items[0].state,'upload_pending');assert.equal((await f.app.upload(query,context,bytes)).state,'available');assert.deepEqual((await f.app.read(query,context)).bytes,bytes);
 }finally{await f.close();}
});
test('private file adapter rejects public roots, symlinks, excessive bytes and unsafe directory permissions',async()=>{
 const f=await fixture();try{const store=new PrivateEvidenceStore(f.root,bytes.length),id=randomUUID();await assert.rejects(store.write(id,Buffer.concat([bytes,bytes]),declared),e=>e.code==='SIZE_LIMIT');await assert.rejects(store.write('../escape',bytes,declared));await assert.rejects(new PrivateEvidenceStore(path.join(f.root,'public'),bytes.length).write(id,bytes,declared));
 await store.write(id,bytes,declared);const other=randomUUID();await symlink(path.join(f.root,id+'.blob'),path.join(f.root,other+'.blob'));await assert.rejects(store.read(other,declared));await assert.rejects(store.write(other,bytes,declared));
 await mkdir(path.join(f.root,'public'),{mode:0o700});await symlink(path.join(f.root,'public'),path.join(f.root,'private-alias'));await assert.rejects(new PrivateEvidenceStore(path.join(f.root,'private-alias','nested'),bytes.length).write(randomUUID(),bytes,declared),e=>e.code==='STORAGE_UNAVAILABLE');
 await chmod(f.root,0o755);await assert.rejects(store.read(id,declared),e=>e.code==='STORAGE_UNAVAILABLE');await chmod(f.root,0o700);
 }finally{await f.close();}
});
test('disabled evidence is explicit and cannot upload even with draft/evidence rights',async()=>{
 const f=await fixture();try{const disabled=new EvidenceWorkspace(f.db,{...f.options,evidenceMode:'disabled'});assert.equal((await disabled.list({scope:f.context.scope,receiptId:f.intent.links.receiptId},f.context)).mode,'disabled');await assert.rejects(disabled.begin(f.intent,f.context),e=>e.code==='CAPABILITY_DISABLED');}finally{await f.close();}
});
