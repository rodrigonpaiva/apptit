import type { ScopedProductLookup } from '@apptit/contracts';
import type { ReceiptSeed } from './receipts';
/** Uses this single scoped lookup response, never a second provider call. */
export function receiptCandidate(result: ScopedProductLookup): ReceiptSeed {
  const local = result.localCandidates.find(item => item.imageUrl) ?? result.localCandidates[0];
  return { name: local?.name ?? result.product?.name.value ?? '', presentation: local?.presentation ?? result.product?.presentation.value ?? '', barcode: result.barcode,
    photo: local?.imageUrl ? { url: local.imageUrl, source: 'catalogue' } : result.product?.imageUrl ? { url: result.product.imageUrl, source: 'open_food_facts', sourceUrl: result.source?.url ?? null } : null };
}
