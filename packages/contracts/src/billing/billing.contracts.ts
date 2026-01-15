import type { RpcResponse } from "../auth/auth.contracts";

export interface InvoiceSummary {
  id: string;
  number: string;
  status: string;
  amount: number;
  currency: string;
  issuedAt: string;
  dueAt?: string | null;
}

export interface ListInvoicesPayload {
  tenantId?: string;
  requestId?: string;
  limit?: number;
  offset?: number;
}

export interface ListInvoicesResult {
  invoices: InvoiceSummary[];
  total?: number;
}

export interface GetInvoicePayload {
  tenantId?: string;
  requestId?: string;
  invoiceId: string;
}

export interface GetInvoiceResult {
  invoice: InvoiceSummary | null;
}

export type ListInvoicesRpcResponse = RpcResponse<ListInvoicesResult>;
export type GetInvoiceRpcResponse = RpcResponse<GetInvoiceResult>;
