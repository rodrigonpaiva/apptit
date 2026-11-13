import type { CatalogueProduct } from './catalogue.js';
export interface LookupField { state: 'known' | 'unknown'; value: string | null; reason: string | null }
export interface LookupProduct { imageUrl: string | null; name: LookupField; brands: LookupField; presentation: LookupField; allergens: LookupField; nutrition: LookupField }
export interface LookupSource {
  provider: 'open_food_facts'; apiVersion: '3.4'; url: string; retrievedAt: string; sourceUpdatedAt: string | null;
  cached: boolean; synthetic: boolean; reviewState: 'unreviewed';
}
/** A source candidate, never a received batch/date/quantity or an approved safety record. */
export interface ProductLookup {
  state: 'found' | 'incomplete' | 'absent' | 'unavailable'; barcode: string; product: LookupProduct | null;
  source: LookupSource | null; missing: string[]; reason: string | null; retryAfterSeconds: number | null;
}
export interface ScopedProductLookup extends ProductLookup { localCandidates: CatalogueProduct[] }
