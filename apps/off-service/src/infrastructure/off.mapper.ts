import type { NormalizedProduct } from "@apptit/contracts";
import type { OffProductRecord } from "./open-food-facts.client";

export function mapOffProduct(
  product: OffProductRecord,
  fallbackBarcode: string,
): NormalizedProduct {
  return {
    barcode: product.code ?? fallbackBarcode,
    name: product.product_name ?? "",
    brand: product.brands ?? undefined,
    quantity: product.quantity ?? undefined,
    imageUrl: product.image_url ?? undefined,
    categories: product.categories_tags ?? undefined,
    allergens: product.allergens_tags ?? undefined,
    ingredientsText: product.ingredients_text ?? undefined,
    nutriScore: product.nutriscore_grade ?? undefined,
  };
}
