import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { assessReceivingObservation, receivingObservationData, saveReceivingObservation } from '../packages/domain-values/dist/index.js';
const now=new Date('2026-11-08T12:00:00.000Z');
const known=value=>({state:'known',quality:'measured',sourceRef:'synthetic/operator',value});
const unknown={state:'unknown',reason:'Not observed'};
const profile={id:'synthetic-test',version:1,scope:{tenantId:randomUUID(),siteId:randomUUID()},name:'Synthetic only — not operational',category:'synthetic_chilled',stage:'receiving',synthetic:true,validatedForOperation:false,sourceRef:'fixture/not-legal',temperature:{required:true,unit:'Cel',minimum:'2',maximum:'8',requireMethod:true,requireInstrument:true},condition:{required:true,expected:'intact',requireMethod:true},maxAgeSeconds:3600,futureToleranceSeconds:30};
function data(value='4'){return {temperature:{state:'recorded',value,unit:'Cel',quality:'measured',method:known('Synthetic manually entered method'),instrument:known('Synthetic thermometer identity'),observedAt:known(now.toISOString())},condition:{state:'recorded',value:'intact',method:known('Synthetic visual observation'),observedAt:known(now.toISOString())},notes:null};}
function command(){return {schemaVersion:1,scope:profile.scope,id:randomUUID(),operationId:randomUUID(),expectedVersion:0,expectedReceiptVersion:1,target:{receiptId:randomUUID(),lineId:randomUUID(),productId:randomUUID(),presentationId:randomUUID(),batchId:randomUUID()},profile:{id:profile.id,version:1},data:data(),correctionReason:null};}
test('synthetic assessments compare exact inclusive limits without inventing observed values or disposition',()=>{
 for(const value of ['2','8','2.000000001'])assert.equal(assessReceivingObservation(receivingObservationData(data(value)),profile,now).overall,'within_rule');
 for(const value of ['1.999999999','8.000000001','-5'])assert.equal(assessReceivingObservation(receivingObservationData(data(value)),profile,now).overall,'deviation');
 const frozen={...profile,temperature:{...profile.temperature,minimum:'-25',maximum:'-12'}};assert.equal(assessReceivingObservation(data('-18'),frozen,now).overall,'within_rule');
 const gap={state:'pending',reason:'Not measured yet'};const parsed=receivingObservationData({...data(),temperature:gap});assert.deepEqual(parsed.temperature,gap);assert.equal(assessReceivingObservation(parsed,profile,now).overall,'pending');
 assert.equal('disposition' in assessReceivingObservation(data(),profile,now),false);
});
test('method, instrument, actual time and measured/estimated quality remain necessary independent context',()=>{
 for(const [field,value,reason] of [['method',unknown,'METHOD_MISSING'],['instrument',unknown,'INSTRUMENT_MISSING'],['observedAt',unknown,'OBSERVED_TIME_MISSING'],['quality','estimated','MEASUREMENT_NOT_CONFIRMED'],['observedAt',{...known(now.toISOString()),quality:'estimated'},'OBSERVED_TIME_UNCERTAIN'],['method',{...known('Unverified method'),quality:'estimated'},'METHOD_NOT_CONFIRMED'],['instrument',{...known('Unverified instrument'),quality:'imported'},'INSTRUMENT_NOT_CONFIRMED']]){const input=data();input.temperature[field]=value;const result=assessReceivingObservation(input,profile,now);assert.equal(result.overall,'inconclusive');assert.ok(result.temperature.reasons.includes(reason));}
 const damaged=data();damaged.condition.value='damaged';damaged.temperature={state:'pending',reason:'No reading yet'};const result=assessReceivingObservation(damaged,profile,now);assert.equal(result.overall,'deviation');assert.equal(result.temperature.state,'pending');
});
test('freshness/future boundaries use observation time separately from server assessment time',()=>{
 for(const [milliseconds,state] of [[-3600000,'within_rule'],[-3600001,'inconclusive'],[30000,'within_rule'],[30001,'inconclusive']]){const input=data();input.temperature.observedAt=known(new Date(now.getTime()+milliseconds).toISOString());assert.equal(assessReceivingObservation(input,profile,now).temperature.state,state);}
 assert.equal(assessReceivingObservation(data(),profile,new Date(now.getTime()+3600001)).overall,'inconclusive');
});
test('not-applicable requires a reason and cannot waive a required fixture control',()=>{
 assert.throws(()=>receivingObservationData({...data(),temperature:{state:'not_applicable',reason:''}}));
 const input={...data(),temperature:{state:'not_applicable',reason:'Explicit synthetic ambient rationale'}};
 assert.equal(assessReceivingObservation(receivingObservationData(input),profile,now).temperature.state,'inconclusive');
 const optional={...profile,temperature:{...profile.temperature,required:false}};const result=assessReceivingObservation(input,optional,now);assert.equal(result.temperature.state,'not_applicable');assert.equal(result.overall,'within_rule');
});
test('wire contract rejects wrong units, false precision, forged assessment/author/time and unreasoned corrections',()=>{
 for(const change of [c=>c.data.temperature.unit='Fah',c=>c.data.temperature.value='2e0',c=>c.data.temperature.value='-0',c=>c.data.temperature.value='1.0000000001',c=>c.assessment={overall:'within_rule'},c=>c.actor={id:randomUUID()},c=>c.recordedAt=now.toISOString(),c=>c.profile.minimum='0',c=>{c.expectedVersion=1;},c=>c.data.temperature.observedAt=known('2026-02-30T12:00:00.000Z')]){const value=command();change(value);assert.throws(()=>saveReceivingObservation(value));}
 const corrected=command();corrected.expectedVersion=1;corrected.correctionReason='Corrected actual transcription';assert.equal(saveReceivingObservation(corrected).correctionReason,corrected.correctionReason);
 assert.throws(()=>assessReceivingObservation(data(),{...profile,synthetic:false},now));assert.throws(()=>assessReceivingObservation(data(),{...profile,validatedForOperation:true},now));
});
