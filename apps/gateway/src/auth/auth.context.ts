import { Injectable } from "@nestjs/common";
import type { SessionContext, ValidateSessionPayload } from "@apptit/contracts";
import { AuthClientService } from "./auth.client";

export interface GraphqlContext {
  headers: Record<string, string | string[] | undefined>;
  session: SessionContext | null;
}

@Injectable()
export class AuthContextService {
  constructor(private readonly authClient: AuthClientService) {}

  async create(
    headers: Record<string, string | string[] | undefined>,
  ): Promise<GraphqlContext> {
    const cookie = headerValue(headers, "cookie");
    const authorization = headerValue(headers, "authorization");
    if (!cookie && !authorization) {
      return { headers, session: null };
    }

    const payload: ValidateSessionPayload = {
      cookie,
      authorization,
    };

    const result = await this.authClient.validateSession(payload);
    const session = result.ok && result.data.context ? result.data.context : null;

    return { headers, session };
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
