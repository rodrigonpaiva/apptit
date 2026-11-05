import 'reflect-metadata';
import { Body, Controller, Get, Headers, HttpException, Module, Post, Req, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Request } from 'express';
import { NestFactory } from '@nestjs/core';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';
import { AuthFailure, matchesSecret, newSecret, readConfig, reportStartupFailure, sessionHash, validSecret } from '@apptit/runtime';
import { InputError, object, text, uuid } from '@apptit/domain-values';
import type { Readiness, RuntimeStatus } from '@apptit/contracts';
import { SessionError } from './application/session.repository.js';
import { SessionService } from './application/session.service.js';
import { PrismaSessionRepository } from './infra/prisma-session.repository.js';
import { ArgonPasswordHasher } from './infra/password-hasher.js';
async function bootstrap(): Promise<void> {
  const config = readConfig('identity');
  const status: RuntimeStatus = { service: 'identity', mode: 'synthetic', schemaVersion: 1, operationalFeaturesEnabled: false };
  class Database extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() { super({ adapter: new PrismaPg({ connectionString: config.databaseUrl!, connectionTimeoutMillis: config.internalTimeoutMs }) }); }
    async onModuleInit() { await this.$connect(); }
    async onModuleDestroy() { await this.$disconnect(); }
  }
  const database = new Database();
  const passwords = new ArgonPasswordHasher();
  const sessions = new SessionService(new PrismaSessionRepository(database), passwords,
    { generate: newSecret, valid: validSecret, hash: value => sessionHash(value, config.sessionHashKey) }, await passwords.hash(newSecret()),
    { idleSeconds: config.sessionIdleSeconds, absoluteSeconds: config.sessionAbsoluteSeconds, loginLimit: config.loginLimit, loginWindowSeconds: config.loginWindowSeconds });
  @Controller('health')
  class HealthController {
    @Get('live') live() { return status; }
    @Get('ready') async ready(@Headers('x-internal-token') token: unknown): Promise<Readiness> {
      if (!matchesSecret(token, config.internalToken!)) throw new UnauthorizedException({ code: 'UNAUTHENTICATED' });
      try {
        if (!await database.runtimeFixture.findUnique({ where: { id: 'synthetic-runtime-v1' } })) throw new Error('Seed missing');
        await database.accessSession.count({ take: 1 });
      } catch { throw new ServiceUnavailableException({ code: 'DEPENDENCY_UNAVAILABLE' }); }
      return { ...status, ready: true };
    }
  }
  @Controller('internal/v1')
  class SessionController {
    private async invoke(req: Request, authorize: boolean, action: () => Promise<unknown>) {
      try {
        const caller = req.headers['x-caller-id'];
        const expected = caller === 'gateway' ? config.internalToken : authorize && caller === 'kitchen' ? config.identityKitchenToken : undefined;
        if (!expected || !matchesSecret(req.headers['x-internal-token'], expected)) throw new AuthFailure('UNAUTHENTICATED', 401);
        return await action();
      } catch (error) {
        if (error instanceof AuthFailure) throw new HttpException({ code: error.code }, error.status);
        if (error instanceof SessionError) {
          const status = error.code === 'INVALID_INPUT' ? 400 : error.code === 'FORBIDDEN' ? 403 : error.code === 'RATE_LIMITED' ? 429 : error.code === 'DEPENDENCY_UNAVAILABLE' ? 503 : 401;
          throw new HttpException({ code: error.code }, status);
        }
        if (error instanceof InputError) throw new HttpException({ code: 'INVALID_INPUT', issues: [error.issue] }, 400);
        throw new ServiceUnavailableException({ code: 'DEPENDENCY_UNAVAILABLE' });
      }
    }
    private secret(req: Request) { const value = req.headers['x-session-secret']; return typeof value === 'string' ? value : undefined; }
    @Post('login') login(@Req() req: Request, @Body() input: unknown) {
      return this.invoke(req, false, async () => { const value = object(input, ['credentials', 'source'], 'login'); return sessions.login(value['credentials'], this.secret(req), text(value['source'], 'source', 128)); });
    }
    @Post('current') current(@Req() req: Request, @Body() input: unknown) { return this.invoke(req, false, async () => { object(input, [], 'current'); return sessions.current(this.secret(req)); }); }
    @Post('logout') logout(@Req() req: Request, @Body() input: unknown) { return this.invoke(req, false, async () => { object(input, [], 'logout'); return sessions.logout(this.secret(req)); }); }
    @Post('select') select(@Req() req: Request, @Body() input: unknown) { return this.invoke(req, false, () => sessions.select(input, this.secret(req))); }
    @Post('authorize') authorize(@Req() req: Request, @Body() input: unknown) {
      return this.invoke(req, true, () => sessions.authorize(input, this.secret(req), uuid(req.headers['x-correlation-id'], 'correlationId')));
    }
  }
  @Module({ controllers: [HealthController, SessionController], providers: [{ provide: Database, useValue: database }] })
  class IdentityModule {}
  const app = await NestFactory.create<NestExpressApplication>(IdentityModule, { logger: false, abortOnError: false });
  app.enableShutdownHooks();
  app.useBodyParser('json', { limit: '32kb' });
  await app.listen(config.port, config.host);
  console.log(JSON.stringify({ service: config.service, mode: config.mode, port: config.port }));
}
bootstrap().catch(error => { reportStartupFailure('identity', error); process.exit(1); });
