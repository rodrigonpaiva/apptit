import type { SessionContext } from "../ports/session.port";

export class ValidateSessionInputDto {
  cookie?: string;
  authorization?: string;
}

export class ValidateSessionResultDto {
  isValid!: boolean;
  context?: SessionContext;
}
