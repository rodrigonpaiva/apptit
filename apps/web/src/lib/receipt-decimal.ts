/** Display-only decimal arithmetic. Kitchen validates every persisted quantity independently. */
const scale = 1_000_000_000n;
export function decimal(value: string): string {
  if (!/^(0|[1-9]\d{0,14})(?:\.\d{0,8}[1-9])?$/.test(value)) throw new Error('Utilisez un nombre positif, avec au plus 9 décimales.');
  return value;
}
export function scaledDecimal(value: string): bigint {
  const [whole, fraction = ''] = decimal(value).split('.');
  return BigInt(whole!) * scale + BigInt(fraction.padEnd(9, '0'));
}
export function fromScaled(value: bigint): string {
  if (value < 0n || value > 10n ** 24n - 1n) throw new Error('Quantité hors limites.');
  const fraction = (value % scale).toString().padStart(9, '0').replace(/0+$/, '');
  return `${value / scale}${fraction ? '.' + fraction : ''}`;
}
