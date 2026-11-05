import test from 'node:test';
import assert from 'node:assert/strict';
import { addDecimals, decimal, quantity, quantityDatum, quantityDraftData, localDate, instant, dateAtSite, toBaseQuantity, validate } from '../packages/domain-values/dist/index.js';
const known = value => ({ state: 'known', value, quality: 'measured', sourceRef: 'synthetic/manual' });
const unknown = { state: 'unknown', reason: 'Not observed' };
const value = (amount = '0', resolution = '1') => ({ amount, resolution, unit: 'g', basis: 'as_received' });
test('exact decimals round-trip maximum precision, sum without binary float loss and reject silent rounding/coercion', () => {
  const maximum = '999999999999999.999999999';
  assert.equal(decimal(maximum), maximum);
  assert.equal(addDecimals('0.1', '0.2'), '0.3');
  assert.equal(addDecimals('999999999999998.999999999', '1'), maximum);
  assert.equal(addDecimals('-0.1', '0.1'), '0');
  assert.throws(() => addDecimals(maximum, '0.000000001'));
  for (const invalid of [1, NaN, Infinity, 'NaN', '1e3', '+1', '01', '-0', '1.0', '0.0000000001', '1000000000000000', '', ' 1']) {
    assert.equal(validate(() => decimal(invalid)).ok, false);
  }
});
test('quantity validates units/bases/counts and observation resolution without treating estimates as weighed facts', () => {
  assert.deepEqual(quantity(value()), value());
  for (const invalid of [{ ...value(), unit: 'kg' }, { ...value(), basis: 'cooked_guess' }, value('-1'), value('1', '0'), { ...value('0.5'), unit: 'each' }, { ...value('1', '0.1'), unit: 'each' }]) assert.throws(() => quantity(invalid));
  assert.throws(() => quantityDatum(known(value('1.1', '1'))));
  const estimated = { ...known(value('1.1', '1')), quality: 'estimated' };
  assert.equal(quantityDatum(estimated).quality, 'estimated');
});
test('unknown, measured zero, estimated and imported survive serialization with their distinct meaning', () => {
  for (const datum of [unknown, known(value()), { ...known(value('1')), quality: 'estimated' }, { ...known(value('1')), quality: 'imported' }]) {
    assert.deepEqual(quantityDatum(JSON.parse(JSON.stringify(datum))), datum);
  }
  for (const mixed of [{ ...unknown, value: value() }, { ...unknown, quality: 'measured' }, { state: 'unknown' }, { ...known(value()), quality: 'confirmed' }, { ...known(value()), sourceRef: '' }]) assert.throws(() => quantityDatum(mixed));
});
test('date-only labels reject impossible dates and never become UTC instants', () => {
  for (const date of ['0001-01-01', '2024-02-29', '2026-03-29', '2000-02-29', '9999-12-31']) assert.equal(localDate(date), date);
  for (const date of ['0000-01-01', '1900-02-29', '2026-02-29', '2026-04-31', '2026-01-00', '2026-13-01', '2026-11-04T00:00:00Z']) assert.throws(() => localDate(date));
  assert.equal(instant('2026-11-04T12:00:00Z'), '2026-11-04T12:00:00.000Z');
  for (const date of ['2026-02-30T12:00:00Z', '2026-11-04', '2026-11-04T24:00:00Z', '2026-11-04T12:60:00Z', '2026-11-04T12:00:60Z', '2026-11-04T12:00:00+01:00', '2026-11-04T12:00:00.0001Z']) assert.throws(() => instant(date));
});
test('site calendar conversion uses Europe/Paris DST without rewriting date labels', () => {
  assert.equal(dateAtSite('2026-03-28T23:30:00Z', 'Europe/Paris'), '2026-03-29');
  assert.equal(dateAtSite('2026-10-24T22:30:00Z', 'Europe/Paris'), '2026-10-25');
  assert.equal(dateAtSite('2026-10-25T23:30:00Z', 'Europe/Paris'), '2026-10-26');
  assert.throws(() => dateAtSite('2026-11-04T00:00:00Z', '+01:00'));
});
test('exact metric conversion retains the original source quantity and does not infer mass/volume factors', () => {
  const converted = toBaseQuantity({ amount: '5', unit: 'kg', basis: 'raw_net', resolution: '0.001' });
  assert.deepEqual(converted.quantity, { amount: '5000', unit: 'g', basis: 'raw_net', resolution: '1' });
  assert.equal(converted.provenance.original.unit, 'kg');
  assert.equal(converted.provenance.factor, '1000');
  assert.equal(toBaseQuantity({ amount: '0.1', unit: 'l', basis: 'as_received', resolution: '0.001' }).quantity.amount, '100');
  assert.throws(() => toBaseQuantity({ amount: '1', unit: 'bag', basis: 'as_received', resolution: '1' }));
});
test('draft validation returns field-specific safe errors, rejects extra authority fields and preserves expiry type', () => {
  const data = { label: 'Synthetic rice', quantity: known(value('1')), expiry: unknown, observedAt: unknown };
  const result = validate(() => quantityDraftData({ ...data, quantity: known({ ...value(), unit: 'litre' }) }));
  assert.equal(result.error.code, 'INVALID_INPUT');
  assert.equal(result.error.retry, 'after_review');
  assert.equal(result.error.issues[0].field, 'quantity.value.unit');
  assert.throws(() => quantityDraftData({ ...data, createdBy: 'client-forged-author' }));
  for (const kind of ['use_by', 'best_before', 'after_opening']) {
    const withExpiry = { ...data, expiry: { state: 'known', quality: 'imported', sourceRef: 'synthetic/label', value: { kind, date: '2026-11-04', sourceRef: 'synthetic/photo' } } };
    assert.equal(quantityDraftData(withExpiry).expiry.value.kind, kind);
  }
});
