import { Inject, Injectable } from "@nestjs/common";
import type {
  MeResult,
  RpcResponse,
  ValidateSessionPayload,
} from "@apptit/contracts";
import type { ValidateSessionPort } from "../ports/session.port";
import { VALIDATE_SESSION_PORT } from "../ports/session.port";

@Injectable()
export class MeUseCase {
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

    return {
      ok: true,
      data: { context: result.context },
    };
  }
}
