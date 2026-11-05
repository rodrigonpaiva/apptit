import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { GraphQLError } from 'graphql';
import type { ValidationRule } from 'graphql';
import type { AuthorizedSiteContext } from '@apptit/contracts';
import { AuthFailure, cookieValue, identityCall, SESSION_COOKIE } from '@apptit/runtime';
import type { RuntimeConfig } from '@apptit/runtime';
export const siteSchema = `
  input SiteScopeInput { tenantId: ID!, siteId: ID! }
  type SiteContext { userId: ID!, userName: String!, tenantId: ID!, siteId: ID!, siteName: String!, role: String!, capabilities: [String!]! }
  extend type Query { siteContext(input: SiteScopeInput!): SiteContext! }
`;
export function siteResolver(config: RuntimeConfig) {
  return async (_parent: unknown, args: { input: unknown }, context: { req: Request }) => {
    const secret = cookieValue(context.req.headers.cookie, SESSION_COOKIE);
    const correlation = randomUUID();
    try {
      await identityCall(config, 'authorize', secret, { scope: args.input, capability: 'site.read' }, correlation);
      const response = await fetch(`${config.kitchenOrigin}/internal/v1/site-context`, {
        method: 'POST', redirect: 'error', headers: { 'content-type': 'application/json', 'x-internal-token': config.kitchenToken!,
          ...(secret ? { 'x-session-secret': secret } : {}), 'x-correlation-id': correlation },
        body: JSON.stringify({ scope: args.input }), signal: AbortSignal.timeout(config.internalTimeoutMs),
      });
      if (!response.ok) {
        const failure = await response.json() as { code?: string };
        throw new GraphQLError('Access denied or unavailable.', { extensions: { code: failure.code ?? 'DEPENDENCY_UNAVAILABLE' } });
      }
      const authorized = await response.json() as AuthorizedSiteContext;
      return { userId: authorized.actor.userId, userName: authorized.actor.nameAtAction, ...authorized.scope, siteName: authorized.site.name, role: authorized.site.role, capabilities: authorized.capabilities };
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
      throw new GraphQLError('Access denied or unavailable.', { extensions: { code: error instanceof AuthFailure ? error.code : 'DEPENDENCY_UNAVAILABLE' } });
    }
  };
}
/** Initial bounded schema: no fragments; maximum 50 fields, 10 aliases and depth 8. */
export const boundedQuery: ValidationRule = context => {
  let fields = 0, aliases = 0, depth = 0;
  return {
    Field: { enter(node) { fields++; depth++; if (node.alias) aliases++; if (fields > 50 || aliases > 10 || depth > 8) context.reportError(new GraphQLError('Query limit exceeded.')); }, leave() { depth--; } },
    FragmentSpread() { context.reportError(new GraphQLError('Fragments are unavailable in the initial query contract.')); },
  };
};
