import test from 'node:test';
import assert from 'node:assert/strict';
import { productBarcode, validate } from '../packages/domain-values/dist/index.js';
import { readConfig } from '../packages/runtime/dist/index.js';
import { readFileSync } from 'node:fs';
test('lookup codes remain bounded digit strings with leading zeros; no URL or numeric coercion',()=>{
 for(const code of ['00001234','001234567890','0012345678905','00012345678905'])assert.equal(productBarcode(code),code);
 for(const input of [12345678,'1234567','123456789','../12345678905','https://example.com',' 0012345678905','0012345678905 ','<script>'])assert.equal(validate(()=>productBarcode(input)).ok,false);
});
test('OFF fixture and explicit live modes are independent of disabled private/offline providers',()=>{
 const env=Object.fromEntries(readFileSync(new URL('../.env.example',import.meta.url),'utf8').split('\n').filter(line=>line&&!line.startsWith('#')).map(line=>{const i=line.indexOf('=');return [line.slice(0,i),line.slice(i+1).replace(/__GENERATE_[A-Z_]+__/g,'a'.repeat(64))];}));
 assert.equal(readConfig('kitchen',env).offMode,'fixture');assert.equal(readConfig('kitchen',{...env,OFF_MODE:'disabled'}).offMode,'disabled');assert.equal(readConfig('kitchen',{...env,OFF_MODE:'live'}).offMode,'live');
 for(const override of [{OFF_TIMEOUT_MS:'0'},{OFF_CACHE_SECONDS:'999999'},{OFF_MODE:'live',OFF_USER_AGENT:'User\r\nInjected: true'},{EVIDENCE_MODE:'live'},{OFFLINE_MODE:'fixture'}])assert.throws(()=>readConfig('kitchen',{...env,...override}));
});
