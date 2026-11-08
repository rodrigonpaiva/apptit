import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { saveReceivingObservation } from '../packages/domain-values/dist/index.js';
const known=value=>({state:'known',quality:'measured',sourceRef:'synthetic/original',value});
test('editor starts with actual readings absent and preserves original timestamp precision/provenance when correcting other fields',async()=>{
 const temporary=await mkdtemp(path.join(tmpdir(),'apptit-observation-editor-'));
 try {
  const source=await readFile(new URL('../apps/web/src/lib/observations.ts',import.meta.url),'utf8');const result=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});const target=path.join(temporary,'observations.mjs');await writeFile(target,result.outputText);const {blankObservation,observationEditor,observationCommand}=await import(pathToFileURL(target).href);
  const site={tenantId:randomUUID(),siteId:randomUUID()},receiptId=randomUUID(),line={id:randomUUID(),productId:randomUUID(),presentationId:randomUUID(),batchId:randomUUID()},profile={id:'fixture-chilled-receiving',version:1};
  const empty=blankObservation();assert.equal(empty.temperatureValue,'');assert.equal(empty.temperatureTime,'');assert.equal(empty.conditionValue,'');const first=saveReceivingObservation(observationCommand(site,receiptId,1,line,profile,empty,randomUUID(),null));assert.equal(first.data.temperature.state,'pending');assert.equal('value' in first.data.temperature,false);
  const value={...first,id:first.id,version:1,profile,data:{temperature:{state:'recorded',value:'4',unit:'Cel',quality:'measured',method:known('Original method'),instrument:known('Original instrument'),observedAt:known('2026-10-25T01:30:45.123Z')},condition:{state:'recorded',value:'intact',method:known('Original check'),observedAt:known('2026-10-25T00:30:12.345Z')},notes:null}};
  const editor=observationEditor(value);editor.notes='Corrected note only';editor.correctionReason='Reason for note correction';const next=saveReceivingObservation(observationCommand(site,receiptId,1,line,profile,editor,value.id,value));assert.deepEqual(next.data.temperature.observedAt,value.data.temperature.observedAt);assert.deepEqual(next.data.condition.observedAt,value.data.condition.observedAt);assert.deepEqual(next.data.temperature.method,value.data.temperature.method);assert.deepEqual(next.profile,profile);
  const missing=blankObservation();missing.temperatureState='recorded';missing.temperatureValue='4';assert.throws(()=>observationCommand(site,receiptId,1,line,profile,missing,randomUUID(),null));missing.temperatureState='not_applicable';assert.throws(()=>observationCommand(site,receiptId,1,line,profile,missing,randomUUID(),null));assert.equal(value.data.temperature.observedAt.state,'known');
 }finally{await rm(temporary,{recursive:true,force:true});}
});
