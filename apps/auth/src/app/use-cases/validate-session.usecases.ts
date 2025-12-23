import { Injectable } from "@nestjs/common";
import type { ValidateSessionPort } from "../ports/session.port";
import type {
  ValidateSessionPayload,
  ValidateSessionResult,
} from "@apptit/contracts";

@Injectable()
export class ValidateSessionUseCase implements ValidateSessionPort {
  async execute(
    input: ValidateSessionPayload,
  ): Promise<ValidateSessionResult> {
    // TODO: conectar ao Better Auth (sem overcoding agora)
    void input;
    return { isValid: false };
  }
}
