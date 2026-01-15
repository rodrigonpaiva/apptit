import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import type {
  RpcResponse,
  SessionContext,
  ValidateSessionPayload,
  ValidateSessionResult,
} from "@apptit/contracts";
import { AUTH_ME, AUTH_VALIDATE_SESSION } from "@apptit/contracts";
import { AUTH_SERVICE } from "./auth.constants";

@Injectable()
export class AuthClientService {
  constructor(@Inject(AUTH_SERVICE) private readonly client: ClientProxy) {}

  async validateSession(
    payload: ValidateSessionPayload,
  ): Promise<RpcResponse<ValidateSessionResult>> {
    return firstValueFrom(
      this.client.send<RpcResponse<ValidateSessionResult>>(
        AUTH_VALIDATE_SESSION,
        payload,
      ),
    );
  }

  async me(
    payload: ValidateSessionPayload,
  ): Promise<RpcResponse<{ context: SessionContext }>> {
    return firstValueFrom(
      this.client.send<RpcResponse<{ context: SessionContext }>>(
        AUTH_ME,
        payload,
      ),
    );
  }
}
