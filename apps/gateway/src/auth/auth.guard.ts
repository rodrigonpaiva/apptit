import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { GraphqlContext } from "./auth.context";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic =
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    if (isPublic) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<GraphqlContext>();
    if (!ctx?.session) {
      throw new UnauthorizedException("Unauthorized");
    }
    return true;
  }
}
