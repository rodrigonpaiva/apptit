# Apptit

Apptit is an Nx monorepo (branch `auth-bootstrap`) with a NestJS authentication microservice, a starter React Native/Web app, and a shared Prisma package for persistence and Better Auth integration.

## Structure

```s
apps/
  auth/      # NestJS microservice (port 4001, global prefix /api)
  mobile/    # React Native app + web entry point
packages/
  prisma/    # Prisma schema and shared client (@apptit/prisma)
```

## Requirements

- Node.js (recommended version: TODO define)
- npm
- Postgres (Prisma datasource)

## Setup

1) Install dependencies:

```sh
npm install
```

2) Configure environment variables (e.g., `.env` at repo root):
   - `DATABASE_URL` pointing to the Postgres used by Prisma.
   - TODO: additional secrets/keys required by Better Auth.

3) Prepare the database (adjust the schema if needed):

```sh
npx prisma migrate deploy --schema packages/prisma/schema.prisma
npx prisma generate --schema packages/prisma/schema.prisma
```

4) Build the Prisma package (outputs `packages/prisma/dist`, consumed via the `@apptit/prisma` path):

```sh
npx nx build @apptit/prisma
```

## Common Nx commands

- Serve Auth (port 4001, prefix `/api`):

```sh
npx nx serve @apptit/auth
```

- Build Auth:

```sh
npx nx build @apptit/auth
```

- Build the Prisma package:

```sh
npx nx build @apptit/prisma
```

## Quick curl checks (Auth running)

- Public healthcheck:

```sh
curl -i http://localhost:4001/api/health
```

Expected: HTTP 200.

- Better Auth endpoint (should not return 500):

```sh
curl -i http://localhost:4001/api/auth/session
```

## Architecture notes

- Auth microservice in NestJS exposed under `/api`, using `@thallesp/nestjs-better-auth`; Better Auth routes live at `basePath: /api/auth`.
- Shared persistence via `@apptit/prisma` (schema in `packages/prisma/schema.prisma`, build in `packages/prisma/dist`, typings mapped by the path `@apptit/prisma -> packages/prisma/dist/index.d.ts`).
- Better Auth `organization` plugin enables multi-tenant per organization. Additional tenant/secret configuration: TODO document.

## Architecture overview

### Services and packages

- `apps/gateway`: NestJS GraphQL gateway (Apollo) and the main client entry point.
- `apps/auth`: NestJS auth microservice; exposes RPC handlers for session and org management.
- `apps/off-service`: NestJS RPC service for Open Food Facts lookups.
- `apps/mobile`: React Native app with a web entry point.
- `packages/contracts`: RPC patterns + DTOs shared across services.
- `packages/prisma`: Prisma schema + generated client for persistence.

### End-to-end flow (text diagram)

```
[Mobile/Web App]
    |
    | HTTP(S) GraphQL
    v
[Gateway (NestJS + Apollo)]
    |
    | Redis RPC (contracts)
    +--> [Auth Service (NestJS + Better Auth)]
    |         |
    |         | Prisma Client
    |         v
    |      [Postgres]
    |
    +--> [Off Service (NestJS)]
              |
              | HTTP (OpenFoodFacts API)
              v
          [OFF API]
```

Notes:
- Gateway extracts `cookie` and `authorization` headers and validates session via Auth RPC.
- Auth returns session context; Gateway injects it into GraphQL context for resolvers.
- Off-service is currently a standalone RPC service and can be called by the gateway when needed.

### RPC contracts map

Auth (contracts producer: `apps/auth`):
- Patterns: `packages/contracts/src/auth/auth.patterns.ts`
- DTOs: `packages/contracts/src/auth/auth.contracts.ts`
- Consumers: `apps/gateway/src/auth/auth.client.ts`, `apps/gateway/src/auth/auth.context.ts`

Orders (producer not yet in repo):
- Patterns: `packages/contracts/src/orders/orders.patterns.ts`
- DTOs: `packages/contracts/src/orders/orders.contracts.ts`
- Consumers: `apps/gateway/src/orders/orders.client.ts`

Billing (producer not yet in repo):
- Patterns: `packages/contracts/src/billing/billing.patterns.ts`
- DTOs: `packages/contracts/src/billing/billing.contracts.ts`
- Consumers: `apps/gateway/src/billing/billing.client.ts`

Off (contracts producer: `apps/off-service`):
- Patterns: `packages/contracts/src/off/off.patterns.ts`
- DTOs: `packages/contracts/src/off/off.contracts.ts`
- Consumers: RPC clients (example in `apps/off-service/README.md`)

### Coupling notes and suggestions

- `RpcResponse` lives under auth contracts and is reused by orders/billing/off. Consider moving this to a shared `contracts/base` module to reduce cross-domain coupling.
- Contracts are unversioned. Consider a simple versioning scheme (e.g., `contracts/v1/*`) to make breaking changes explicit.
- Orders/Billing contracts exist without a producer service yet; keep these in sync with the future service implementations.

## Nx organization suggestions

### Targets

- Standardize `build`, `serve`, `typecheck`, `lint`, `test` across apps and packages.
- Add `build-deps` in apps that depend on `@apptit/contracts` and `@apptit/prisma` to avoid stale builds.

### Cache

- Use Nx cache (local or remote) to speed up CI.
- Keep `namedInputs.production` in `nx.json` focused on runtime inputs only.

### Boundaries

- Use tags in `project.json` for apps and packages (examples):
  - Apps: `type:app`, `scope:gateway`, `scope:auth`, `scope:off`, `scope:mobile`
  - Libs: `type:lib`, `scope:contracts`, `scope:prisma`, `domain:auth`, `domain:orders`, `domain:billing`, `domain:off`
- Enforce with `@nx/enforce-module-boundaries`:
  - Apps depend on libs, not on other apps.
  - Contracts libs never depend on app code.
  - Prisma should only be consumed by server-side apps.

## CI build and cache flow (Nx)

### Suggested CI steps

```sh
# install deps
npm ci

# run all checks for affected projects
npx nx affected -t lint test typecheck build
```

### Alternative (full run)

```sh
npm ci
npx nx run-many -t lint test typecheck build
```

### Cache notes

- Nx caches outputs for targets that are deterministic (lint/test/typecheck/build).
- If you later add remote cache (Nx Cloud or self-hosted), the CI flow stays the same.
