import { Resolver, Query, Args, Context } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import type { GraphqlContext } from "../auth/auth.context";
import { BillingClientService } from "../billing/billing.client";
import { InvoiceConnectionType, InvoiceSummaryType } from "./billing.types";
import { BillingGetInput, BillingListInput } from "./billing.inputs";
import { TenantArg } from "../auth/tenant.decorator";
import { TenantGuard } from "../auth/tenant.guard";

@Resolver()
export class BillingResolver {
  constructor(private readonly billingClient: BillingClientService) {}

  @TenantArg("input.tenantId")
  @UseGuards(TenantGuard)
  @Query(() => InvoiceConnectionType)
  async invoices(
    @Context() ctx: GraphqlContext,
    @Args("input", { nullable: true }) input?: BillingListInput,
  ): Promise<InvoiceConnectionType> {
    if (process.env.BILLING_ENABLED !== "true") {
      return { invoices: [], total: 0 };
    }

    const tenantId = input?.tenantId ?? ctx.session?.tenantId;
    const result = await this.billingClient.listInvoices({
      tenantId,
      requestId: ctx.requestId,
      limit: input?.limit,
      offset: input?.offset,
    });

    return result.ok
      ? { invoices: result.data.invoices, total: result.data.total }
      : { invoices: [], total: 0 };
  }

  @TenantArg("input.tenantId")
  @UseGuards(TenantGuard)
  @Query(() => InvoiceSummaryType, { nullable: true })
  async invoice(
    @Context() ctx: GraphqlContext,
    @Args("input") input: BillingGetInput,
  ): Promise<InvoiceSummaryType | null> {
    if (process.env.BILLING_ENABLED !== "true") {
      return null;
    }

    const tenantId = input.tenantId ?? ctx.session?.tenantId;
    const result = await this.billingClient.getInvoice({
      tenantId,
      requestId: ctx.requestId,
      invoiceId: input.invoiceId,
    });

    return result.ok ? result.data.invoice : null;
  }
}
