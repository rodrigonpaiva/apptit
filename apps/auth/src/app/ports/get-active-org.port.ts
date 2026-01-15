import type {
  GetActiveOrgPayload,
  GetActiveOrgResult,
  RpcResponse,
} from "@apptit/contracts";

export interface GetActiveOrgPort {
  execute(
    payload: GetActiveOrgPayload,
  ): Promise<RpcResponse<GetActiveOrgResult>>;
}

export const GET_ACTIVE_ORG_PORT = "GET_ACTIVE_ORG_PORT";
