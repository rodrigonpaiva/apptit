import type { Datum, Expiry, Quantity, QuantityDraftData, Result, Scope, ValidationIssue } from '@apptit/contracts';

export class InputError extends Error {
  constructor(public readonly issue: ValidationIssue) { super(issue.message); }
}
export function invalid(field: string, code: string, message: string): never {
  throw new InputError({ field, code, message });
}
export function validate<T>(parse: () => T): Result<T> {
  try { return { ok: true, value: parse() }; }
  catch (error) {
    if (!(error instanceof InputError)) throw error;
    return { ok: false, error: { code: 'INVALID_INPUT', message: 'Input requires correction.', retry: 'after_review', issues: [error.issue] } };
  }
}
export function object(input: unknown, fields: readonly string[], field: string): Record<string, unknown> {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) invalid(field, 'INVALID_OBJECT', 'Expected an object.');
  const value = input as Record<string, unknown>;
  if (Object.keys(value).some(key => !fields.includes(key))) invalid(field, 'UNKNOWN_FIELD', 'Unexpected fields are not accepted.');
  return value;
}
export function text(input: unknown, field: string, max = 500): string {
  if (typeof input !== 'string' || !input.trim() || input.length > max) invalid(field, 'INVALID_TEXT', 'A nonempty bounded text value is required.');
  return input.trim();
}
export function uuid(input: unknown, field: string): string {
  if (typeof input !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input)) invalid(field, 'INVALID_ID', 'A valid UUID is required.');
  return input.toLowerCase();
}
export function scope(input: unknown): Scope {
  const value = object(input, ['tenantId', 'siteId'], 'scope');
  return { tenantId: uuid(value['tenantId'], 'scope.tenantId'), siteId: uuid(value['siteId'], 'scope.siteId') };
}
const SCALE = 1_000_000_000n;
const MAX_SCALED = 10n ** 24n - 1n;
/** Exact signed NUMERIC(24,9) wire representation. Never passes through JS Number. */
export function decimal(input: unknown, field = 'amount'): string {
  if (typeof input !== 'string' || input.length > 26 || !/^-?(0|[1-9]\d{0,14})(?:\.\d{0,8}[1-9])?$/.test(input) || input === '-0') {
    invalid(field, 'DECIMAL_FORMAT', 'Use a canonical decimal string with at most 15 integer and 9 fractional digits.');
  }
  return input;
}
export function scaledDecimal(input: unknown, field = 'amount'): bigint {
  const value = decimal(input, field);
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = (negative ? value.slice(1) : value).split('.');
  const scaled = BigInt(whole!) * SCALE + BigInt(fraction.padEnd(9, '0'));
  return negative ? -scaled : scaled;
}
export function fromScaled(value: bigint): string {
  const absolute = value < 0n ? -value : value;
  if (absolute > MAX_SCALED) invalid('amount', 'DECIMAL_RANGE', 'Calculated value exceeds supported precision.');
  const fraction = (absolute % SCALE).toString().padStart(9, '0').replace(/0+$/, '');
  return `${value < 0n ? '-' : ''}${absolute / SCALE}${fraction ? '.' + fraction : ''}`;
}
export function addDecimals(left: string, right: string): string {
  return fromScaled(scaledDecimal(left) + scaledDecimal(right));
}
export function quantity(input: unknown, field = 'quantity'): Quantity {
  const value = object(input, ['amount', 'unit', 'basis', 'resolution'], field);
  const amount = decimal(value['amount'], `${field}.amount`);
  const resolution = decimal(value['resolution'], `${field}.resolution`);
  if (scaledDecimal(amount) < 0n) invalid(`${field}.amount`, 'NEGATIVE_QUANTITY', 'Quantity cannot be negative.');
  if (scaledDecimal(resolution) <= 0n) invalid(`${field}.resolution`, 'INVALID_RESOLUTION', 'Resolution must be positive.');
  const unit = value['unit'];
  if (unit !== 'g' && unit !== 'ml' && unit !== 'each') invalid(`${field}.unit`, 'INVALID_UNIT', 'Supported base units are g, ml and each.');
  const basis = value['basis'];
  if (basis !== 'as_received' && basis !== 'raw_net' && basis !== 'prepared') invalid(`${field}.basis`, 'INVALID_BASIS', 'A supported quantity basis is required.');
  if (unit === 'each' && (amount.includes('.') || resolution.includes('.'))) invalid(field, 'FRACTIONAL_COUNT', 'Count quantities and count resolution must be integral.');
  return Object.freeze({ amount, unit, basis, resolution });
}
export function datum<T>(input: unknown, parse: (value: unknown, field: string) => T, field: string): Datum<T> {
  if (input !== null && typeof input === 'object' && !Array.isArray(input) && (input as Record<string, unknown>)['state'] === 'unknown') {
    const value = object(input, ['state', 'reason'], field);
    return Object.freeze({ state: 'unknown', reason: text(value['reason'], `${field}.reason`) });
  }
  const value = object(input, ['state', 'value', 'quality', 'sourceRef'], field);
  if (value['state'] !== 'known') invalid(`${field}.state`, 'INVALID_STATE', 'Data must explicitly be known or unknown.');
  const quality = value['quality'];
  if (quality !== 'measured' && quality !== 'estimated' && quality !== 'imported') invalid(`${field}.quality`, 'INVALID_QUALITY', 'Known data requires measured, estimated or imported quality.');
  const result: Datum<T> = { state: 'known', quality, sourceRef: text(value['sourceRef'], `${field}.sourceRef`), value: parse(value['value'], `${field}.value`) };
  return Object.freeze(result);
}
export function quantityDatum(input: unknown, field = 'quantity'): Datum<Quantity> {
  const result = datum(input, quantity, field);
  if (result.state === 'known' && result.quality === 'measured' && scaledDecimal(result.value.amount) % scaledDecimal(result.value.resolution) !== 0n) {
    invalid(`${field}.value.amount`, 'RESOLUTION_MISMATCH', 'Measured quantity must align with its declared resolution.');
  }
  return result;
}
export function localDate(input: unknown, field = 'date'): string {
  if (typeof input !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input)) invalid(field, 'INVALID_DATE', 'Use a valid YYYY-MM-DD calendar date.');
  const [year, month, day] = input.split('-').map(Number) as [number, number, number];
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1]!) invalid(field, 'INVALID_DATE', 'Calendar date does not exist.');
  return input;
}
export function instant(input: unknown, field = 'instant'): string {
  if (typeof input !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(input)) invalid(field, 'INVALID_INSTANT', 'Use a UTC RFC3339 instant with at most millisecond precision.');
  localDate(input.slice(0, 10), field);
  if (Number(input.slice(11, 13)) > 23 || Number(input.slice(14, 16)) > 59 || Number(input.slice(17, 19)) > 59) invalid(field, 'INVALID_INSTANT', 'Clock time does not exist.');
  return new Date(input).toISOString();
}
export function timeZone(input: unknown): string {
  if (typeof input !== 'string' || (input !== 'UTC' && !/^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+)+$/.test(input))) invalid('siteTimeZone', 'INVALID_TIME_ZONE', 'An IANA site timezone is required.');
  try { new Intl.DateTimeFormat('en', { timeZone: input }); }
  catch { invalid('siteTimeZone', 'INVALID_TIME_ZONE', 'Unknown site timezone.'); }
  return input;
}
export function dateAtSite(value: unknown, zone: string): string {
  const parts = new Intl.DateTimeFormat('en', { timeZone: timeZone(zone), year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(instant(value)));
  const part = (type: string) => parts.find(part => part.type === type)!.value;
  return localDate(`${part('year').padStart(4, '0')}-${part('month')}-${part('day')}`);
}
export function expiry(input: unknown, field = 'expiry'): Expiry {
  const value = object(input, ['kind', 'date', 'sourceRef', 'procedureVersion'], field);
  const kind = value['kind'];
  if (kind !== 'use_by' && kind !== 'best_before' && kind !== 'after_opening') invalid(`${field}.kind`, 'INVALID_EXPIRY_KIND', 'Expiry type must distinguish use-by, best-before and after-opening dates.');
  const result: Expiry = { kind, date: localDate(value['date'], `${field}.date`), sourceRef: text(value['sourceRef'], `${field}.sourceRef`) };
  if (value['procedureVersion'] !== undefined) result.procedureVersion = text(value['procedureVersion'], `${field}.procedureVersion`);
  return Object.freeze(result);
}
export function quantityDraftData(input: unknown): QuantityDraftData {
  const value = object(input, ['label', 'quantity', 'expiry', 'observedAt'], 'data');
  return Object.freeze({ label: text(value['label'], 'data.label', 200), quantity: quantityDatum(value['quantity']), expiry: datum(value['expiry'], expiry, 'expiry'), observedAt: datum(value['observedAt'], instant, 'observedAt') });
}
/** Only exact metric scaling; no mass/volume, pack or preparation-basis inference. */
export function toBaseQuantity(input: { amount: string; unit: 'kg' | 'l'; basis: Quantity['basis']; resolution: string }) {
  if (input.unit !== 'kg' && input.unit !== 'l') invalid('unit', 'INVALID_UNIT', 'Only explicit kg or l metric scaling is supported.');
  const original = { ...input };
  const converted = quantity({ amount: fromScaled(scaledDecimal(input.amount) * 1000n), unit: input.unit === 'kg' ? 'g' : 'ml', basis: input.basis, resolution: fromScaled(scaledDecimal(input.resolution) * 1000n) });
  return { quantity: converted, provenance: { original, factor: '1000', method: 'exact_metric_scaling' as const } };
}
