# Local synthetic development

SP1-02 provides an executable shell, infrastructure and CI. SP1-03 adds shared value validation and internal versioned reference-draft persistence. SP1-04 adds individual login and server-verified restaurant access. SP1-05 adds a private scoped product-reference list with manual search. SP2-02 adds scoped product identification with optional on-device scanning, OFF examples/explicit read-only live lookup and manual fallback. Receipt/evidence, catalogue writes, stock commands and offline capture remain unavailable. Individual synthetic credentials are generated privately; there is no shared kitchen account.

## Prerequisites and fresh checkout

Use Node **22.22.2**, npm **10.9.7**, Docker Engine with Compose v2 (Docker Desktop on macOS). Ports 3000, 4000–4002 and 55432 must be free. Use `nvm use` or the `.node-version` equivalent. Docker must be running before `npm run dev`.

From the repository root:

```sh
npm ci
npm run local:env
npm run dev
```

`local:env` creates a mode-0600 ignored `.env` from the example, generating distinct random local passwords, internal tokens, cookie and CSRF secrets. It preserves existing values, appends newly required settings and never prints generated values. Run it again after pulling new configuration requirements. It also writes the private ignored `.local/fixture-credentials.json` account list (mode 0600). The example contains placeholders, so copying it alone does not produce runnable configuration. Do not replace synthetic mode with live restaurant data.

`dev` builds the backend/isolated Prisma clients, validates service configuration, starts PostgreSQL, deploys both versioned schema migrations, upserts synthetic setup markers and starts web/gateway/Identity/Kitchen through the local process supervisor after Nx builds. A single TypeScript build watcher handles backend source/shared-package edits; Node restarts from emitted output and Next handles web edits. Broken TypeScript is visible and does not emit new invalid output. Restart `dev` after configuration changes; regenerate clients after Prisma schema changes.

Open **http://127.0.0.1:3000**. The page has an explicit synthetic-data label and no stock/production actions. Open `/login` and use an individual synthetic account from `.local/fixture-credentials.json`. French copy is provisional, following the specification's initial-market proposal; language policy remains unconfirmed. Use `127.0.0.1` consistently (not an alternate localhost origin). Ctrl+C stops the supervised application/watch process groups; the named database volume remains. `npm run infra:down` stops the project infrastructure without deleting data.

## Runtime boundaries

| Runtime | Address | Behavior |
| --- | --- | --- |
| Web | http://127.0.0.1:3000 | Responsive development shell; `/api/graphql` proxies same-origin to gateway |
| Gateway | http://127.0.0.1:4000 | `/graphql` runtimeStatus query, `/health/live`, dependency-aware `/health/ready` |
| Identity | http://127.0.0.1:4001 | Credential-protected session/authorization API and DB/seed readiness |
| Kitchen | http://127.0.0.1:4002 | Independently authorized site-context/catalogue reads and DB/seed readiness |
| PostgreSQL | 127.0.0.1:55432 | Separate `apptit_identity_synthetic` and `apptit_kitchen_synthetic` databases and login roles |

Public GraphQL queries expose synthetic runtime metadata and read-only validation of submitted quantity-draft values; the protected `siteContext` query additionally returns verified actor/site access. The protected `catalogue` query returns only authorized site product references. Stored drafts/stock and credentials are not exposed. Session/profile HTTP endpoints disclose only the authenticated user’s own permitted context. Introspection/playground are disabled; no GraphQL mutation exists. Internal health requires a per-service token and checks its actual database/seed. Gateway readiness becomes 503 if a dependency fails. Liveness alone does not claim readiness.

App child processes do not receive the PostgreSQL admin password or another service's database URL/password. This is local process hygiene, not an OS security sandbox. The trusted developer/Compose admin can access both databases. Each service generates its own Prisma client under its own ignored `src/generated/prisma`, with migrations/seed/client imports owned locally. No shared Prisma package or direct service imports.

## Verification

For the complete sequence with a private timestamped outcome report, stop your app runtimes and run `npm run verify:foundation` after `npm ci` and `npm run local:env`. It refuses occupied app ports, stops on the first failure and records unrun steps explicitly in `.local/verification/foundation-*.json`. It preserves the database volume and leaves infrastructure running. See the [repeatable Sprint 1 demo](foundation-demo.md) for the user A/site B denial and revocation demonstration, isolated fresh-database procedure and limitations.

```sh
npm run check
npm run infra:up
npm run db:migrate
npm run db:seed
npm run db:seed
npm run test:integration
npm run smoke
```

`check` validates Prisma schemas, ESLint/module boundaries and tooling, all seven project type checks, SP1-01 design contract types, configuration/security tests and production builds. It does not need a running DB; it does require the generated `.env`. Next route types are generated before standalone typechecking, so a clean `.next` is supported. Backend compilation remains `tsc` for Nest decorator metadata; ESM is used across the runtime packages.

