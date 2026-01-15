import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { GetByBarcodeUseCase } from "./application/get-by-barcode.usecase";
import { SearchProductsUseCase } from "./application/search-products.usecase";
import { OpenFoodFactsClient } from "./infrastructure/open-food-facts.client";
import { RedisCacheService } from "./infrastructure/redis-cache.service";
import { OffRpcController } from "./presentation/off.rpc.controller";

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [OffRpcController],
  providers: [
    OpenFoodFactsClient,
    RedisCacheService,
    GetByBarcodeUseCase,
    SearchProductsUseCase,
  ],
})
export class AppModule {}
