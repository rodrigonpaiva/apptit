import type {
  RejectInvitePayload,
  RejectInviteResult,
  RpcResponse,
} from "@apptit/contracts";

export interface RejectInvitePort {
  execute(
    payload: RejectInvitePayload,
  ): Promise<RpcResponse<RejectInviteResult>>;
}

export const REJECT_INVITE_PORT = "REJECT_INVITE_PORT";
