import 'reflect-metadata';
import { SessionController } from './session.controller.js';
import { boundedQuery, siteResolver, siteSchema } from './site-context.js';
import type { Request, Response } from 'express';
import { quantityValidationSchema, validateQuantityDraftInput } from './quantity-validation.js';
import { Controller, Get, Module, ServiceUnavailableException } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import type { ApolloDriverConfig } from '@nestjs/apollo';
import { readConfig, reportStartupFailure } from '@apptit/runtime';
import type { Readiness, RuntimeStatus } from '@apptit/contracts';

async function bootstrap(): Promise<void> {
  const config = readConfig('gateway-api');
  const status: RuntimeStatus = { service: 'gateway-api', mode: 'synthetic', schemaVersion: 1, operationalFeaturesEnabled: false };
  @Controller('health')
  class HealthController {
    @Get('live') live(): RuntimeStatus { return status; }
    @Get('ready') async ready(): Promise<Readiness> {
      try {
        const dependencies = [
          [config.identityOrigin, config.identityToken],
          [config.kitchenOrigin, config.kitchenToken],
        ];
        await Promise.all(dependencies.map(async ([origin, token]) => {
          const response = await fetch(`${origin}/health/ready`, {
            headers: { 'x-internal-token': token! }, signal: AbortSignal.timeout(config.internalTimeoutMs),
          });
          const body = await response.json() as Partial<Readiness>;
          if (!response.ok || body.ready !== true || body.mode !== 'synthetic') throw new Error('Dependency unavailable');
        }));
      } catch { throw new ServiceUnavailableException({ code: 'DEPENDENCY_UNAVAILABLE' }); }
      return { ...status, ready: true };
    }
  }
  @Module({
    imports: [GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typeDefs: 'type RuntimeStatus { service: String!, mode: String!, schemaVersion: Int!, operationalFeaturesEnabled: Boolean! } type Query { runtimeStatus: RuntimeStatus! }' + quantityValidationSchema + siteSchema,
      resolvers: { Query: { runtimeStatus: () => status, validateQuantityDraft: validateQuantityDraftInput, siteContext: siteResolver(config) } },
      context: ({ req }: { req: Request }) => ({ req }),
      validationRules: [boundedQuery],
      introspection: false,
      playground: false,
      csrfPrevention: true,
      includeStacktraceInErrorResponses: false,
      formatError: error => ({ message: 'GraphQL request rejected', extensions: { code: error.extensions?.['code'] ?? 'INTERNAL_ERROR' } }),
    })],
    controllers: [HealthController, SessionController],
  })
  class GatewayModule {}
  const app = await NestFactory.create<NestExpressApplication>(GatewayModule, { logger: ['error', 'warn'], abortOnError: false });
  app.enableShutdownHooks();
  app.use((_req: Request, res: Response, next: () => void) => { res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff'); next(); });
  app.useBodyParser('json', { limit: '32kb' });
  await app.listen(config.port, config.host);
  console.log(JSON.stringify({ service: config.service, mode: config.mode, port: config.port }));
}
bootstrap().catch(error => { reportStartupFailure('gateway-api', error); process.exitCode = 1; });
