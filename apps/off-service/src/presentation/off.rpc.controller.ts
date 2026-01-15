import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import type { OffGetByBarcodePayload, OffGetByBarcodeRpcResponse } from "@apptit/contracts";
import { OFF_GET_BY_BARCODE } from "@apptit/contracts";
import { GetByBarcodeUseCase } from "../application/get-by-barcode.usecase";

@Controller()
export class OffRpcController {
  constructor(
    private readonly getByBarcodeUseCase: GetByBarcodeUseCase,
  ) {}

  @MessagePattern(OFF_GET_BY_BARCODE)
  async getByBarcode(
    @Payload() payload: OffGetByBarcodePayload,
  ): Promise<OffGetByBarcodeRpcResponse> {
    return this.getByBarcodeUseCase.execute(payload);
  }
}
