import { Injectable } from "@nestjs/common";
import type {
  ListOrgsPayload,
  ListOrgsResult,
  OrganizationSummary,
  RpcResponse,
} from "@apptit/contracts";
import { auth } from "../../better-auth/auth";
import type { ListOrgsPort } from "../ports/list-orgs.port";

@Injectable()
export class ListOrgsUseCase implements ListOrgsPort {
  async execute(
    payload: ListOrgsPayload,
  ): Promise<RpcResponse<ListOrgsResult>> {
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
      const organizations = (await auth.api.listOrganizations({
        headers,
      })) as Array<Record<string, unknown>>;

      const mapped: OrganizationSummary[] = Array.isArray(organizations)
        ? organizations.map((org) => ({
            id: String(org.id ?? ""),
            name: String(org.name ?? ""),
            slug: String(org.slug ?? ""),
            logo:
              org.logo === null || org.logo === undefined
                ? null
                : String(org.logo),
          }))
        : [];

      return { ok: true, data: { organizations: mapped } };
    } catch {
      return {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to list organizations" },
      };
    }
  }
}
