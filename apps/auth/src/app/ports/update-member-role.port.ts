import type {
  RpcResponse,
  UpdateMemberRolePayload,
  UpdateMemberRoleResult,
} from "@apptit/contracts";

export interface UpdateMemberRolePort {
  execute(
    payload: UpdateMemberRolePayload,
  ): Promise<RpcResponse<UpdateMemberRoleResult>>;
}

export const UPDATE_MEMBER_ROLE_PORT = "UPDATE_MEMBER_ROLE_PORT";
