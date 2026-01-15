import { Inject, Injectable } from "@nestjs/common";
import type {
  MeResult,
  RpcResponse,
  ValidateSessionPayload,
} from "@apptit/contracts";
import type { MePort } from "../ports/me.port";
import type { ValidateSessionPort } from "../ports/session.port";
import { VALIDATE_SESSION_PORT } from "../ports/session.port";
import { assertTenantIsolation } from "../security/tenant-isolation";

@Injectable()
export class MeUseCase implements MePort {
  constructor(
    @Inject(VALIDATE_SESSION_PORT)
    private readonly validateSession: ValidateSessionPort,
  ) {}

  async execute(input: ValidateSessionPayload): Promise<RpcResponse<MeResult>> {
    const result = await this.validateSession.execute(input);

    if (!result.isValid || !result.context) {
      return {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      };
    }

    const tenantIsolationError = assertTenantIsolation(input, result.context);
    if (tenantIsolationError) {
      return tenantIsolationError;
    }

    return {
      ok: true,
      data: {
        context: {
          userId: result.context.userId,
          tenantId: result.context.tenantId,
          role: result.context.role,
        },
      },
    };
  }
}
