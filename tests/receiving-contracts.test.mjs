import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { saveReceiptDraft, confirmReceipt, reconcileReceiptQuantities, previewPackConversion, receiptOperationIdentity, compareReceiptOperation, evidenceUploadIntent, validate } from '../packages/domain-values/dist/index.js';
const example = name => JSON.parse(readFileSync(new URL(`../docs/architecture/contracts/examples/${name}.json`, import.meta.url), 'utf8'));
const known = value => ({ state: 'known', value, quality: 'measured', sourceRef: 'synthetic/manual' });
const unknown = { state: 'unknown', reason: 'Not observed' };
const q = (amount, unit = 'g', resolution = '1') => ({ amount, unit, basis: 'as_received', resolution });
const allocation = amount => ({ accepted: q(amount), rejected: q('0'), quarantined: q('0'), pending: q('0') });
const rejects = (action, code) => assert.throws(action, error => !!error.issue && (!code || error.issue.code === code));
test('receipt example separates product/presentation/batch/date/line identities; same product can have distinct actual batches', () => {
  const command = example('receipt-draft');
  const second = structuredClone(command.payload.lines[0]);
  second.id = randomUUID(); second.batch.id = randomUUID(); second.batch.code.value = 'SYNTHETIC-BATCH-B'; second.batch.expiry.value.date = '2026-11-09';
  command.payload.lines.push(second);
  const parsed = saveReceiptDraft(command);
  assert.equal(parsed.payload.lines.length, 2);
  assert.equal(parsed.payload.lines[0].product.productId, parsed.payload.lines[1].product.productId);
  assert.notEqual(parsed.payload.lines[0].batch.id, parsed.payload.lines[1].batch.id);
  assert.equal(parsed.payload.lines[0].batch.expiry.value.date, '2026-11-08');
  assert.equal(parsed.payload.receivedAt.value, '2026-11-05T12:00:00.000Z');
  assert.ok(!('state' in parsed) && !('actor' in parsed) && !('stock' in parsed));
  second.batch.id = command.payload.lines[0].batch.id;
  rejects(() => saveReceiptDraft(command), 'DUPLICATE_ID');
});
test('drafts preserve unknown versus measured zero/estimated/imported and reject authority fields or invented label dates', () => {
  for (const quality of ['measured', 'estimated', 'imported']) {
    const command = example('receipt-draft'); const line = command.payload.lines[0];
    line.received = { ...known(q('0')), quality }; line.disposition = known(allocation('0')); line.batch.code = unknown; line.batch.expiry = unknown;
    const parsed = saveReceiptDraft(command).payload.lines[0];
    assert.equal(parsed.received.value.amount, '0'); assert.equal(parsed.received.quality, quality); assert.deepEqual(parsed.batch.expiry, unknown);
  }
  const command = example('receipt-draft'); command.payload.lines[0].received = unknown; command.payload.lines[0].disposition = unknown;
  assert.deepEqual(reconcileReceiptQuantities(unknown, unknown), { state: 'incomplete', missing: ['received', 'disposition'] });
  assert.deepEqual(saveReceiptDraft(command).payload.lines[0].received, unknown);
  for (const field of ['actor', 'recordedAt', 'state', 'version', 'stock']) rejects(() => saveReceiptDraft({ ...command, [field]: 'forged' }), 'UNKNOWN_FIELD');
  const bad = example('receipt-draft'); bad.payload.lines[0].batch.expiry.value.date = '2026-02-30'; rejects(() => saveReceiptDraft(bad), 'INVALID_DATE');
  bad.payload.lines[0].batch.expiry = unknown; bad.payload.lines[0].batch.code = known(123); rejects(() => saveReceiptDraft(bad), 'INVALID_TEXT');
});
test('exact received/disposition reconciliation enforces all four buckets, one unit/basis and recoverable per-line errors', () => {
  const command = example('receipt-draft'); const line = command.payload.lines[0];
  assert.deepEqual(reconcileReceiptQuantities(line.received, line.disposition), { state: 'balanced', total: line.received.value });
  assert.equal(reconcileReceiptQuantities(known(q('0.3', 'g', '0.1')), known({ ...allocation('0.1'), accepted: q('0.1','g','0.1'), pending: q('0.2','g','0.1') })).state, 'balanced');
  line.disposition.value.pending.amount = '4999';
  const result = validate(() => saveReceiptDraft(command)); assert.equal(result.ok, false); assert.equal(result.error.issues[0].code, 'UNBALANCED_DISPOSITION'); assert.equal(result.error.issues[0].field, 'lines[0].disposition');
  for (const amount of ['4999', '50001']) rejects(() => reconcileReceiptQuantities(known(q('50000')),known(allocation(amount))), 'UNBALANCED_DISPOSITION');
  const mixed = allocation('1'); mixed.pending.unit = 'ml'; rejects(() => reconcileReceiptQuantities(known(q('1')),known(mixed)), 'INCOMPATIBLE_QUANTITY');
  const basis = allocation('1'); for (const value of Object.values(basis)) value.basis = 'raw_net'; rejects(() => reconcileReceiptQuantities(known(q('1')),known(basis)), 'INVALID_BASIS');
  rejects(() => reconcileReceiptQuantities(known(q('1')), known(allocation('-1'))), 'NEGATIVE_QUANTITY');
  rejects(() => reconcileReceiptQuantities(known(q('1.1','g','1')),known(allocation('1.1'))), 'RESOLUTION_MISMATCH');
  assert.deepEqual(reconcileReceiptQuantities(unknown, known(allocation('1'))), {state:'incomplete',missing:['received']});
});
test('checked pack preview distinguishes ten packs from nominal size and keeps historical snapshot/provenance without stock effects', () => {
  const input = example('pack-preview'); const output = previewPackConversion(input);
  assert.equal(output.state, 'preview'); assert.deepEqual(output.quantity, q('50000','g','5000'));
  assert.equal(output.provenance.packCount, '10'); assert.equal(output.provenance.conversion.version, 3); assert.equal(output.provenance.method,'checked_pack_scaling');
  input.conversion.factor='6000'; input.conversion.version=4;
  assert.equal(output.provenance.conversion.factor,'5000'); assert.equal(output.quantity.amount,'50000');
  assert.equal(previewPackConversion(input).quantity.amount,'60000'); assert.ok(!('received' in output) && !('entries' in output));
});
test('pack conversion rejects missing review, wrong presentation/version, unsupported inference, fractional counts and precision overflow', () => {
  const bad = action => {const input=example('pack-preview');action(input);rejects(()=>previewPackConversion(input));};
  for(const count of ['-1','1.5','1e2','01',10])bad(input=>input.packCount=count);
  for(const factor of ['0','-1','5000.0','0.0000000001'])bad(input=>input.conversion.factor=factor);
  bad(input=>input.product.productId=randomUUID());bad(input=>input.product.presentationId=randomUUID());bad(input=>input.product.presentationVersion++);
  bad(input=>delete input.conversion.reviewedBy);bad(input=>input.conversion.reviewedAt='2026-02-30T12:00:00Z');bad(input=>input.conversion.basis='prepared');bad(input=>input.conversion.toUnit='kg');
  bad(input=>input.packCount='999999999999999');bad(input=>input.conversion={});bad(input=>{input.conversion.toUnit='each';input.conversion.factor='1.5';});
  const small=example('pack-preview');small.conversion.factor='0.000000001';assert.equal(previewPackConversion(small).quantity.amount,'0.00000001');
  const count=example('pack-preview');count.conversion.toUnit='each';count.conversion.factor='5';assert.equal(previewPackConversion(count).quantity.amount,'50');
  const volume=example('pack-preview');volume.conversion.toUnit='ml';volume.conversion.factor='250';assert.equal(previewPackConversion(volume).quantity.amount,'2500');
});
test('operation identity is deterministic after normalization, separates actor/action/scope/version, and detects incompatible reuse', () => {
  const command=example('receipt-draft');const actor=randomUUID();const first=receiptOperationIdentity(command,actor,'receipt.draft.save');
  const reordered=Object.fromEntries(Object.entries(command).reverse());assert.deepEqual(receiptOperationIdentity(reordered,actor,'receipt.draft.save'),first);
  assert.equal(compareReceiptOperation(null,first),'not_found');assert.equal(compareReceiptOperation(first,first),'same_intent');
  const changed=structuredClone(command);changed.expectedVersion=1;const version=receiptOperationIdentity(changed,actor,'receipt.draft.save');assert.equal(compareReceiptOperation(first,version),'payload_mismatch');
  changed.expectedVersion=0;changed.payload.supplierReference=known('Changed reviewed reference');assert.equal(compareReceiptOperation(first,receiptOperationIdentity(changed,actor,'receipt.draft.save')),'payload_mismatch');
  const another=receiptOperationIdentity(command,randomUUID(),'receipt.draft.save');assert.notEqual(another.canonicalIntent,first.canonicalIntent);rejects(()=>compareReceiptOperation(first,another),'OPERATION_KEY_MISMATCH');
  const newId=structuredClone(command);newId.operationId=randomUUID();const next=receiptOperationIdentity(newId,actor,'receipt.draft.save');assert.notDeepEqual(next.key,first.key);assert.equal(next.canonicalIntent,first.canonicalIntent);
  assert.ok(!first.canonicalIntent.includes(command.operationId));assert.ok(!first.canonicalIntent.includes('sessionId'));assert.ok(!first.canonicalIntent.includes('correlationId'));
  rejects(()=>receiptOperationIdentity({...command,sessionId:randomUUID()},actor,'receipt.draft.save'),'UNKNOWN_FIELD');
  rejects(()=>receiptOperationIdentity(command,actor,'stock.post'),'INVALID_ACTION');
});
test('confirmation intent requires a persisted version and explicit line/batch identities but does not authorize or post stock', () => {
  const input=example('receipt-confirm-intent');const parsed=confirmReceipt(input);assert.equal(parsed.expectedVersion,1);assert.equal(parsed.payload.lines.length,1);
  assert.equal(receiptOperationIdentity(input,randomUUID(),'receipt.confirm').key.action,'receipt.confirm');
  rejects(()=>confirmReceipt({...input,expectedVersion:0}),'INVALID_VERSION');
  rejects(()=>confirmReceipt({...input,expectedVersion:2147483647}),'INVALID_VERSION');
  input.payload.lines.push(structuredClone(input.payload.lines[0]));rejects(()=>confirmReceipt(input),'DUPLICATE_ID');
});
test('evidence declaration validates explicit size/type policy, ownership links and untrusted content without accepting server metadata', () => {
  const input=example('evidence-upload-intent');const policy={maxBytes:2048,allowedMediaTypes:['image/jpeg','image/png']};
  assert.deepEqual(evidenceUploadIntent(input,policy),input);
  for(const key of ['author','storageKey','recordedAt','state','availableAt','hold'])rejects(()=>evidenceUploadIntent({...input,[key]:'forged'},policy),'UNKNOWN_FIELD');
  for(const name of ['../label.jpg','folder/label.jpg','C:\\label.jpg','..','label\u0000.jpg'])rejects(()=>evidenceUploadIntent({...input,originalFilename:name},policy),'INVALID_FILENAME');
  for(const sizeBytes of [0,-1,2049,1.5,Number.MAX_SAFE_INTEGER+1,'1024'])rejects(()=>evidenceUploadIntent({...input,declared:{...input.declared,sizeBytes}},policy),'SIZE_LIMIT');
  rejects(()=>evidenceUploadIntent({...input,declared:{...input.declared,mediaType:'image/svg+xml'}},policy),'TYPE_REJECTED');
  rejects(()=>evidenceUploadIntent({...input,declared:{...input.declared,sha256:'not-a-digest'}},policy),'INVALID_DIGEST');
  rejects(()=>evidenceUploadIntent(input,{maxBytes:0,allowedMediaTypes:['image/jpeg']}),'INVALID_EVIDENCE_POLICY');
  rejects(()=>evidenceUploadIntent(input,{}),'INVALID_EVIDENCE_POLICY');
  assert.equal(evidenceUploadIntent(input,policy).capturedAt.state,'unknown');
});
test('draft structural bounds reject duplicate/missing identities, unsupported schemas and unbounded lines/evidence', () => {
  const bad=action=>{const input=example('receipt-draft');action(input);rejects(()=>saveReceiptDraft(input));};
  bad(input=>input.schemaVersion=2);bad(input=>input.expectedVersion=-1);bad(input=>input.expectedVersion=1.5);bad(input=>input.payload.lines=[]);
  bad(input=>input.payload.lines[0].product.presentationVersion=0);bad(input=>input.payload.lines[0].batch.id='barcode-is-not-a-batch-id');
  bad(input=>{const id=randomUUID();input.payload.lines[0].evidenceIds=[id,id];});
  bad(input=>input.payload.lines[0].evidenceIds=Array.from({length:21},()=>randomUUID()));
  bad(input=>input.payload.lines=Array.from({length:51},()=>structuredClone(input.payload.lines[0])));
  bad(input=>input.payload.lines[0].received={...unknown,value:q('0')});
});
