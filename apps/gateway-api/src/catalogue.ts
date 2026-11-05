import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { GraphQLError } from 'graphql';
import type { CataloguePage } from '@apptit/contracts';
import { AuthFailure, cookieValue, identityCall, SESSION_COOKIE } from '@apptit/runtime';
import type { RuntimeConfig } from '@apptit/runtime';
export const catalogueSchema = `
  type CatalogueProduct { id: ID!, name: String!, presentation: String!, barcode: String }
  type CataloguePage { items: [CatalogueProduct!]!, hasMore: Boolean! }
  extend type Query { catalogue(input: SiteScopeInput!): CataloguePage! }
`;
export function catalogueResolver(config: RuntimeConfig) {
  return async (_parent: unknown, args: { input: unknown }, context: { req: Request }): Promise<CataloguePage> => {
    const secret = cookieValue(context.req.headers.cookie, SESSION_COOKIE);
    const correlationId = randomUUID();
    try {
      await identityCall(config, 'authorize', secret, { scope: args.input, capability: 'catalogue.read' }, correlationId);
      const response = await fetch(`${config.kitchenOrigin}/internal/v1/catalogue`, {
        method: 'POST', redirect: 'error', headers: { 'content-type': 'application/json', 'x-internal-token': config.kitchenToken!,
          ...(secret ? { 'x-session-secret': secret } : {}), 'x-correlation-id': correlationId },
        body: JSON.stringify({ scope: args.input }), signal: AbortSignal.timeout(config.internalTimeoutMs),
      });
      if (!response.ok) {
        const failure = await response.json() as { code?: string };
        const allowed = ['INVALID_INPUT', 'UNAUTHENTICATED', 'SESSION_EXPIRED', 'SESSION_REVOKED', 'FORBIDDEN'];
        throw new GraphQLError('Catalogue denied or unavailable.', { extensions: { code: failure.code && allowed.includes(failure.code) ? failure.code : 'DEPENDENCY_UNAVAILABLE' } });
      }
      return await response.json() as CataloguePage;
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
      throw new GraphQLError('Catalogue denied or unavailable.', { extensions: { code: error instanceof AuthFailure ? error.code : 'DEPENDENCY_UNAVAILABLE' } });
    }
  };
}
