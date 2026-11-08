import 'reflect-metadata';
import { ReceivingObservations } from './application/receiving-observations.js';
import { EvidenceWorkspace } from './application/evidence-workspace.js';
import { boundedBytes, EvidenceStorageFailure } from './infra/private-evidence-store.js';
import { ReceiptWorkspace, ReceiptFailure } from './application/receipt-workspace.js';
import { OffLookup } from './infra/lookup/off.js';
import type { Request, Response } from 'express';
import { CatalogueRepository } from './infra/prisma/catalogue.repository.js';
import type { ScopedProductLookup } from '@apptit/contracts';
import type { CataloguePage } from '@apptit/contracts';
import type { AuthorizedSiteContext } from '@apptit/contracts';
import { AuthFailure, identityCall } from '@apptit/runtime';
import { InputError, object, uuid, productBarcode } from '@apptit/domain-values';
import { Controller, Get, Injectable, Module, ServiceUnavailableException, UnauthorizedException, Headers, Body, HttpException, Post, Req, Res } from '@nestjs/common';
import type { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';
import { matchesSecret, readConfig, reportStartupFailure } from '@apptit/runtime';
import type { Readiness, RuntimeStatus } from '@apptit/contracts';

async function bootstrap(): Promise<void> {
  const config = readConfig('kitchen');
  const lookup = new OffLookup(config);
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
    constructor(private readonly database: Database) {}
    private async observation(req: Request, input: unknown, action: 'save' | 'list' | 'history') {
      try {
        if (!matchesSecret(req.headers['x-internal-token'], config.internalToken!)) throw new AuthFailure('UNAUTHENTICATED', 401);
        const secret = req.headers['x-session-secret']; const context = await identityCall<AuthorizedSiteContext>(config, 'authorize', typeof secret === 'string' ? secret : undefined,
          { scope: (input as { scope?: unknown })?.scope, capability: action === 'save' ? 'observation.capture' : 'observation.read' }, uuid(req.headers['x-correlation-id'], 'correlationId'));
        return await new ReceivingObservations(this.database, config)[action](input, context);
      } catch (error) {
        if (error instanceof AuthFailure || error instanceof ReceiptFailure) throw new HttpException({ code: error.code }, error.status);
        if (error instanceof InputError) throw new HttpException({ code: 'INVALID_INPUT', issues: [error.issue] }, 400);
        throw new ServiceUnavailableException({ code: 'OUTCOME_UNCERTAIN' });
      }
    }
    @Post('observations/save') saveObservation(@Req() req: Request, @Body() input: unknown) { return this.observation(req, input, 'save'); }
    @Post('observations/list') listObservations(@Req() req: Request, @Body() input: unknown) { return this.observation(req, input, 'list'); }
    @Post('observations/history') observationHistory(@Req() req: Request, @Body() input: unknown) { return this.observation(req, input, 'history'); }
    private async evidence(req: Request, input: unknown, action: 'begin' | 'list' | 'review' | 'read' | 'upload', response?: Response) {
      try {
        if (!matchesSecret(req.headers['x-internal-token'], config.internalToken!)) throw new AuthFailure('UNAUTHENTICATED', 401);
        const binary = action === 'upload';
        const requested = binary ? { tenantId: req.headers['x-tenant-id'], siteId: req.headers['x-site-id'] } : (input as { scope?: unknown })?.scope;
        const secret = req.headers['x-session-secret'];
        const context = await identityCall<AuthorizedSiteContext>(config, 'authorize', typeof secret === 'string' ? secret : undefined,
          { scope: requested, capability: ['begin', 'upload', 'review'].includes(action) ? 'evidence.write' : 'evidence.read' }, uuid(req.headers['x-correlation-id'], 'correlationId'));
        const app = new EvidenceWorkspace(this.database, config);
        if (binary) {
          if (config.evidenceMode !== 'fixture') throw new ReceiptFailure('CAPABILITY_DISABLED', 503);
          if (!['image/jpeg', 'image/png'].includes(req.headers['content-type'] ?? '')) throw new ReceiptFailure('INVALID_INPUT', 400);
          const length = Number(req.headers['content-length']);
          if (!Number.isSafeInteger(length) || length < 1 || length > config.evidenceMaxBytes) throw new ReceiptFailure('INVALID_INPUT', 413);
          return await app.upload({ scope: requested, id: req.headers['x-evidence-id'] }, context, await boundedBytes(req, config.evidenceMaxBytes));
        }
        if (action === 'read' && response) {
          const result = await app.read(input, context);
          response.set({ 'Content-Type': result.mediaType, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" }); response.send(result.bytes); return;
        }
        if (action === 'begin') return await app.begin(input, context);
        if (action === 'review') return await app.review(input, context);
        return await app.list(input, context);
      } catch (error) {
        if (error instanceof AuthFailure || error instanceof ReceiptFailure) throw new HttpException({ code: error.code }, error.status);
        if (error instanceof InputError || error instanceof EvidenceStorageFailure) throw new HttpException({ code: 'INVALID_INPUT' }, 400);
        throw new ServiceUnavailableException({ code: 'OUTCOME_UNCERTAIN' });
      }
    }
    @Post('evidence/begin') beginEvidence(@Req() req: Request, @Body() input: unknown) { return this.evidence(req, input, 'begin'); }
    @Post('evidence/list') listEvidence(@Req() req: Request, @Body() input: unknown) { return this.evidence(req, input, 'list'); }
    @Post('evidence/review') reviewEvidence(@Req() req: Request, @Body() input: unknown) { return this.evidence(req, input, 'review'); }
    @Post('evidence/upload') uploadEvidence(@Req() req: Request) { return this.evidence(req, undefined, 'upload'); }
    @Post('evidence/read') readEvidence(@Req() req: Request, @Body() input: unknown, @Res() response: Response) { return this.evidence(req, input, 'read', response); }
    private async receipt(req: Request, input: unknown, action: 'save' | 'read' | 'list' | 'locations') {
      try {
        if (!matchesSecret(req.headers['x-internal-token'], config.internalToken!)) throw new AuthFailure('UNAUTHENTICATED', 401);
        const value = input as { scope?: unknown; command?: { scope?: unknown } };
        const secret = req.headers['x-session-secret'];
        const context = await identityCall<AuthorizedSiteContext>(config, 'authorize', typeof secret === 'string' ? secret : undefined,
          { scope: action === 'save' ? value?.command?.scope : value?.scope, capability: action === 'save' ? 'receipt.draft.write' : 'receipt.draft.read' }, uuid(req.headers['x-correlation-id'], 'correlationId'));
        return await new ReceiptWorkspace(this.database)[action](input, context);
      } catch (error) {
        if (error instanceof AuthFailure) throw new HttpException({ code: error.code }, error.status);
        if (error instanceof ReceiptFailure) throw new HttpException({ code: error.code }, error.status);
        if (error instanceof InputError) throw new HttpException({ code: 'INVALID_INPUT', issues: [error.issue] }, 400);
        throw new ServiceUnavailableException({ code: 'OUTCOME_UNCERTAIN' });
      }
    }
    @Post('receipt-drafts/save') saveReceipt(@Req() req: Request, @Body() input: unknown) { return this.receipt(req, input, 'save'); }
    @Post('receipt-drafts/read') readReceipt(@Req() req: Request, @Body() input: unknown) { return this.receipt(req, input, 'read'); }
    @Post('receipt-drafts/list') listReceipts(@Req() req: Request, @Body() input: unknown) { return this.receipt(req, input, 'list'); }
    @Post('receipt-drafts/locations') receiptLocations(@Req() req: Request, @Body() input: unknown) { return this.receipt(req, input, 'locations'); }
    @Post('product-lookup') async productLookup(@Req() req: Request, @Body() input: unknown): Promise<ScopedProductLookup> {
      try {
        if (!matchesSecret(req.headers['x-internal-token'], config.internalToken!)) throw new AuthFailure('UNAUTHENTICATED', 401);
        const value = object(input, ['scope', 'barcode'], 'query');
        const secret = req.headers['x-session-secret'];
        const context = await identityCall<AuthorizedSiteContext>(config, 'authorize', typeof secret === 'string' ? secret : undefined,
          { scope: value['scope'], capability: 'catalogue.read' }, uuid(req.headers['x-correlation-id'], 'correlationId'));
        const barcode = productBarcode(value['barcode']);
        const localCandidates = await this.database.catalogueProduct.findMany({ where: { ...context.scope, barcode }, select: { id: true, name: true, presentation: true, barcode: true }, take: 10, orderBy: { id: 'asc' } });
        return { ...await lookup.lookup(barcode), localCandidates };
      } catch (error) {
        if (error instanceof AuthFailure) throw new HttpException({ code: error.code }, error.status);
        if (error instanceof InputError) throw new HttpException({ code: 'INVALID_INPUT', issues: [error.issue] }, 400);
        throw new ServiceUnavailableException({ code: 'DEPENDENCY_UNAVAILABLE' });
      }
    }
    @Post('catalogue') async catalogue(@Req() req: Request, @Body() input: unknown): Promise<CataloguePage> {
      try {
        if (!matchesSecret(req.headers['x-internal-token'], config.internalToken!)) throw new AuthFailure('UNAUTHENTICATED', 401);
        const value = object(input, ['scope'], 'query');
        const secret = req.headers['x-session-secret'];
        const context = await identityCall<AuthorizedSiteContext>(config, 'authorize', typeof secret === 'string' ? secret : undefined,
          { scope: value['scope'], capability: 'catalogue.read' }, uuid(req.headers['x-correlation-id'], 'correlationId'));
        return await new CatalogueRepository(this.database).list(context);
      } catch (error) {
        if (error instanceof AuthFailure) throw new HttpException({ code: error.code }, error.status);
        if (error instanceof InputError) throw new HttpException({ code: 'INVALID_INPUT', issues: [error.issue] }, 400);
        throw new ServiceUnavailableException({ code: 'DEPENDENCY_UNAVAILABLE' });
      }
    }
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
