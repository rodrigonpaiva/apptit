import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom, timeout } from "rxjs";
import type {
  GetOrderPayload,
  GetOrderRpcResponse,
  ListOrdersPayload,
  ListOrdersRpcResponse,
  RpcResponse,
} from "@apptit/contracts";
import { ORDERS_GET, ORDERS_LIST } from "@apptit/contracts";
import { AUTH_SERVICE } from "../auth/auth.constants";

@Injectable()
export class OrdersClientService {
  private readonly logger = new Logger(OrdersClientService.name);
  private readonly timeoutMs = 2000;

  constructor(@Inject(AUTH_SERVICE) private readonly client: ClientProxy) {}

  async listOrders(
    payload: ListOrdersPayload,
  ): Promise<ListOrdersRpcResponse> {
    return this.send<ListOrdersRpcResponse>(ORDERS_LIST, payload);
  }

  async getOrder(payload: GetOrderPayload): Promise<GetOrderRpcResponse> {
    return this.send<GetOrderRpcResponse>(ORDERS_GET, payload);
  }

  private async send<T extends RpcResponse<unknown>>(
    pattern: string,
    payload: { requestId?: string },
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await firstValueFrom(
        this.client.send<T>(pattern, payload).pipe(timeout(this.timeoutMs)),
      );
      this.log(pattern, payload.requestId, Date.now() - start);
      return result;
    } catch (error) {
      this.log(pattern, payload.requestId, Date.now() - start, error as Error);
      return {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Service unavailable" },
      } as T;
    }
  }

  private log(
    pattern: string,
    requestId: string | undefined,
    durationMs: number,
    error?: Error,
  ) {
    const suffix = requestId ? ` requestId=${requestId}` : "";
    if (error) {
      this.logger.error(`RPC ${pattern}${suffix} failed in ${durationMs}ms`);
      return;
    }
    this.logger.log(`RPC ${pattern}${suffix} ok in ${durationMs}ms`);
  }
}
