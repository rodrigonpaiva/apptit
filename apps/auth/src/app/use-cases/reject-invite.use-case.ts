import { Injectable } from "@nestjs/common";
import type {
  RejectInvitePayload,
  RejectInviteResult,
  RpcResponse,
} from "@apptit/contracts";
import { auth } from "../../better-auth/auth";
import type { RejectInvitePort } from "../ports/reject-invite.port";

@Injectable()
export class RejectInviteUseCase implements RejectInvitePort {
  async execute(
    payload: RejectInvitePayload,
  ): Promise<RpcResponse<RejectInviteResult>> {
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
      await auth.api.rejectInvitation({
        headers,
        body: { invitationId: payload.invitationId },
      });

      return { ok: true, data: { status: "rejected" } };
    } catch {
      return {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to reject invite" },
      };
    }
  }
}
