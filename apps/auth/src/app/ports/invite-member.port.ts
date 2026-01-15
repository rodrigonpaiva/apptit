import type {
  InviteMemberPayload,
  InviteMemberResult,
  RpcResponse,
} from "@apptit/contracts";

export interface InviteMemberPort {
  execute(
    payload: InviteMemberPayload,
  ): Promise<RpcResponse<InviteMemberResult>>;
}

export const INVITE_MEMBER_PORT = "INVITE_MEMBER_PORT";
