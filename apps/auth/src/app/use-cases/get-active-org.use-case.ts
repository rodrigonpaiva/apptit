import { Injectable } from "@nestjs/common";
import type {
  GetActiveOrgPayload,
  GetActiveOrgResult,
  OrganizationSummary,
  RpcResponse,
} from "@apptit/contracts";
import { auth } from "../../better-auth/auth";
import type { GetActiveOrgPort } from "../ports/get-active-org.port";

@Injectable()
export class GetActiveOrgUseCase implements GetActiveOrgPort {
  async execute(
    payload: GetActiveOrgPayload,
  ): Promise<RpcResponse<GetActiveOrgResult>> {
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
      const organization = (await auth.api.getFullOrganization({
        headers,
      })) as Record<string, unknown> | null;

      if (!organization) {
        return { ok: true, data: { organization: null } };
      }

      const mapped: OrganizationSummary = {
        id: String(organization.id ?? ""),
        name: String(organization.name ?? ""),
        slug: String(organization.slug ?? ""),
        logo:
          organization.logo === null || organization.logo === undefined
            ? null
            : String(organization.logo),
      };

      return { ok: true, data: { organization: mapped } };
    } catch {
      return {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch active organization",
        },
      };
    }
  }
}
