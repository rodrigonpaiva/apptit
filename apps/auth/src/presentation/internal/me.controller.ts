import { Controller, Get } from "@nestjs/common";

@Controller("internal")
export class InternalController {
  @Get("me")
  me() {
    // placeholder: vamos ligar com @Session() do Better Auth depois
    return { ok: true };
  }
}
