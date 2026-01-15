import { Injectable, Logger } from "@nestjs/common";
import type {
  OffSearchPayload,
  OffSearchResult,
  OffSearchRpcResponse,
} from "@apptit/contracts";
import { mapOffProduct } from "../infrastructure/off.mapper";
import { OpenFoodFactsClient } from "../infrastructure/open-food-facts.client";
import { RedisCacheService } from "../infrastructure/redis-cache.service";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

@Injectable()
export class SearchProductsUseCase {
  private readonly logger = new Logger(SearchProductsUseCase.name);

  constructor(
    private readonly offClient: OpenFoodFactsClient,
    private readonly cache: RedisCacheService,
  ) {}

  async execute(payload: OffSearchPayload): Promise<OffSearchRpcResponse> {
    const query = payload.query?.trim();
    if (!query) {
      return {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Query is required" },
      };
    }

    const page = payload.page && payload.page > 0 ? payload.page : DEFAULT_PAGE;
    const pageSize = payload.pageSize && payload.pageSize > 0 ? payload.pageSize : DEFAULT_PAGE_SIZE;

    const cached = await this.cache.getSearch<OffSearchResult>(query, page, pageSize);
    if (cached) {
      return { ok: true, data: cached };
    }

    try {
      const response = await this.offClient.search(query, page, pageSize);
      const items = (response.products ?? []).map((product) =>
        mapOffProduct(product, product.code ?? ""),
      );
      const result: OffSearchResult = {
        items,
        pagination: {
          page,
          pageSize,
          total: response.count,
        },
        source: "open_food_facts",
      };

      await this.cache.setSearch(query, page, pageSize, result);
      return { ok: true, data: result };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to search query="${query}"`, err.stack);
      return {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Open Food Facts search failed" },
      };
    }
  }
}
