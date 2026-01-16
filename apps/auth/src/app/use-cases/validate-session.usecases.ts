import { Injectable } from "@nestjs/common";
import {
  AUTH_ROLES,
  type AuthRole,
  type ValidateSessionPayload,
  type ValidateSessionResult,
} from "@apptit/contracts";
import { auth } from "../../better-auth/auth";
import type { ValidateSessionPort } from "../ports/session.port";

@Injectable()
export class ValidateSessionUseCase implements ValidateSessionPort {
  async execute(
    input: ValidateSessionPayload,
  ): Promise<ValidateSessionResult> {
    const headers = new Headers();
    if (input.cookie) {
      headers.set("cookie", input.cookie);
    }
    if (input.authorization) {
      headers.set("authorization", input.authorization);
    }

    let sessionResult: unknown;
    try {
      sessionResult = await auth.api.getSession({ headers });
      console.log("Better Auth session data:", JSON.stringify(sessionResult, null, 2));
    } catch {
      return { isValid: false };
    }

    const session = sessionResult as {
      session?: {
        userId?: string;
        activeOrganizationId?: string;
        organizationId?: string;
        tenantId?: string;
        role?: string;
        activeOrganizationRole?: string;
      };
      user?: {
        id?: string;
        role?: string;
      };
    } | null;

    if (!session?.session) {
      return { isValid: false };
    }

    const userId = session.session.userId ?? session.user?.id;
    const tenantId =
      session.session.activeOrganizationId ??
      session.session.organizationId ??
      session.session.tenantId;
    const role = normalizeRole(
      session.session.role ?? session.session.activeOrganizationRole ?? session.user?.role,
    );

    if (!userId || !tenantId) {
      return { isValid: false };
    }

    return {
      isValid: true,
      context: {
        userId,
        tenantId,
        role,
      },
    };
  }
}

function normalizeRole(value: string | undefined): AuthRole {
  if (!value) {
    return "STAFF";
  }
  // Better Auth returns lowercase roles, convert to uppercase
  const upperValue = value.toUpperCase();
  if (AUTH_ROLES.includes(upperValue as AuthRole)) {
    return upperValue as AuthRole;
  }
  return "STAFF";
}
