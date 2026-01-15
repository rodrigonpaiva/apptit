import { Resolver, Query, Context } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { SessionContextType } from "./auth.types";
import type { GraphqlContext } from "../auth/auth.context";
import { AuthClientService } from "../auth/auth.client";
import { AuthGuard } from "../auth/auth.guard";

@Resolver()
export class AuthResolver {
  constructor(private readonly authClient: AuthClientService) {}

  @UseGuards(AuthGuard)
  @Query(() => SessionContextType, { nullable: true })
  async me(@Context() ctx: GraphqlContext): Promise<SessionContextType | null> {
    if (ctx.session) {
      return ctx.session as SessionContextType;
    }

    const result = await this.authClient.me({
      cookie: headerValue(ctx.headers, "cookie"),
      authorization: headerValue(ctx.headers, "authorization"),
      requestId: ctx.requestId,
    });

    if (!result.ok) {
      return null;
    }

    return result.data.context as SessionContextType;
  }
}

function headerValue(
  headers: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = headers[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
