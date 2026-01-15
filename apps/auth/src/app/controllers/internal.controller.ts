import { Controller, Get } from "@nestjs/common";

@Controller("internal")
export class InternalController {
  @Get("me")
  me() {
    return { ok: true };
  }

  @Get("diagnostics")
  diagnostics() {
    return { ok: true };
  }
}
