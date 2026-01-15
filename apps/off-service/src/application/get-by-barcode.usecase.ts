import { Injectable, Logger } from "@nestjs/common";
import type {
  OffGetByBarcodePayload,
  OffGetByBarcodeResult,
  OffGetByBarcodeRpcResponse,
} from "@apptit/contracts";
import { mapOffProduct } from "../infrastructure/off.mapper";
import { OpenFoodFactsClient } from "../infrastructure/open-food-facts.client";
import { RedisCacheService } from "../infrastructure/redis-cache.service";

@Injectable()
export class GetByBarcodeUseCase {
  private readonly logger = new Logger(GetByBarcodeUseCase.name);

  constructor(
    private readonly offClient: OpenFoodFactsClient,
    private readonly cache: RedisCacheService,
  ) {}

  async execute(payload: OffGetByBarcodePayload): Promise<OffGetByBarcodeRpcResponse> {
    const { barcode } = payload;
    if (!barcode) {
      return {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Barcode is required" },
      };
    }

    const cached = await this.cache.getBarcode<OffGetByBarcodeResult>(barcode);
    if (cached) {
      return { ok: true, data: cached };
    }

    try {
      const response = await this.offClient.getByBarcode(barcode);
      if (response.status !== 1 || !response.product) {
        const result: OffGetByBarcodeResult = {
          found: false,
          source: "open_food_facts",
        };
        await this.cache.setBarcode(barcode, result);
        return { ok: true, data: result };
      }

      const product = mapOffProduct(response.product, barcode);
      const result: OffGetByBarcodeResult = {
        found: true,
        product,
        source: "open_food_facts",
      };

      await this.cache.setBarcode(barcode, result);
      return { ok: true, data: result };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to fetch barcode=${barcode}`, err.stack);
      return {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Open Food Facts request failed" },
      };
    }
  }
}
