import type {
  ValidateSessionPayload,
  ValidateSessionResult,
  SessionContext,
} from "@apptit/contracts";

export interface ValidateSessionPort {
  execute(input: ValidateSessionPayload): Promise<ValidateSessionResult>;
}

export const VALIDATE_SESSION_PORT = "VALIDATE_SESSION_PORT";

export type { SessionContext };
