import type { RpcResponse } from "../auth/auth.contracts";

export interface NormalizedProduct {
  barcode: string;
  name: string;
  brand?: string;
  quantity?: string;
  imageUrl?: string;
  categories?: string[];
  allergens?: string[];
  ingredientsText?: string;
  nutriScore?: string;
}

export interface OffGetByBarcodePayload {
  barcode: string;
}

export interface OffGetByBarcodeResult {
  found: boolean;
  product?: NormalizedProduct;
  source: "open_food_facts";
}

export type OffGetByBarcodeRpcResponse = RpcResponse<OffGetByBarcodeResult>;
