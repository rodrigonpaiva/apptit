# Auth Data Boundaries

## Responsibilities
- Validate session material (cookie/authorization) and derive a trusted SessionContext.
- Enforce tenant isolation in every RPC handler and use-case.
- Return only whitelisted, minimal data for auth-facing contracts.

## Non-responsibilities
- Persisting or exposing raw provider tokens, credentials, or secrets.
- Accepting tenant identifiers from untrusted clients.
- Returning internal session objects or Prisma entities.

## Trust Model
- Untrusted: RPC payloads, headers, cookies, and any client-provided values.
- Trusted: SessionContext produced by validated session checks.
- Boundary: only the validated SessionContext may be used for tenant/user decisions.

## Tenant Isolation Invariants (MUST)
- TenantId is derived only from validated session context.
- TenantId must never be accepted from request body, query, or RPC payload.
- Any tenant claim from a client is rejected with TENANT_MISMATCH.
- Tenant isolation checks run before returning data or performing actions.

## AUTH_ME Contract Boundaries
Allowed:
- SessionContext fields: userId, tenantId, role.

Forbidden:
- Tokens, cookies, provider ids, password hashes, secrets.
- Raw session objects, internal flags, or Prisma entities.
- Any non-whitelisted fields.

## Logging and Redaction Policy
- Never log raw headers, cookies, or request payloads.
- Log only stable identifiers (userId, tenantId) and error codes.
- Redact fields containing: token, refresh token, session token, cookie, set-cookie, authorization, password, secret, session id.
- Apply redaction to nested objects and arrays before logging.

## Threat Model (Non-exhaustive)
- Session hijacking: tokens or cookies are leaked or replayed.
- Tenant mix-up: tenant identifiers from clients override validated context.
- Overexposure: AUTH_ME or logs return sensitive fields.
