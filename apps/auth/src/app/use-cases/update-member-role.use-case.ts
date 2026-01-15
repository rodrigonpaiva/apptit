import { Injectable } from "@nestjs/common";
import type {
  RpcResponse,
  UpdateMemberRolePayload,
  UpdateMemberRoleResult,
} from "@apptit/contracts";
import { auth } from "../../better-auth/auth";
import type { UpdateMemberRolePort } from "../ports/update-member-role.port";

@Injectable()
export class UpdateMemberRoleUseCase implements UpdateMemberRolePort {
  async execute(
    payload: UpdateMemberRolePayload,
  ): Promise<RpcResponse<UpdateMemberRoleResult>> {
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
      await auth.api.updateMemberRole({
        headers,
        body: {
          memberId: payload.memberId,
          role: payload.role,
          organizationId: payload.organizationId,
        },
      });

      return { ok: true, data: { memberId: payload.memberId } };
    } catch {
      return {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update member role",
        },
      };
    }
  }
}
