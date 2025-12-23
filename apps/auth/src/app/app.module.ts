import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { InternalController } from "../presentation/internal/me.controller";
import { HealthController } from "./controllers/health.controller";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "../better-auth/auth";
import { AuthRpcController } from "../presentation/rpc/auth.rpc.controller";
import { MeUseCase } from "./use-cases/me.use-case";
import { ValidateSessionUseCase } from "./use-cases/validate-session.usecases";
import { VALIDATE_SESSION_PORT } from "./ports/session.port";

@Module({
  imports: [AuthModule.forRoot({ auth })],
  controllers: [HealthController, InternalController, AuthRpcController],
  providers: [
    AppService,
    MeUseCase,
    {
      provide: VALIDATE_SESSION_PORT,
      useClass: ValidateSessionUseCase,
    },
  ],
})
export class AppModule {}
