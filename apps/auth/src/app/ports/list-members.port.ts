import type {
  ListMembersPayload,
  ListMembersResult,
  RpcResponse,
} from "@apptit/contracts";

export interface ListMembersPort {
  execute(
    payload: ListMembersPayload,
  ): Promise<RpcResponse<ListMembersResult>>;
}

export const LIST_MEMBERS_PORT = "LIST_MEMBERS_PORT";
