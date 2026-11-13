import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { registryInspector } from '../scripts/containers/registry.mjs';
const metadata={owner:'rodrigonpaiva',ownerType:'User',tag:'v0.1.0-alpha.2'};
const bytes=JSON.stringify({schemaVersion:2,mediaType:'application/vnd.oci.image.manifest.v1+json',config:{digest:'sha256:'+'1'.repeat(64)},layers:[]});
const digest='sha256:'+createHash('sha256').update(bytes).digest('hex');
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
const denied=()=>json({errors:[{code:'DENIED',message:'requested access to resource denied'}]},403);
function registry({missing=false,publicRead=false,anonymousFailure=false,badDigest=false,authFailure=false,org=false,packageExists=false,anonymousManifestDenied=false}={}){
 const calls=[];
 const fetcher=async(url,options)=>{
  url=new URL(url);calls.push({path:url.pathname,scope:url.searchParams.get('scope'),authorization:options.headers.authorization});assert.equal(url.hostname,'ghcr.io');assert.equal(options.redirect,'error');
  if(url.pathname==='/token'){
   if(options.headers.authorization){assert.match(options.headers.authorization,/^Basic /);assert.match(url.searchParams.get('scope'),/:pull,push$/);return authFailure?denied():json({token:'authenticated-bearer'});}
   assert.match(url.searchParams.get('scope'),/:pull$/);if(anonymousFailure)return json({},503);return publicRead||anonymousManifestDenied?json({token:'anonymous-bearer'}):denied();
  }
  if(url.pathname.endsWith('/tags/list'))return packageExists?json({name:'rodrigonpaiva/apptit-api',tags:['older-version']}):json({errors:[{code:'NAME_UNKNOWN'}]},404);
  assert.equal(url.pathname,'/v2/rodrigonpaiva/apptit-api/manifests/v0.1.0-alpha.2');
  if(options.headers.authorization==='Bearer anonymous-bearer'&&anonymousManifestDenied)return denied();
  if(missing)return json({errors:[{code:'MANIFEST_UNKNOWN'}]},404);
  return new Response(bytes,{status:200,headers:{'docker-content-digest':badDigest?'sha256:'+'2'.repeat(64):digest}});
 };
 return{inspect:registryInspector({...metadata,ownerType:org?'Organization':'User'},'synthetic-gh-token',fetcher),calls};
}
test('private personal package proof requires authenticated manifest bytes plus explicit anonymous denial',async()=>{
 const {inspect,calls}=registry();assert.deepEqual(await inspect('api'),{exists:true,packageExists:true,existingDigest:digest,visibility:'private',verification:'authenticated-registry-and-anonymous-denial'});assert.equal(calls.length,3);assert.ok(!JSON.stringify(await inspect('api')).includes('synthetic-gh-token'));
});
test('anonymous readable manifest is public and cannot be reported private',async()=>{
 const {inspect}=registry({publicRead:true});assert.equal((await inspect('api')).visibility,'public');
});
test('only an authenticated manifest-unknown result is absence; denied authenticated access is a blocker',async()=>{
 assert.deepEqual(await registry({missing:true}).inspect('api'),{exists:false,packageExists:false,existingDigest:null});await assert.rejects(registry({authFailure:true}).inspect('api'),/authenticated token verification failed/);
});
test('visibility outage or a mismatched content digest never becomes private proof',async()=>{
 await assert.rejects(registry({anonymousFailure:true}).inspect('api'),/anonymous token verification failed/);await assert.rejects(registry({badDigest:true}).inspect('api'),/digest does not match/);
});
test('anonymous denial does not distinguish internal from private for organizations',async()=>{
 assert.equal((await registry({org:true}).inspect('api')).visibility,'restricted');
});

test('a public package is blocked even when the requested release tag is absent',async()=>{
 const value=await registry({missing:true,packageExists:true,publicRead:true}).inspect('api');assert.equal(value.existingDigest,null);assert.equal(value.exists,false);assert.equal(value.packageExists,true);assert.equal(value.visibility,'public');
});
test('an absent tag in a private package keeps package privacy distinct from tag existence',async()=>{
 const value=await registry({missing:true,packageExists:true}).inspect('api');assert.equal(value.existingDigest,null);assert.equal(value.packageExists,true);assert.equal(value.visibility,'private');
});
test('a token with no anonymous pull scope is not itself proof of public visibility',async()=>{
 assert.equal((await registry({anonymousManifestDenied:true}).inspect('api')).visibility,'private');
});
