import { Injectable } from "@nestjs/common";
import type {
  RpcResponse,
  SetActiveOrgPayload,
  SetActiveOrgResult,
} from "@apptit/contracts";
import { auth } from "../../better-auth/auth";
import type { SetActiveOrgPort } from "../ports/organization.port";

@Injectable()
export class SetActiveOrgUseCase implements SetActiveOrgPort {
  async execute(
    payload: SetActiveOrgPayload,
  ): Promise<RpcResponse<SetActiveOrgResult>> {
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
      const organization = await auth.api.setActiveOrganization({
        headers,
        body: {
          organizationId:
            payload.organizationId === undefined
              ? undefined
              : payload.organizationId,
          organizationSlug: payload.organizationSlug,
        },
      });

      return {
        ok: true,
        data: {
          activeOrganizationId: organization ? organization.id : null,
        },
      };
    } catch {
      return {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to set active organization",
        },
      };
    }
  }
}
