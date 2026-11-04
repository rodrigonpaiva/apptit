import 'reflect-metadata';
import { Controller, Get, Injectable, Module, ServiceUnavailableException, UnauthorizedException, Headers } from '@nestjs/common';
import type { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';
import { matchesSecret, readConfig, reportStartupFailure } from '@apptit/runtime';
import type { Readiness, RuntimeStatus } from '@apptit/contracts';

async function bootstrap(): Promise<void> {
  const config = readConfig('identity');
  const status: RuntimeStatus = { service: 'identity', mode: 'synthetic', schemaVersion: 1, operationalFeaturesEnabled: false };
  @Injectable()
  class Database extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() { super({ adapter: new PrismaPg({ connectionString: config.databaseUrl!, connectionTimeoutMillis: config.internalTimeoutMs }) }); }
    async onModuleInit(): Promise<void> { await this.$connect(); }
    async onModuleDestroy(): Promise<void> { await this.$disconnect(); }
  }
  @Controller('health')
  class HealthController {
    constructor(private readonly database: Database) {}
    @Get('live') live(): RuntimeStatus { return status; }
    @Get('ready') async ready(@Headers('x-internal-token') token: unknown): Promise<Readiness> {
      if (!matchesSecret(token, config.internalToken!)) throw new UnauthorizedException({ code: 'UNAUTHENTICATED' });
      try {
        const fixture = await this.database.runtimeFixture.findUnique({ where: { id: 'synthetic-runtime-v1' } });
        if (!fixture) throw new Error('Seed missing');
      } catch { throw new ServiceUnavailableException({ code: 'DEPENDENCY_UNAVAILABLE' }); }
      return { ...status, ready: true };
    }
  }
  @Module({ controllers: [HealthController], providers: [Database] })
  class ServiceModule {}
  const app = await NestFactory.create<NestExpressApplication>(ServiceModule, { logger: false, abortOnError: false });
  app.enableShutdownHooks();
  app.useBodyParser('json', { limit: '32kb' });
  await app.listen(config.port, config.host);
  console.log(JSON.stringify({ service: config.service, mode: config.mode, port: config.port }));
}
bootstrap().catch(error => { reportStartupFailure('identity', error); process.exit(1); });
