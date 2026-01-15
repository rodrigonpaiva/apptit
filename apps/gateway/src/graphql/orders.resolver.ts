import { Resolver, Query, Args, Context } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import type { GraphqlContext } from "../auth/auth.context";
import { OrdersClientService } from "../orders/orders.client";
import { OrderConnectionType, OrderSummaryType } from "./orders.types";
import { OrderGetInput, OrdersListInput } from "./orders.inputs";
import { TenantArg } from "../auth/tenant.decorator";
import { TenantGuard } from "../auth/tenant.guard";

@Resolver()
export class OrdersResolver {
  constructor(private readonly ordersClient: OrdersClientService) {}

  @TenantArg("input.tenantId")
  @UseGuards(TenantGuard)
  @Query(() => OrderConnectionType)
  async orders(
    @Context() ctx: GraphqlContext,
    @Args("input", { nullable: true }) input?: OrdersListInput,
  ): Promise<OrderConnectionType> {
    if (process.env.ORDERS_ENABLED !== "true") {
      return { orders: [], total: 0 };
    }

    const tenantId = input?.tenantId ?? ctx.session?.tenantId;
    const result = await this.ordersClient.listOrders({
      tenantId,
      requestId: ctx.requestId,
      limit: input?.limit,
      offset: input?.offset,
    });

    return result.ok
      ? { orders: result.data.orders, total: result.data.total }
      : { orders: [], total: 0 };
  }

  @TenantArg("input.tenantId")
  @UseGuards(TenantGuard)
  @Query(() => OrderSummaryType, { nullable: true })
  async order(
    @Context() ctx: GraphqlContext,
    @Args("input") input: OrderGetInput,
  ): Promise<OrderSummaryType | null> {
    if (process.env.ORDERS_ENABLED !== "true") {
      return null;
    }

    const tenantId = input.tenantId ?? ctx.session?.tenantId;
    const result = await this.ordersClient.getOrder({
      tenantId,
      requestId: ctx.requestId,
      orderId: input.orderId,
    });

    return result.ok ? result.data.order : null;
  }
}
