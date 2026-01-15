import type {
  ListOrgsPayload,
  ListOrgsResult,
  RpcResponse,
} from "@apptit/contracts";

export interface ListOrgsPort {
  execute(payload: ListOrgsPayload): Promise<RpcResponse<ListOrgsResult>>;
}

export const LIST_ORGS_PORT = "LIST_ORGS_PORT";
