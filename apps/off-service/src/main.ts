import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport, type MicroserviceOptions } from "@nestjs/microservices";
import { AppModule } from "./app.module";

async function bootstrap() {
  const redisHost = process.env.REDIS_HOST || "localhost";
  const redisPortRaw = process.env.REDIS_PORT || "6379";
  const redisPort = Number(redisPortRaw);

  if (!Number.isFinite(redisPort) || redisPort <= 0) {
    throw new Error(`Invalid REDIS_PORT: ${redisPortRaw}`);
  }

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.REDIS,
    options: {
      host: redisHost,
      port: redisPort,
    },
  });

  await app.listen();
  Logger.log(`🚀 OFF service listening via Redis at ${redisHost}:${redisPort}`);
}

bootstrap();
