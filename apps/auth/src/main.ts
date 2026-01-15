/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false});
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPortRaw = process.env.REDIS_PORT || '6379';
  const redisPort = Number(redisPortRaw);
  if (!Number.isFinite(redisPort) || redisPort <= 0) {
    throw new Error(`Invalid REDIS_PORT: ${redisPortRaw}`);
  }
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: redisHost,
      port: redisPort,
    },
  });

  const port = process.env.PORT || 4001;
  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
