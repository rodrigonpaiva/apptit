import type { ValidateSessionPort, SessionContext } from "../ports/session.port";

export class ValidateSessionUseCase implements ValidateSessionPort {
  async execute(input: { cookie?: string; authorization?: string }): Promise<{
    isValid: boolean;
    context?: SessionContext;
  }> {
    // TODO: conectar ao Better Auth (sem overcoding agora)
    void input;
    return { isValid: false };
  }
}
