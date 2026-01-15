import type {
  LeaveOrgPayload,
  LeaveOrgResult,
  RpcResponse,
} from "@apptit/contracts";

export interface LeaveOrgPort {
  execute(payload: LeaveOrgPayload): Promise<RpcResponse<LeaveOrgResult>>;
}

export const LEAVE_ORG_PORT = "LEAVE_ORG_PORT";
