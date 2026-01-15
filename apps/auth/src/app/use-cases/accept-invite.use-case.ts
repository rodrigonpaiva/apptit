import { Injectable } from "@nestjs/common";
import type {
  AcceptInvitePayload,
  AcceptInviteResult,
  RpcResponse,
} from "@apptit/contracts";
import { auth } from "../../better-auth/auth";
import type { AcceptInvitePort } from "../ports/accept-invite.port";

@Injectable()
export class AcceptInviteUseCase implements AcceptInvitePort {
  async execute(
    payload: AcceptInvitePayload,
  ): Promise<RpcResponse<AcceptInviteResult>> {
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
      await auth.api.acceptInvitation({
        headers,
        body: { invitationId: payload.invitationId },
      });

      return { ok: true, data: { status: "accepted" } };
    } catch {
      return {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to accept invite" },
      };
    }
  }
}
