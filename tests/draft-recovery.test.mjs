import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as pause } from 'node:timers/promises';
import ts from 'typescript';
async function load(t) {
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'apptit-recovery-'));t.after(()=>fs.rm(directory,{recursive:true,force:true}));
 const source=await fs.readFile(new URL('../apps/web/src/lib/online-request.ts',import.meta.url),'utf8');
 const target=path.join(directory,'online-request.mjs');await fs.writeFile(target,ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
 return import(pathToFileURL(target).href);
}
test('request deadline and caller cancellation both abort without reporting persistence',async t=>{
 const {onlineSignal}=await load(t);const deadline=onlineSignal(undefined,2);await pause(10);assert.equal(deadline.aborted,true);assert.equal(deadline.reason.name,'TimeoutError');
 const controller=new globalThis.AbortController(),combined=onlineSignal(controller.signal,1000);controller.abort();assert.equal(combined.aborted,true);
});
test('denied/expired context invalidates private views while ordinary failures stay recoverable',async t=>{
 const {invalidateDeniedAccess}=await load(t);const previous=globalThis.window,events=[];
 try{globalThis.window={dispatchEvent(event){events.push(event.type);}};for(const status of[200,503,409])invalidateDeniedAccess({status});assert.equal(events.length,0);for(const status of[401,403])invalidateDeniedAccess({status});assert.deepEqual(events,['apptit:access-invalidated','apptit:access-invalidated']);}
 finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});

test('parallel first CSRF bootstrap shares nonce creation but later operations fetch a fresh session-bound token',async t=>{
 const {csrfForRequest}=await load(t),previous=globalThis.fetch;let calls=0,release;
 try {
  globalThis.fetch=async()=>{calls++;await new Promise(resolve=>{release=resolve;});return{status:200,ok:true,json:async()=>({csrfToken:'synthetic-token-'+calls})};};
  const first=csrfForRequest(),second=csrfForRequest();assert.equal(calls,1);release();assert.deepEqual(await Promise.all([first,second]),['synthetic-token-1','synthetic-token-1']);
  const next=csrfForRequest();assert.equal(calls,2);release();assert.equal(await next,'synthetic-token-2');
  const aborted=new globalThis.AbortController();aborted.abort();await assert.rejects(csrfForRequest(aborted.signal));assert.equal(calls,2);
 }finally{globalThis.fetch=previous;}
});
