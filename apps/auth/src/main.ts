/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false});
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  // TODO: configurar transport de microservice para RPC (ex.: Redis/NATS) antes de usar AUTH_ME.

  const port = process.env.PORT || 4001;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
