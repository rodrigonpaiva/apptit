import type { ReceiptItemDetails, ReceiptLineDraft, ReceiptWorkspaceSnapshot, SaveReceiptWorkspace, SiteAccess, Unit } from '@apptit/contracts';
import { decimal, fromScaled, scaledDecimal } from './receipt-decimal';
export interface ReceiptSeed { name: string; presentation: string; barcode: string | null }
export interface ReceiptEditorLine extends ReceiptSeed {
  id: string; batchId: string; productId: string; presentationId: string; presentationVersion: number; batch: string; expiry: string; expiryKind: 'use_by' | 'best_before'; destination: string;
  amount: string; unit: 'g' | 'kg' | 'ml' | 'l' | 'each'; mode: 'direct' | 'packs'; count: string; factor: string; checked: boolean; physicalMatch: boolean;
}
export function newReceiptLine(seed: ReceiptSeed): ReceiptEditorLine { return { ...seed, id: crypto.randomUUID(), batchId: crypto.randomUUID(), productId: crypto.randomUUID(), presentationId: crypto.randomUUID(), presentationVersion: 1, batch: '', expiry: '', expiryKind: 'use_by', destination: '', amount: '', unit: 'g', mode: 'direct', count: '', factor: '', checked: false, physicalMatch: false }; }
function canonical(value: string): string {
  const normalized = value.trim().replace(',', '.').replace(/^(\d+)\.0+$/, '$1').replace(/(\.\d*?[1-9])0+$/, '$1');
  return decimal(normalized);
}
export function baseAmount(amount: string, unit: ReceiptEditorLine['unit']) { const scaled = scaledDecimal(canonical(amount)); if (scaled < 0n) throw new Error('La quantité doit être positive.'); return fromScaled(scaled * (unit === 'kg' || unit === 'l' ? 1000n : 1n)); }
export function lineQuantity(line: ReceiptEditorLine): { amount: string; unit: Unit } | null {
  const unit = line.unit === 'kg' ? 'g' : line.unit === 'l' ? 'ml' : line.unit;
  if (line.mode === 'direct') { const amount = line.amount.trim() ? baseAmount(line.amount, line.unit) : null; if (unit === 'each' && amount?.includes('.')) throw new Error('Le nombre d’unités doit être entier.'); return amount ? { amount, unit } : null; }
  if (!line.count && !line.factor) return null;
  const count = canonical(line.count); if (count.includes('.') || scaledDecimal(count) <= 0n || !line.checked) throw new Error('Vérifiez le nombre entier de conditionnements et leur contenu sur l’étiquette.');
  const factor = baseAmount(line.factor, line.unit); if (unit === 'each' && factor.includes('.')) throw new Error('Le contenu en unités doit être entier.'); if (scaledDecimal(factor) <= 0n) throw new Error('Le contenu par conditionnement doit être positif.');
  return { amount: fromScaled(BigInt(count) * scaledDecimal(factor)), unit };
}
export function displayQuantity(value: { amount: string; unit: Unit }): string {
  const scaled = scaledDecimal(value.amount);
  return value.unit === 'g' && scaled >= 1000_000000000n && scaled % 1000n === 0n ? `${fromScaled(scaled / 1000n)} kg` : value.unit === 'ml' && scaled >= 1000_000000000n && scaled % 1000n === 0n ? `${fromScaled(scaled / 1000n)} l` : `${value.amount} ${value.unit === 'each' ? 'unité(s)' : value.unit}`;
}
const unknown = { state: 'unknown', reason: 'Non renseigné par l’opérateur — en attente' } as const;
const known = <T,>(value: T) => ({ state: 'known', value, quality: 'estimated', sourceRef: 'operator/receipt-draft' } as const);
export function receiptCommand(site: SiteAccess, id: string, version: number, supplier: string, receivedAt: string, lines: ReceiptEditorLine[]): SaveReceiptWorkspace {
  const items: ReceiptItemDetails[] = [];
  const payloadLines: ReceiptLineDraft[] = lines.map(line => {
    if (!line.name.trim() || !line.presentation.trim()) throw new Error('Renseignez le nom et la présentation de chaque ligne.');
    const q = lineQuantity(line);
    items.push({ lineId: line.id, name: line.name.trim(), presentation: line.presentation.trim(), barcode: line.barcode, physicalMatch: line.physicalMatch, pack: line.mode === 'packs' && q ? { count: canonical(line.count), factor: baseAmount(line.factor, line.unit), unit: q.unit, checked: true } : null });
    return { id: line.id, product: { productId: line.productId, presentationId: line.presentationId, presentationVersion: line.presentationVersion }, batch: { id: line.batchId, code: line.batch.trim() ? known(line.batch.trim()) : unknown, expiry: line.expiry ? known({ kind: line.expiryKind, date: line.expiry, sourceRef: 'operator/physical-label' }) : unknown }, received: q ? known({ ...q, basis: 'as_received', resolution: q.unit === 'each' ? '1' : '0.000000001' }) : unknown, disposition: unknown, destinationLocationId: line.destination ? known(line.destination) : unknown, evidenceIds: [] };
  });
  return { command: { schemaVersion: 1, operationId: crypto.randomUUID(), receiptId: id, scope: { tenantId: site.tenantId, siteId: site.siteId }, expectedVersion: version, payload: { supplierReference: supplier.trim() ? known(supplier.trim()) : unknown, receivedAt: receivedAt ? known(new Date(receivedAt).toISOString()) : unknown, lines: payloadLines } }, items };
}
export function restoreReceipt(snapshot: ReceiptWorkspaceSnapshot): ReceiptEditorLine[] {
  return snapshot.draft.data.lines.map(line => {
    const item = snapshot.items.find(item => item.lineId === line.id)!;
    return { id: line.id, batchId: line.batch.id, productId: line.product.productId, presentationId: line.product.presentationId, presentationVersion: line.product.presentationVersion, name: item.name, presentation: item.presentation, barcode: item.barcode, batch: line.batch.code.state === 'known' ? line.batch.code.value : '', expiry: line.batch.expiry.state === 'known' ? line.batch.expiry.value.date : '', expiryKind: line.batch.expiry.state === 'known' && line.batch.expiry.value.kind === 'best_before' ? 'best_before' : 'use_by', destination: line.destinationLocationId.state === 'known' ? line.destinationLocationId.value : '', amount: line.received.state === 'known' ? line.received.value.amount : '', unit: item.pack?.unit ?? (line.received.state === 'known' ? line.received.value.unit : 'g'), mode: item.pack ? 'packs' : 'direct', count: item.pack?.count ?? '', factor: item.pack?.factor ?? '', checked: Boolean(item.pack?.checked), physicalMatch: item.physicalMatch };
  });
}
export async function receiptRequest<T>(action: 'save' | 'read' | 'list' | 'locations', input: unknown, signal?: AbortSignal): Promise<T> {
  const bootstrap = await fetch('/api/session/csrf', { credentials: 'same-origin', cache: 'no-store', signal });
  if (!bootstrap.ok) throw new Error('UNAVAILABLE'); const { csrfToken } = await bootstrap.json() as { csrfToken: string };
  const response = await fetch(`/api/receipts/${action}`, { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal, headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify(input) });
  if (!response.ok) { const body = await response.json().catch(() => ({})) as { code?: string }; throw new Error(body.code ?? 'OUTCOME_UNCERTAIN'); }
  return response.json() as Promise<T>;
}
