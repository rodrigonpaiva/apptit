import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { GraphQLError } from 'graphql';
import type { ScopedProductLookup } from '@apptit/contracts';
import { AuthFailure, cookieValue, identityCall, SESSION_COOKIE } from '@apptit/runtime';
import type { RuntimeConfig } from '@apptit/runtime';
export const productLookupSchema = `
  input ProductLookupInput { scope: SiteScopeInput!, barcode: String! }
  type LookupField { state: String!, value: String, reason: String }
  type LookupProduct { imageUrl: String, name: LookupField!, brands: LookupField!, presentation: LookupField!, allergens: LookupField!, nutrition: LookupField! }
  type LookupSource { provider: String!, apiVersion: String!, url: String!, retrievedAt: String!, sourceUpdatedAt: String, cached: Boolean!, synthetic: Boolean!, reviewState: String! }
  type ProductLookup { state: String!, barcode: String!, product: LookupProduct, source: LookupSource, missing: [String!]!, reason: String, retryAfterSeconds: Int, localCandidates: [CatalogueProduct!]! }
  extend type Query { productLookup(input: ProductLookupInput!): ProductLookup! }
`;
export function productLookupResolver(config: RuntimeConfig) {
  return async (_parent: unknown, args: { input: { scope: unknown; barcode: unknown } }, context: { req: Request }): Promise<ScopedProductLookup> => {
    const secret = cookieValue(context.req.headers.cookie, SESSION_COOKIE);
    const correlationId = randomUUID();
    try {
      await identityCall(config, 'authorize', secret, { scope: args.input.scope, capability: 'catalogue.read' }, correlationId);
      const response = await fetch(`${config.kitchenOrigin}/internal/v1/product-lookup`, {
        method: 'POST', redirect: 'error', headers: { 'content-type': 'application/json', 'x-internal-token': config.kitchenToken!,
          ...(secret ? { 'x-session-secret': secret } : {}), 'x-correlation-id': correlationId },
        body: JSON.stringify(args.input), signal: AbortSignal.timeout(3 * config.internalTimeoutMs + config.offTimeoutMs + 1000),
      });
      if (!response.ok) {
        const failure = await response.json() as { code?: string };
        const allowed = ['INVALID_INPUT', 'UNAUTHENTICATED', 'SESSION_EXPIRED', 'SESSION_REVOKED', 'FORBIDDEN'];
        throw new GraphQLError('Lookup denied or unavailable.', { extensions: { code: failure.code && allowed.includes(failure.code) ? failure.code : 'DEPENDENCY_UNAVAILABLE' } });
      }
      return await response.json() as ScopedProductLookup;
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
      throw new GraphQLError('Lookup denied or unavailable.', { extensions: { code: error instanceof AuthFailure ? error.code : 'DEPENDENCY_UNAVAILABLE' } });
    }
  };
}
