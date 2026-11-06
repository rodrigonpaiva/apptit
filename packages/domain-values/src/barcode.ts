import { invalid } from './index.js';
/** Keep leading zeros and original length; OFF performs its own barcode normalization. */
export function productBarcode(input: unknown): string {
  if (typeof input !== 'string' || !/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(input)) invalid('barcode', 'INVALID_BARCODE', 'Use 8, 12, 13 or 14 digits as text, preserving leading zeros.');
  return input;
}
