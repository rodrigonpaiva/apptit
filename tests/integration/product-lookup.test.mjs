import test from 'node:test';
import assert from 'node:assert/strict';
import { OffLookup, mapOffResponse } from '../../services/kitchen/dist/infra/lookup/off.js';
const code='0012345678905';
const body=(barcode=code)=>({status:'success',result:{id:'product_found'},product:{code:barcode,product_name:'Public source example',brands:'Example',quantity:'1 kg nominal',allergens_tags:['en:milk'],nutrition_data_per:'100g',nutriments:{'energy-kj_100g':100,fat_100g:0,carbohydrates_100g:3,proteins_100g:1,salt_100g:0}}});
const config={offMode:'live',offUserAgent:'Apptit/0.0.0 (https://github.com/rodrigonpaiva/apptit)',offTimeoutMs:100,offCacheSeconds:60};
const now=new Date('2026-11-06T12:00:00Z');
test('lookup maps complete/incomplete/absent/malformed states without guessing allergens, nutrition, batch or stock',()=>{
 const result=mapOffResponse(code,body(),now,false);assert.equal(result.state,'found');assert.equal(result.product.nutrition.state,'known');assert.ok(result.product.nutrition.value.includes('Lipides 0 g'));assert.equal(result.source.reviewState,'unreviewed');assert.ok(!('batch' in result.product)&&!('received' in result.product));
 const incomplete=body();incomplete.product.allergens_tags=[];delete incomplete.product.nutrition_data_per;const missing=mapOffResponse(code,incomplete,now,true);assert.equal(missing.state,'incomplete');assert.equal(missing.product.allergens.state,'unknown');assert.equal(missing.product.nutrition.state,'unknown');assert.ok(missing.source.synthetic);
 assert.equal(mapOffResponse(code,{result:{id:'product_not_found'}},now,false).state,'absent');assert.equal(mapOffResponse(code,{status:'success'},now,false).state,'unavailable');assert.equal(mapOffResponse(code,body('9999999999999'),now,false).reason,'invalid_response');
 assert.equal(mapOffResponse('012345678905',body(code),now,false).state,'found');
});
test('disabled/fixture paths never contact the network; deterministic examples retain unknown states',async()=>{
 const forbidden=()=>{throw new Error('Network forbidden in fixture test.');};
 assert.equal((await new OffLookup({...config,offMode:'disabled'},forbidden).lookup(code)).reason,'disabled');
 const lookup=new OffLookup({...config,offMode:'fixture'},forbidden,()=>now);
 assert.equal((await lookup.lookup(code)).state,'found');assert.equal((await lookup.lookup('0000000000123')).state,'incomplete');assert.equal((await lookup.lookup('12345678')).state,'absent');assert.equal((await lookup.lookup('9999999999999')).state,'unavailable');
});
test('live transport is fixed-host read-only, sends no actor/site/session and coalesces/caches only public snapshots',async()=>{
 let calls=0;let time=now.getTime();
 const request=async(url,init)=>{calls++;assert.equal(url.origin,'https://world.openfoodfacts.org');assert.equal(url.pathname,'/api/v3.4/product/'+code);assert.equal(init.method,'GET');assert.equal(init.redirect,'error');assert.deepEqual(Object.keys(init.headers).sort(),['accept','user-agent']);assert.ok(!init.body);await Promise.resolve();return Response.json(body());};
 const lookup=new OffLookup(config,request,()=>new Date(time));
 const [first,second]=await Promise.all([lookup.lookup(code),lookup.lookup(code)]);assert.equal(calls,1);assert.equal(first.state,'found');assert.deepEqual(first,second);
 first.product.name.value='mutated private UI';const cached=await lookup.lookup(code);assert.equal(calls,1);assert.equal(cached.source.cached,true);assert.equal(cached.product.name.value,'Public source example');
 time+=61000;await lookup.lookup(code);assert.equal(calls,2);
});
test('HTTP errors, malformed/oversized bodies and expired-cache outages never become absence or stale success',async()=>{
 for(const response of [new Response('failure',{status:503}),new Response('not-json',{status:200}),new Response('x'.repeat(256001)),new Response(JSON.stringify(body()),{status:404})])assert.equal((await new OffLookup(config,async()=>response,()=>now).lookup(code)).state,'unavailable');
 const absent=await new OffLookup(config,async()=>Response.json({status:'failure',result:{id:'product_not_found'}},{status:404}),()=>now).lookup(code);assert.equal(absent.state,'absent');
 let time=now.getTime(),calls=0;const lookup=new OffLookup(config,async()=>++calls===1?Response.json(body()):new Response(null,{status:503}),()=>new Date(time));await lookup.lookup(code);time+=61000;assert.equal((await lookup.lookup(code)).state,'unavailable');
});
test('provider Retry-After seconds/date and local request budget fail explicitly without automatic retry',async()=>{
 for(const retry of ['120',new Date(now.getTime()+120000).toUTCString()]){let calls=0;const lookup=new OffLookup(config,async()=>{calls++;return new Response(null,{status:429,headers:{'retry-after':retry}});},()=>now);assert.equal((await lookup.lookup(code)).retryAfterSeconds,120);assert.equal((await lookup.lookup('0000000000123')).reason,'rate_limited');assert.equal(calls,1);}
 const oversizedRetry=await new OffLookup(config,async()=>new Response(null,{status:429,headers:{'retry-after':'999999999999'}}),()=>now).lookup(code);assert.equal(oversizedRetry.retryAfterSeconds,2147483647);
 let calls=0;const lookup=new OffLookup(config,async()=>{calls++;return new Response(null,{status:503});},()=>now);for(let n=0;n<10;n++)await lookup.lookup(String(2000000000000+n));assert.equal((await lookup.lookup('2000000000010')).reason,'rate_limited');assert.equal(calls,10);
});
test('deadline failures are unavailable and invalid identifiers never trigger a public request',async()=>{
 let calls=0;const lookup=new OffLookup(config,async()=>{calls++;throw new DOMException('Timed out','TimeoutError');},()=>now);assert.equal((await lookup.lookup(code)).reason,'timeout');await assert.rejects(lookup.lookup('https://private.example'));assert.equal(calls,1);
});

test('product photos accept only fixed public OFF image paths and remain optional',()=>{
 const input=body();input.product.image_front_small_url='https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.879.200.jpg';
 assert.equal(mapOffResponse(code,input,now,false).product.imageUrl,input.product.image_front_small_url);
 for(const url of ['https://private.example/photo.jpg','http://images.openfoodfacts.org/images/products/1/front.1.200.jpg','https://images.openfoodfacts.org/images/products/1/front.1.200.jpg?private=secret']){
  input.product.image_front_small_url=url;const result=mapOffResponse(code,input,now,false);assert.equal(result.product.imageUrl,null);assert.equal(result.state,'found');
 }
});
