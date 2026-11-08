import type { ConditionObservation, Datum, ObservationAssessment, ReceivingAssessment, ReceivingObservationData, ReceivingObservationProfile, SaveReceivingObservation, TemperatureObservation } from '@apptit/contracts';
import { datum, decimal, instant, invalid, object, scaledDecimal, scope, text, uuid } from './index.js';
function version(input: unknown, field: string, minimum = 1): number {
  if (!Number.isInteger(input) || (input as number) < minimum || (input as number) >= 2147483647) invalid(field, 'INVALID_VERSION', 'A bounded integer version is required.');
  return input as number;
}
function observation(input: unknown, field: string, temperature: true): TemperatureObservation;
function observation(input: unknown, field: string, temperature: false): ConditionObservation;
function observation(input: unknown, field: string, temperature: boolean): TemperatureObservation | ConditionObservation {
  const state = (input as { state?: unknown } | null)?.state;
  if (state === 'pending' || state === 'not_applicable') { const gap = object(input, ['state', 'reason'], field); return { state, reason: text(gap['reason'], `${field}.reason`) }; }
  const value = object(input, temperature ? ['state', 'value', 'unit', 'quality', 'method', 'instrument', 'observedAt'] : ['state', 'value', 'method', 'observedAt'], field);
  if (state !== 'recorded') invalid(field, 'INVALID_STATE', 'An explicit observation or gap is required.');
  const method = datum(value['method'], text, `${field}.method`); const observedAt = datum(value['observedAt'], instant, `${field}.observedAt`);
  if (!temperature) { if (value['value'] !== 'intact' && value['value'] !== 'damaged') invalid(`${field}.value`, 'INVALID_CONDITION', 'An actual condition is required.'); return { state, value: value['value'], method, observedAt }; }
  if (value['unit'] !== 'Cel') invalid(`${field}.unit`, 'INVALID_UNIT', 'This fixture procedure requires Celsius; no inferred conversion.');
  if (value['quality'] !== 'measured' && value['quality'] !== 'estimated') invalid(`${field}.quality`, 'INVALID_QUALITY', 'Actual measurement and estimate must remain distinct.');
  return { state, value: decimal(value['value'], `${field}.value`), unit: 'Cel', quality: value['quality'], method, observedAt, instrument: datum(value['instrument'], text, `${field}.instrument`) };
}
export function receivingObservationData(input: unknown): ReceivingObservationData {
  const value = object(input, ['temperature', 'condition', 'notes'], 'data');
  return { temperature: observation(value['temperature'], 'temperature', true), condition: observation(value['condition'], 'condition', false), notes: value['notes'] === null ? null : text(value['notes'], 'notes') };
}
export function saveReceivingObservation(input: unknown): SaveReceivingObservation {
  const value = object(input, ['schemaVersion', 'scope', 'id', 'operationId', 'expectedVersion', 'expectedReceiptVersion', 'target', 'profile', 'data', 'correctionReason'], 'observation');
  if (value['schemaVersion'] !== 1) invalid('schemaVersion', 'INVALID_SCHEMA', 'Schema version 1 is required.');
  const target = object(value['target'], ['receiptId', 'lineId', 'productId', 'presentationId', 'batchId'], 'target'); const profile = object(value['profile'], ['id', 'version'], 'profile');
  const expectedVersion = version(value['expectedVersion'], 'expectedVersion', 0);
  const correctionReason = value['correctionReason'] === null ? null : text(value['correctionReason'], 'correctionReason');
  if (expectedVersion > 0 && !correctionReason) invalid('correctionReason', 'REASON_REQUIRED', 'Correction must preserve the original with an explicit reason.');
  return { schemaVersion: 1, scope: scope(value['scope']), id: uuid(value['id'], 'id'), operationId: uuid(value['operationId'], 'operationId'), expectedVersion, expectedReceiptVersion: version(value['expectedReceiptVersion'], 'expectedReceiptVersion'), target: { receiptId: uuid(target['receiptId'], 'receiptId'), lineId: uuid(target['lineId'], 'lineId'), productId: uuid(target['productId'], 'productId'), presentationId: uuid(target['presentationId'], 'presentationId'), batchId: uuid(target['batchId'], 'batchId') }, profile: { id: text(profile['id'], 'profile.id', 100), version: version(profile['version'], 'profile.version') }, data: receivingObservationData(value['data']), correctionReason };
}
function contextReasons(value: { method: Datum<string>; observedAt: Datum<string> }, profile: ReceivingObservationProfile, now: Date): string[] {
  const reasons: string[] = [];
  if (value.method.state !== 'known') reasons.push('METHOD_MISSING');
  else if (value.method.quality !== 'measured') reasons.push('METHOD_NOT_CONFIRMED');
  if (value.observedAt.state !== 'known') reasons.push('OBSERVED_TIME_MISSING');
  else { if (value.observedAt.quality !== 'measured') reasons.push('OBSERVED_TIME_UNCERTAIN'); const elapsed = now.getTime() - new Date(value.observedAt.value).getTime(); if (elapsed < -profile.futureToleranceSeconds * 1000) reasons.push('OBSERVED_IN_FUTURE'); else if (elapsed > profile.maxAgeSeconds * 1000) reasons.push('OBSERVATION_STALE'); }
  return reasons;
}
/** Assessment of illustrative fixture limits only; never disposition, stock eligibility or legal compliance. */
export function assessReceivingObservation(data: ReceivingObservationData, profile: ReceivingObservationProfile, now: Date): ReceivingAssessment {
  if (profile.synthetic !== true || profile.validatedForOperation !== false || profile.stage !== 'receiving' || !Number.isFinite(now.getTime()) || scaledDecimal(profile.temperature.minimum) > scaledDecimal(profile.temperature.maximum)) invalid('profile', 'INVALID_PROFILE', 'Only an explicit valid synthetic receiving fixture may be evaluated.');
  function assess(value: TemperatureObservation | ConditionObservation, temperature: boolean): ObservationAssessment {
    const required = temperature ? profile.temperature.required : profile.condition.required;
    if (value.state === 'pending') return { state: 'pending', reasons: ['OBSERVATION_MISSING'] };
    if (value.state === 'not_applicable') return { state: required ? 'inconclusive' : 'not_applicable', reasons: required ? ['REQUIRED_CONTROL_NOT_APPLICABLE'] : ['JUSTIFIED_NOT_APPLICABLE'] };
    const reasons = contextReasons(value, profile, now);
    if ('unit' in value) { if (value.unit !== profile.temperature.unit) reasons.push('UNIT_MISMATCH'); if (value.quality !== 'measured') reasons.push('MEASUREMENT_NOT_CONFIRMED'); if (profile.temperature.requireInstrument && value.instrument.state !== 'known') reasons.push('INSTRUMENT_MISSING'); else if (profile.temperature.requireInstrument && value.instrument.state === 'known' && value.instrument.quality !== 'measured') reasons.push('INSTRUMENT_NOT_CONFIRMED'); }
    if (reasons.length) return { state: 'inconclusive', reasons };
    const outside = 'unit' in value ? scaledDecimal(value.value) < scaledDecimal(profile.temperature.minimum) || scaledDecimal(value.value) > scaledDecimal(profile.temperature.maximum) : value.value !== profile.condition.expected;
    return { state: outside ? 'deviation' : 'within_rule', reasons: [outside ? 'OUTSIDE_SYNTHETIC_RULE' : 'WITHIN_SYNTHETIC_RULE'] };
  }
  const temperature = assess(data.temperature, true), condition = assess(data.condition, false); const states = [temperature.state, condition.state];
  const overall = states.includes('deviation') ? 'deviation' : states.includes('inconclusive') ? 'inconclusive' : states.includes('pending') ? 'pending' : states.every(state => state === 'not_applicable') ? 'not_applicable' : 'within_rule';
  return { temperature, condition, overall };
}
