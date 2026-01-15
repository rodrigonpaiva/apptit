import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { BillingClientService } from "./billing.client";

@Module({
  imports: [AuthModule],
  providers: [BillingClientService],
  exports: [BillingClientService],
})
export class BillingModule {}
