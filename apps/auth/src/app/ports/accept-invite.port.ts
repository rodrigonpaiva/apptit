import type {
  AcceptInvitePayload,
  AcceptInviteResult,
  RpcResponse,
} from "@apptit/contracts";

export interface AcceptInvitePort {
  execute(
    payload: AcceptInvitePayload,
  ): Promise<RpcResponse<AcceptInviteResult>>;
}

export const ACCEPT_INVITE_PORT = "ACCEPT_INVITE_PORT";
