import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OrdersClientService } from "./orders.client";

@Module({
  imports: [AuthModule],
  providers: [OrdersClientService],
  exports: [OrdersClientService],
})
export class OrdersModule {}
