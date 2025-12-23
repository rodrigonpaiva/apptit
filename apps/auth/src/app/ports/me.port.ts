import type { ValidateSessionPayload, MeResult } from "@apptit/contracts";

export interface MePort {
  execute(input: ValidateSessionPayload): Promise<MeResult>;
}
