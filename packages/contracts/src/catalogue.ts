import type { ReceiptProductIdentity } from './receiving.js';
/** Product references/presentations only: never received batches or stock availability. */
export interface CatalogueProduct {
  id: string;
  name: string;
  presentation: string;
  barcode: string | null;
  reference?: ReceiptProductIdentity | null;
  reviewState?: 'unreviewed';
  imageUrl?: string | null;
}
export interface CataloguePage {
  items: CatalogueProduct[];
  hasMore: boolean;
}

/** Resolves an unreviewed persistent reference, never stock or food-safety approval. */
export interface ResolveProductReference {
  scope: { tenantId: string; siteId: string }; operationId: string;
  selection: ReceiptProductIdentity | null; name: string; presentation: string; barcode: string | null;
}
export interface ProductReferenceResolution { reference: ReceiptProductIdentity; reviewState: 'unreviewed' }
