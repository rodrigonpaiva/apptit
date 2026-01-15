import type { RpcResponse } from "../auth/auth.contracts";

export interface OrderSummary {
  id: string;
  number: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
}

export interface ListOrdersPayload {
  tenantId?: string;
  requestId?: string;
  limit?: number;
  offset?: number;
}

export interface ListOrdersResult {
  orders: OrderSummary[];
  total?: number;
}

export interface GetOrderPayload {
  tenantId?: string;
  requestId?: string;
  orderId: string;
}

export interface GetOrderResult {
  order: OrderSummary | null;
}

export type ListOrdersRpcResponse = RpcResponse<ListOrdersResult>;
export type GetOrderRpcResponse = RpcResponse<GetOrderResult>;
