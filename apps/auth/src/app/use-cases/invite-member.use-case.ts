import { Injectable } from "@nestjs/common";
import type {
  InviteMemberPayload,
  InviteMemberResult,
  RpcResponse,
} from "@apptit/contracts";
import { auth } from "../../better-auth/auth";
import type { InviteMemberPort } from "../ports/invite-member.port";

@Injectable()
export class InviteMemberUseCase implements InviteMemberPort {
  async execute(
    payload: InviteMemberPayload,
  ): Promise<RpcResponse<InviteMemberResult>> {
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
      const invitation = (await auth.api.createInvitation({
        headers,
        body: {
          email: payload.email,
          role: payload.role,
          organizationId: payload.organizationId,
        },
      })) as { id?: string };

      return {
        ok: true,
        data: { invitationId: String(invitation?.id ?? "") },
      };
    } catch {
      return {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to invite member" },
      };
    }
  }
}
