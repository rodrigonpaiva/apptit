import { Buffer } from 'node:buffer';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
export async function evidenceSmoke(browser, scope, actor) {
  const unknown={state:'unknown',reason:'Synthetic smoke: not observed'};
  const line={id:randomUUID(),product:{productId:randomUUID(),presentationId:randomUUID(),presentationVersion:1},batch:{id:randomUUID(),code:unknown,expiry:unknown},received:unknown,disposition:unknown,destinationLocationId:unknown,evidenceIds:[]};
  const receiptId=randomUUID();
  const saved=await browser.receipt('save',{command:{schemaVersion:1,operationId:randomUUID(),scope,receiptId,expectedVersion:0,payload:{supplierReference:unknown,receivedAt:unknown,lines:[line]}},items:[{lineId:line.id,name:'Synthetic smoke image',presentation:'No actual goods',barcode:null,physicalMatch:false,pack:null}]});assert.ok(saved.ok);
  const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aSlkAAAAASUVORK5CYII=','base64');
  const input={uploadId:randomUUID(),scope,links:{receiptId,lineId:line.id,productId:line.product.productId,presentationId:line.product.presentationId,batchId:line.batch.id},originalFilename:'synthetic-smoke.png',capturedAt:unknown,declared:{mediaType:'image/png',sizeBytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}};
  const begun=await browser.evidence('begin',input);assert.ok(begun.ok);const item=await begun.json();assert.equal(item.state,'upload_pending');assert.equal(item.author.userId,actor.id);assert.equal(item.capturedAt.state,'unknown');
  const query={scope,id:item.id};assert.equal((await browser.evidence('read',query)).status,409);
  const bootstrap=await browser.request('/api/session/csrf');const {csrfToken}=await bootstrap.json();
  const upload=await browser.request('/api/evidence/upload',{method:'POST',headers:{'content-type':'image/png',origin:browser.origin,'x-csrf-token':csrfToken,'x-tenant-id':scope.tenantId,'x-site-id':scope.siteId,'x-evidence-id':item.id},body:bytes});assert.ok(upload.ok);assert.equal((await upload.json()).state,'available');
  const read=await browser.evidence('read',query);assert.ok(read.ok);assert.equal(read.headers.get('content-type'),'image/png');assert.equal(read.headers.get('cache-control'),'no-store');assert.equal(read.headers.get('x-content-type-options'),'nosniff');assert.deepEqual(Buffer.from(await read.arrayBuffer()),bytes);
  assert.equal((await browser.evidence('begin',input)).status,201);const list=await (await browser.evidence('list',{scope,receiptId})).json();assert.equal(list.items.length,1);assert.equal(JSON.stringify(list).includes('storageKey'),false);
  const review=await browser.evidence('review',{...query,readability:'unreadable'});assert.ok(review.ok);assert.equal((await review.json()).readability.state,'unreadable');
  const mismatch=await browser.evidence('begin',{...input,originalFilename:'changed.png'});assert.equal(mismatch.status,409);
  assert.equal((await browser.request('/api/evidence/list',{method:'POST',headers:{'content-type':'application/json',origin:browser.origin},body:JSON.stringify({scope,receiptId})})).status,403);
  assert.equal((await browser.evidence('list',{scope,receiptId},{origin:'https://untrusted.example'})).status,403);
  const publicRead=await browser.request('/'+item.id+'.blob');assert.equal(publicRead.status,404);
  return {id:item.id,receiptId};
}
