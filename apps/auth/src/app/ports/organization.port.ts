import type {
  RpcResponse,
  SetActiveOrgPayload,
  SetActiveOrgResult,
} from "@apptit/contracts";

export interface SetActiveOrgPort {
  execute(payload: SetActiveOrgPayload): Promise<RpcResponse<SetActiveOrgResult>>;
}

export const SET_ACTIVE_ORG_PORT = "SET_ACTIVE_ORG_PORT";
