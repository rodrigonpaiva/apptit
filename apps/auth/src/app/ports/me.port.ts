import type {
  ValidateSessionPayload,
  MeResult,
  RpcResponse,
} from "@apptit/contracts";

export interface MePort {
  execute(input: ValidateSessionPayload): Promise<RpcResponse<MeResult>>;
}