`test:integration` requires a built backend and migrated PostgreSQL. It runs twelve real database tests plus six controlled OFF adapter tests for quantity-draft versions, attribution, scope isolation, audit rollback and schema evolution. It fails rather than skipping if PostgreSQL is unavailable. Catalogue tests check scope isolation, textual codes, empty results and read bounds. Quantity-draft tests use synthetic contexts; session tests additionally verify real login hashes, authoritative context and current rights. Append-only test records use unique synthetic tenant/site IDs; the schema-chain test removes only its own disposable schema.

`smoke` requires OFF_MODE=fixture, the built apps and running migrated/seeded PostgreSQL. It refuses live-provider test dependency. Stop `dev` first: it rejects occupied service ports, starts its own production app processes, then stops those processes. It checks web→same-origin GraphQL, recoverable submitted-value validation and absence of persistence mutations, synthetic fixture markers, missing internal credentials, cross-database access denial, disabled GraphQL introspection and dependency failure readiness. The second seed followed by one marker row per database establishes setup idempotence; this is not stock-command idempotence. The access smoke now verifies real login, CSRF, cookies, workspace gating, cross-site denial, user switching, expiry/revocation and failed logout during Identity outage. Full product/stock endpoint isolation remains future work.

Other commands:

```sh
npm run build:backend
npm run db:generate
npm run db:validate
npm run lint
npm run typecheck
npm run contracts:check
npm test
npm run serve -- web --built
npm run serve -- identity --built
```

Standalone `serve` requires previous builds, validated `.env` and DB setup for service readiness. Without `--built`, Next uses development mode and backend Node watches compiled output; use aggregate `dev` for automatic TypeScript source compilation.

## Configuration and recovery limits

Only `APP_MODE=synthetic` and `SEED_MODE=synthetic` are supported. Non-loopback binds/DB hosts, wrong role/database, unsafe origins, missing/placeholder secrets, duplicate ports, invalid session limits or enabled external/offline/evidence modes are rejected. Session/CSRF settings are active in SP1-04. The explicit `ALLOW_INSECURE_LOCAL_COOKIES=true` setting permits development cookies on loopback HTTP only; nonlocal/live deployment is still unsupported. APP_MODE or missing dependency failures never silently enable anonymous business access or an external provider.

Defaults in `.env.example` are explicit fixture engineering settings: 30-minute idle and eight-hour absolute session limits, a three-second internal-call timeout and fixture-only OFF lookup; other integrations remain disabled. They are not validated restaurant policies. Camera scanning and OFF identification are described in the [SP2-02 contract](../architecture/contracts/product-identification.md). Camera permission is optional; no image is uploaded. OFF_MODE is explicit disabled/fixture/live, with fixture default and required User-Agent for live. Photos/evidence, AI, OCR, offline queues, Redis, Kafka and cloud providers remain unavailable.

If ports change, update the port fields, WEB_ORIGIN, POSTGRES_PORT and both DB URLs consistently. The web build hashes GATEWAY_PORT and must be rebuilt when that port changes. Database credentials initialize on the first volume creation; changing `.env` does not rotate existing PostgreSQL passwords. Preserve the original `.env`, or explicitly reset only disposable synthetic data. A local volume is not a backup; no live recovery objective or restore rehearsal has been delivered.

For an intentional full **synthetic database deletion**, run:

```sh
npm run infra:reset
npm run dev
```

This reset removes this Compose project's named volume and all synthetic DB content. Do not use it for real operational data. The command includes an explicit synthetic-reset confirmation flag and refuses non-synthetic runtime mode. No evidence files exist in this package.

## CI and troubleshooting

[GitHub Actions](../../.github/workflows/ci.yml) uses pinned Node, `npm ci`, generated synthetic secrets, all checks/builds, Docker migrations/repeated seed, integration tests and smoke. Cleanup runs even on failure. No `continue-on-error`, fake pass, provider credential, cloud activation, deployment or Nx Cloud connection is configured. Local evidence is recorded in [SP1-02](../delivery/SP1-02.md); a remote workflow result is only known after a GitHub run.

- Docker unavailable: start the Docker daemon, retry `infra:up`; do not change app auth or provider mode.
- Existing volume/password mismatch: recover the original ignored `.env` or explicitly reset disposable synthetic data.
- Missing configuration: error identifies its key and redacts its value. A dependency startup failure reports a safe generic error; inspect local dependency state without posting connection strings.
- Nx uses in-process plugins with analytics/daemon/cloud disabled, avoiding Unix worker socket restrictions in controlled environments. Exact versions are in the lockfile; do not replace CLI paths with historical Nx paths.
- Node version mismatch: `engine-strict` fails installation; use the declared runtime, not a forced install.

See the [SP1-03 value/storage/API contract](../architecture/contracts/quantity-draft.md) and [delivery evidence](../delivery/SP1-03.md). The [SP1-05 catalogue contract](../architecture/contracts/catalogue.md) documents the private product-reference list. Individual authentication is documented in the [SP1-04 contract](../architecture/contracts/individual-access.md).
