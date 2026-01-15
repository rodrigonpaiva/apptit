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


@Injectable()
export class OpenFoodFactsClient {
  private readonly logger = new Logger(OpenFoodFactsClient.name);

  constructor(private readonly httpService: HttpService) {}

  async getByBarcode(barcode: string): Promise<OffProductResponse> {
    const url = `${BASE_URL}/api/v0/product/${barcode}.json`;
    this.logger.log(`Fetching OFF product for barcode=${barcode}`);
    const { data } = await firstValueFrom(
      this.httpService.get<OffProductResponse>(url, {
        headers: { "User-Agent": "apptit-off-service/1.0" },
      }),
    );
    return data;
  }

}
