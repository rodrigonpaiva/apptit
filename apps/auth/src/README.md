# Auth Service Structure

This area follows a layered, DDD-inspired layout. Keep framework-specific code at the edges and domain logic at the center.

- Better Auth + Organization
  - Keep `organization()` enabled in `apps/auth/src/better-auth/auth.ts`.
  - When the auth config changes, regenerate schema and migrate:
    - `npm run better-auth:generate` (from `apps/auth`)
    - `npx prisma migrate dev --schema=packages/prisma/schema.prisma` (from repo root)
- Session validation
  - Keep using `auth.api.getSession({ headers })` for server-side validation.
  - Ensure RPC payloads always include the correct `cookie` and/or `authorization` headers.

- `better-auth/`: adapters or bridges to the Better Auth library.
- `contracts/`: API contracts.
  - `rpc/`: RPC schemas and handlers.
  - `graphql/`: GraphQL schemas and resolvers.
- `domain/`: core business types and rules.
  - `enums/`: domain enumerations.
  - `interfaces/`: interfaces/aggregates/value objects.
- `application/`: use-case orchestration.
  - `dto/`: input/output DTOs.
  - `use-cases/`: application service classes or functions.
- `infrastructure/`: external integrations.
  - `persistence/`: repositories/data sources.
  - `rpc/`: RPC client/server plumbing.
  - `security/`: auth/security providers.
- `presentation/`: delivery layers.
  - `rest/`: REST controllers/routes.
  - `internal/`: internal/admin endpoints.

Add modules with clear boundaries and keep dependencies flowing only inward across layers.
