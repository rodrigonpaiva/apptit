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
