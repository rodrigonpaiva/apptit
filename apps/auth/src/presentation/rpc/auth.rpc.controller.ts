import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import type {
  MeResult,
  RpcResponse,
  ValidateSessionPayload,
} from "@apptit/contracts";
import { AUTH_ME } from "@apptit/contracts";
import { MeUseCase } from "../../app/use-cases/me.use-case";

@Controller()
export class AuthRpcController {
  constructor(private readonly meUseCase: MeUseCase) {}

  @MessagePattern(AUTH_ME)
  me(payload: ValidateSessionPayload): Promise<RpcResponse<MeResult>> {
    return this.meUseCase.execute(payload);
  }
}
