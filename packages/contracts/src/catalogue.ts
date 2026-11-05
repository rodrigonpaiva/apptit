/** Product references/presentations only: never received batches or stock availability. */
export interface CatalogueProduct {
  id: string;
  name: string;
  presentation: string;
  barcode: string | null;
}
export interface CataloguePage {
  items: CatalogueProduct[];
  hasMore: boolean;
}
