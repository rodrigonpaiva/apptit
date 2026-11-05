import 'reflect-metadata';
import type { Request } from 'express';
import type { AuthorizedSiteContext } from '@apptit/contracts';
import { AuthFailure, identityCall } from '@apptit/runtime';
import { InputError, object, uuid } from '@apptit/domain-values';
import { Controller, Get, Injectable, Module, ServiceUnavailableException, UnauthorizedException, Headers, Body, HttpException, Post, Req } from '@nestjs/common';
import type { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';
import { matchesSecret, readConfig, reportStartupFailure } from '@apptit/runtime';
import type { Readiness, RuntimeStatus } from '@apptit/contracts';

async function bootstrap(): Promise<void> {
  const config = readConfig('kitchen');
  const status: RuntimeStatus = { service: 'kitchen', mode: 'synthetic', schemaVersion: 1, operationalFeaturesEnabled: false };
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
  @Controller('internal/v1')
  class ScopedController {
    @Post('site-context') async context(@Req() req: Request, @Body() input: unknown): Promise<AuthorizedSiteContext> {
      try {
        if (!matchesSecret(req.headers['x-internal-token'], config.internalToken!)) throw new AuthFailure('UNAUTHENTICATED', 401);
        const value = object(input, ['scope'], 'query');
        const secret = req.headers['x-session-secret'];
        return await identityCall<AuthorizedSiteContext>(config, 'authorize', typeof secret === 'string' ? secret : undefined,
          { scope: value['scope'], capability: 'site.read' }, uuid(req.headers['x-correlation-id'], 'correlationId'));
      } catch (error) {
        if (error instanceof AuthFailure) throw new HttpException({ code: error.code }, error.status);
        if (error instanceof InputError) throw new HttpException({ code: 'INVALID_INPUT', issues: [error.issue] }, 400);
        throw new ServiceUnavailableException({ code: 'DEPENDENCY_UNAVAILABLE' });
      }
    }
  }
  @Module({ controllers: [HealthController, ScopedController], providers: [Database] })
  class ServiceModule {}
  const app = await NestFactory.create<NestExpressApplication>(ServiceModule, { logger: false, abortOnError: false });
  app.enableShutdownHooks();
  app.useBodyParser('json', { limit: '32kb' });
  await app.listen(config.port, config.host);
  console.log(JSON.stringify({ service: config.service, mode: config.mode, port: config.port }));
}
bootstrap().catch(error => { reportStartupFailure('kitchen', error); process.exit(1); });
