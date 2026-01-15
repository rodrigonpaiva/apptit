import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { GraphqlContext } from "./auth.context";
import { TENANT_ARG_KEY } from "./tenant.decorator";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const path =
      this.reflector.getAllAndOverride<string>(TENANT_ARG_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? "";

    if (!path) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<GraphqlContext>();
    const args = gqlContext.getArgs<Record<string, unknown>>();
    const tenantId = getByPath(args, path);

    if (tenantId === undefined || tenantId === null) {
      return true;
    }

    if (!ctx?.session?.tenantId || ctx.session.tenantId !== tenantId) {
      throw new ForbiddenException("Tenant mismatch");
    }

    return true;
  }
}

function getByPath(obj: Record<string, unknown>, path: string): string | null | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current as string | null | undefined;
}
