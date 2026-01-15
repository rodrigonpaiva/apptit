import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import type {
  OffGetByBarcodePayload,
  OffGetByBarcodeRpcResponse,
  OffSearchPayload,
  OffSearchRpcResponse,
} from "@apptit/contracts";
import { OFF_GET_BY_BARCODE, OFF_SEARCH } from "@apptit/contracts";
import { GetByBarcodeUseCase } from "../application/get-by-barcode.usecase";
import { SearchProductsUseCase } from "../application/search-products.usecase";

@Controller()
export class OffRpcController {
  constructor(
    private readonly getByBarcodeUseCase: GetByBarcodeUseCase,
    private readonly searchProductsUseCase: SearchProductsUseCase,
  ) {}

  @MessagePattern(OFF_GET_BY_BARCODE)
  async getByBarcode(
    @Payload() payload: OffGetByBarcodePayload,
  ): Promise<OffGetByBarcodeRpcResponse> {
    return this.getByBarcodeUseCase.execute(payload);
  }

  @MessagePattern(OFF_SEARCH)
  async search(
    @Payload() payload: OffSearchPayload,
  ): Promise<OffSearchRpcResponse> {
    return this.searchProductsUseCase.execute(payload);
  }
}
