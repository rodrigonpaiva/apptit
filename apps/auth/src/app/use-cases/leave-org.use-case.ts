import { Injectable } from "@nestjs/common";
import type {
  LeaveOrgPayload,
  LeaveOrgResult,
  RpcResponse,
} from "@apptit/contracts";
import { auth } from "../../better-auth/auth";
import type { LeaveOrgPort } from "../ports/leave-org.port";

@Injectable()
export class LeaveOrgUseCase implements LeaveOrgPort {
  async execute(
    payload: LeaveOrgPayload,
  ): Promise<RpcResponse<LeaveOrgResult>> {
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
      await auth.api.leaveOrganization({
        headers,
        body: { organizationId: payload.organizationId },
      });

      return { ok: true, data: { left: true } };
    } catch {
      return {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to leave organization" },
      };
    }
  }
}
