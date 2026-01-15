import { Injectable } from "@nestjs/common";
import type {
  AuthMember,
  ListMembersPayload,
  ListMembersResult,
  RpcResponse,
} from "@apptit/contracts";
import { auth } from "../../better-auth/auth";
import type { ListMembersPort } from "../ports/list-members.port";

@Injectable()
export class ListMembersUseCase implements ListMembersPort {
  async execute(
    payload: ListMembersPayload,
  ): Promise<RpcResponse<ListMembersResult>> {
    if (!payload.cookie && !payload.authorization) {
      return {
        ok: false,
        error: { code: "INVALID_SESSION", message: "Missing session headers" },
      };
    }

    const headers = new Headers();
    if (payload.cookie) {
      headers.set("cookie", payload.cookie);
    }
    if (payload.authorization) {
      headers.set("authorization", payload.authorization);
    }

    try {
      const result = (await auth.api.listMembers({
        headers,
        query: {
          organizationId: payload.organizationId,
          organizationSlug: payload.organizationSlug,
        },
      })) as { members?: Array<Record<string, unknown>>; total?: number };

      const members: AuthMember[] = Array.isArray(result?.members)
        ? result.members.map((member) => ({
            id: String(member.id ?? ""),
            userId: String(member.userId ?? ""),
            role: String(member.role ?? ""),
          }))
        : [];

      return {
        ok: true,
        data: {
          members,
          total: typeof result?.total === "number" ? result.total : undefined,
        },
      };
    } catch {
      return {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to list members" },
      };
    }
  }
}
