import type {
  ValidateSessionPayload,
  ValidateSessionResult,
  SessionContext,
} from "@apptit/contracts";

export interface ValidateSessionPort {
  execute(input: ValidateSessionPayload): Promise<ValidateSessionResult>;
}

export type { SessionContext };
