import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

const BASE_URL = "https://world.openfoodfacts.org";

export interface OffProductRecord {
  code?: string;
  product_name?: string;
  brands?: string;
  quantity?: string;
  image_url?: string;
  categories_tags?: string[];
  allergens_tags?: string[];
  ingredients_text?: string;
  nutriscore_grade?: string;
}

export interface OffProductResponse {
  status: number;
  code?: string;
  product?: OffProductRecord;
}

export interface OffSearchResponse {
  products?: OffProductRecord[];
  count?: number;
  page?: number;
  page_size?: number;
}

@Injectable()
export class OpenFoodFactsClient {
  private readonly logger = new Logger(OpenFoodFactsClient.name);

  constructor(private readonly httpService: HttpService) {}

  async getByBarcode(barcode: string): Promise<OffProductResponse> {
    const url = `${BASE_URL}/api/v0/product/${barcode}.json`;
    this.logger.log(`Fetching OFF product for barcode=${barcode}`);
    const { data } = await firstValueFrom(this.httpService.get<OffProductResponse>(url));
    return data;
  }

  async search(query: string, page: number, pageSize: number): Promise<OffSearchResponse> {
    const url = `${BASE_URL}/cgi/search.pl`;
    this.logger.log(`Searching OFF products query="${query}" page=${page} pageSize=${pageSize}`);
    const { data } = await firstValueFrom(
      this.httpService.get<OffSearchResponse>(url, {
        params: {
          search_terms: query,
          search_simple: 1,
          json: 1,
          page,
          page_size: pageSize,
        },
      }),
    );
    return data;
  }
}
