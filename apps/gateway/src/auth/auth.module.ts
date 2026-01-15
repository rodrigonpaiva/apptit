import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AUTH_SERVICE } from "./auth.constants";
import { AuthClientService } from "./auth.client";
import { AuthContextService } from "./auth.context";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: () => {
          const portRaw = process.env.REDIS_PORT || "6379";
          const port = Number(portRaw);
          if (!Number.isFinite(port) || port <= 0) {
            throw new Error(`Invalid REDIS_PORT: ${portRaw}`);
          }
          return {
            transport: Transport.REDIS,
            options: {
              host: process.env.REDIS_HOST || "localhost",
              port,
            },
          };
        },
      },
    ]),
  ],
  providers: [AuthClientService, AuthContextService],
  exports: [AuthClientService, AuthContextService],
})
export class AuthModule {}
