import type { CheckedPackConversion, ConfirmReceipt, Datum, EvidenceUploadIntent, OperationIdentity, OperationKey, PackConversionPreview, ReceiptDisposition, ReceiptDraftData, ReceiptLineDraft, ReceiptProductIdentity, ReceiptReconciliation, SaveReceiptDraft } from '@apptit/contracts';
import { datum, decimal, expiry, fromScaled, instant, invalid, object, quantity, quantityDatum, scaledDecimal, scope, text, uuid } from './index.js';

function version(value: unknown, field: string, min = 1): number {
  if (!Number.isInteger(value) || (value as number) < min || (value as number) >= 2147483647) invalid(field, 'INVALID_VERSION', 'A bounded integer version is required.');
  return value as number;
}
function list(input: unknown, field: string, max: number, min = 0): unknown[] {
  if (!Array.isArray(input) || input.length < min || input.length > max) invalid(field, 'INVALID_LIST', `Expected ${min} to ${max} entries.`);
  return input;
}
function unique(values: string[], field: string): void {
  if (new Set(values).size !== values.length) invalid(field, 'DUPLICATE_ID', 'Duplicate identities are not accepted.');
}
export function receiptProductIdentity(input: unknown, field = 'product'): ReceiptProductIdentity {
  const value = object(input, ['productId', 'presentationId', 'presentationVersion'], field);
  return { productId: uuid(value['productId'], `${field}.productId`), presentationId: uuid(value['presentationId'], `${field}.presentationId`), presentationVersion: version(value['presentationVersion'], `${field}.presentationVersion`) };
}
const buckets = ['accepted', 'rejected', 'quarantined', 'pending'] as const;
export function receiptDisposition(input: unknown, field = 'disposition'): ReceiptDisposition {
  const value = object(input, buckets, field);
  const result = Object.fromEntries(buckets.map(key => [key, quantity(value[key], `${field}.${key}`)])) as unknown as ReceiptDisposition;
  for (const key of buckets) {
    if (result[key].unit !== result.accepted.unit || result[key].basis !== result.accepted.basis) invalid(`${field}.${key}`, 'INCOMPATIBLE_QUANTITY', 'Disposition requires one unit and basis.');
    if (result[key].basis !== 'as_received') invalid(`${field}.${key}.basis`, 'INVALID_BASIS', 'Receipt disposition uses the as_received basis.');
  }
  return result;
}
function dispositionDatum(input: unknown, field: string): Datum<ReceiptDisposition> {
  const result = datum(input, receiptDisposition, field);
  if (result.state === 'known' && result.quality === 'measured') for (const key of buckets) {
    const q = result.value[key];
    if (scaledDecimal(q.amount) % scaledDecimal(q.resolution) !== 0n) invalid(`${field}.value.${key}.amount`, 'RESOLUTION_MISMATCH', 'Measured disposition must align with its resolution.');
  }
  return result;
}
export function reconcileReceiptQuantities(receivedInput: unknown, dispositionInput: unknown, field = ''): ReceiptReconciliation {
  const prefix = field ? field + '.' : '';
  const received = quantityDatum(receivedInput, `${prefix}received`);
  const disposition = dispositionDatum(dispositionInput, `${prefix}disposition`);
  if (received.state === 'known' && received.value.basis !== 'as_received') invalid(`${prefix}received.value.basis`, 'INVALID_BASIS', 'Received quantity uses the as_received basis.');
  if (received.state === 'unknown' || disposition.state === 'unknown') return { state: 'incomplete', missing: [...(received.state === 'unknown' ? ['received' as const] : []), ...(disposition.state === 'unknown' ? ['disposition' as const] : [])] };
  let total = 0n;
  for (const key of buckets) {
    const amount = disposition.value[key];
    if (amount.unit !== received.value.unit || amount.basis !== received.value.basis) invalid(`${prefix}disposition.value.${key}`, 'INCOMPATIBLE_QUANTITY', 'Received and disposition quantities must use one unit and basis.');
    total += scaledDecimal(amount.amount);
  }
  if (total !== scaledDecimal(received.value.amount)) invalid(`${prefix}disposition`, 'UNBALANCED_DISPOSITION', 'Accepted, rejected, quarantined and pending amounts must equal the actual received quantity.');
  return { state: 'balanced', total: { ...received.value } };
}
function receiptLine(input: unknown, index: number): ReceiptLineDraft {
  const field = `lines[${index}]`;
  const value = object(input, ['id', 'product', 'batch', 'received', 'disposition', 'destinationLocationId', 'evidenceIds'], field);
  const batch = object(value['batch'], ['id', 'code', 'expiry'], `${field}.batch`);
  const received = quantityDatum(value['received'], `${field}.received`);
  const disposition = dispositionDatum(value['disposition'], `${field}.disposition`);
  reconcileReceiptQuantities(received, disposition, field);
  const evidenceIds = list(value['evidenceIds'], `${field}.evidenceIds`, 20).map(id => uuid(id, `${field}.evidenceIds`));
  unique(evidenceIds, `${field}.evidenceIds`);
  return { id: uuid(value['id'], `${field}.id`), product: receiptProductIdentity(value['product'], `${field}.product`),
    batch: { id: uuid(batch['id'], `${field}.batch.id`), code: datum(batch['code'], (v, f) => text(v, f, 100), `${field}.batch.code`), expiry: datum(batch['expiry'], expiry, `${field}.batch.expiry`) },
    received, disposition, destinationLocationId: datum(value['destinationLocationId'], uuid, `${field}.destinationLocationId`), evidenceIds };
}
export function receiptDraftData(input: unknown): ReceiptDraftData {
  const value = object(input, ['supplierReference', 'receivedAt', 'lines'], 'payload');
  const lines = list(value['lines'], 'lines', 50, 1).map(receiptLine);
  unique(lines.map(line => line.id), 'lines.id');
  unique(lines.map(line => line.batch.id), 'lines.batch.id');
  return { supplierReference: datum(value['supplierReference'], (v, f) => text(v, f, 200), 'supplierReference'), receivedAt: datum(value['receivedAt'], instant, 'receivedAt'), lines };
}
function envelope(input: unknown, minVersion: number) {
  const value = object(input, ['schemaVersion', 'operationId', 'scope', 'receiptId', 'expectedVersion', 'payload'], 'command');
  if (value['schemaVersion'] !== 1) invalid('schemaVersion', 'INVALID_SCHEMA', 'Schema version 1 is required.');
  return { schemaVersion: 1 as const, operationId: uuid(value['operationId'], 'operationId'), scope: scope(value['scope']), receiptId: uuid(value['receiptId'], 'receiptId'), expectedVersion: version(value['expectedVersion'], 'expectedVersion', minVersion), payload: value['payload'] };
}
export function saveReceiptDraft(input: unknown): SaveReceiptDraft {
  const command = envelope(input, 0);
  return { ...command, payload: receiptDraftData(command.payload) };
}
/** Syntax only: future confirmation must load the authoritative receipt and recheck quantities/rights atomically. */
export function confirmReceipt(input: unknown): ConfirmReceipt {
  const command = envelope(input, 1);
  const payload = object(command.payload, ['lines'], 'payload');
  const lines = list(payload['lines'], 'payload.lines', 50, 1).map((input, index) => {
    const field = `payload.lines[${index}]`;
    const value = object(input, ['lineId', 'batchId', 'disposition'], field);
    return { lineId: uuid(value['lineId'], `${field}.lineId`), batchId: uuid(value['batchId'], `${field}.batchId`), disposition: receiptDisposition(value['disposition'], `${field}.disposition`) };
  });
  unique(lines.map(line => line.lineId), 'payload.lines.lineId');
  unique(lines.map(line => line.batchId), 'payload.lines.batchId');
  return { ...command, payload: { lines } };
}
/** Pure exact preview; the snapshot's existence/review must later be loaded from server authority. */
export function checkedPackConversion(input: unknown): CheckedPackConversion {
  const value = object(input, ['id', 'version', 'product', 'factor', 'toUnit', 'basis', 'sourceRef', 'reviewedBy', 'reviewedAt'], 'conversion');
  const reviewer = object(value['reviewedBy'], ['userId', 'nameAtAction'], 'conversion.reviewedBy');
  const factor = decimal(value['factor'], 'conversion.factor');
  if (scaledDecimal(factor) <= 0n) invalid('conversion.factor', 'INVALID_FACTOR', 'A positive reviewed base-unit quantity per pack is required.');
  const q = quantity({ amount: factor, unit: value['toUnit'], basis: value['basis'], resolution: factor }, 'conversion');
  if (q.basis !== 'as_received') invalid('conversion.basis', 'INVALID_BASIS', 'Pack conversion cannot infer a preparation yield.');
  return { id: uuid(value['id'], 'conversion.id'), version: version(value['version'], 'conversion.version'), product: receiptProductIdentity(value['product'], 'conversion.product'), factor, toUnit: q.unit, basis: 'as_received', sourceRef: text(value['sourceRef'], 'conversion.sourceRef'),
    reviewedBy: { userId: uuid(reviewer['userId'], 'conversion.reviewedBy.userId'), nameAtAction: text(reviewer['nameAtAction'], 'conversion.reviewedBy.nameAtAction', 200) }, reviewedAt: instant(value['reviewedAt'], 'conversion.reviewedAt') };
}
export function previewPackConversion(input: unknown): PackConversionPreview {
  const value = object(input, ['packCount', 'product', 'conversion'], 'preview');
  const packCount = decimal(value['packCount'], 'packCount');
  if (scaledDecimal(packCount) < 0n || packCount.includes('.')) invalid('packCount', 'INVALID_PACK_COUNT', 'Use an explicit nonnegative whole-pack count.');
  const product = receiptProductIdentity(value['product']);
  const conversion = checkedPackConversion(value['conversion']);
  if (product.productId !== conversion.product.productId || product.presentationId !== conversion.product.presentationId || product.presentationVersion !== conversion.product.presentationVersion) invalid('conversion.product', 'CONVERSION_MISMATCH', 'The checked conversion must match this product and presentation version.');
  const amount = fromScaled(BigInt(packCount) * scaledDecimal(conversion.factor));
  return { state: 'preview', quantity: { amount, unit: conversion.toUnit, basis: conversion.basis, resolution: conversion.factor }, provenance: { packCount, packUnit: 'pack', conversion, method: 'checked_pack_scaling' } };
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object') return '{' + Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => JSON.stringify(key) + ':' + canonical(item)).join(',') + '}';
  const result = JSON.stringify(value);
  if (result === undefined) invalid('operation', 'INVALID_INTENT', 'Canonical operation contains an unsupported value.');
  return result;
}
export function receiptOperationIdentity(input: unknown, actor: unknown, action: OperationKey['action']): OperationIdentity {
  if (action !== 'receipt.draft.save' && action !== 'receipt.confirm') invalid('action', 'INVALID_ACTION', 'An explicit receiving action is required.');
  const command = action === 'receipt.draft.save' ? saveReceiptDraft(input) : confirmReceipt(input);
  const actorId = uuid(actor, 'actorId');
  return { key: { scope: command.scope, actorId, action, operationId: command.operationId }, canonicalIntent: canonical({ schemaVersion: command.schemaVersion, action, scope: command.scope, actorId, receiptId: command.receiptId, expectedVersion: command.expectedVersion, payload: command.payload }) };
}
/** Comparison only; does not claim a durable registry, terminal result, transaction or safe blind retry. */
export function compareReceiptOperation(existing: OperationIdentity | null, requested: OperationIdentity): 'not_found' | 'same_intent' | 'payload_mismatch' {
  if (!existing) return 'not_found';
  if (canonical(existing.key) !== canonical(requested.key)) invalid('operation', 'OPERATION_KEY_MISMATCH', 'Registry comparison requires the same scoped actor/action/operation key.');
  return existing.canonicalIntent === requested.canonicalIntent ? 'same_intent' : 'payload_mismatch';
}
export function evidenceUploadIntent(input: unknown, policy: { maxBytes: number; allowedMediaTypes: readonly string[] }): EvidenceUploadIntent {
  if (!policy || !Number.isSafeInteger(policy.maxBytes) || policy.maxBytes < 1 || !Array.isArray(policy.allowedMediaTypes) || !policy.allowedMediaTypes.length) invalid('policy', 'INVALID_EVIDENCE_POLICY', 'An explicit bounded size/type policy is required.');
  const value = object(input, ['uploadId', 'scope', 'links', 'originalFilename', 'capturedAt', 'declared'], 'upload');
  const links = object(value['links'], ['receiptId', 'lineId', 'productId', 'presentationId', 'batchId'], 'links');
  const content = object(value['declared'], ['mediaType', 'sizeBytes', 'sha256'], 'declared');
  const originalFilename = text(value['originalFilename'], 'originalFilename', 200);
  const hasControl = [...originalFilename].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
  if (originalFilename.includes('/') || originalFilename.includes('\\') || hasControl || originalFilename === '.' || originalFilename === '..') invalid('originalFilename', 'INVALID_FILENAME', 'Use a display filename without paths or control characters.');
  const mediaType = text(content['mediaType'], 'declared.mediaType', 100);
  if (!policy.allowedMediaTypes.includes(mediaType)) invalid('declared.mediaType', 'TYPE_REJECTED', 'This declared media type is not allowed by the selected policy.');
  if (!Number.isSafeInteger(content['sizeBytes']) || (content['sizeBytes'] as number) < 1 || (content['sizeBytes'] as number) > policy.maxBytes) invalid('declared.sizeBytes', 'SIZE_LIMIT', 'Declared size must fit the selected byte limit.');
  if (typeof content['sha256'] !== 'string' || !/^[a-f0-9]{64}$/.test(content['sha256'])) invalid('declared.sha256', 'INVALID_DIGEST', 'A lowercase SHA-256 hexadecimal digest is required.');
  return { uploadId: uuid(value['uploadId'], 'uploadId'), scope: scope(value['scope']), links: { receiptId: uuid(links['receiptId'], 'links.receiptId'), lineId: uuid(links['lineId'], 'links.lineId'), productId: uuid(links['productId'], 'links.productId'), presentationId: uuid(links['presentationId'], 'links.presentationId'), batchId: uuid(links['batchId'], 'links.batchId') }, originalFilename,
    capturedAt: datum(value['capturedAt'], instant, 'capturedAt'), declared: { mediaType, sizeBytes: content['sizeBytes'] as number, sha256: content['sha256'] } };
}
