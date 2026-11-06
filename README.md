# Apptit

B2B foodservice planning, execution and inventory platform, currently implemented as a local synthetic development environment.

The current `dev` baseline supports individual sign-in, server-verified restaurant access and a private product-reference catalogue. Product references describe presentations; they do not represent received batches or available stock. SP2-01 adds receiving/operation/evidence contracts and pure draft validation. SP2-02 adds authenticated code lookup, optional on-device scanning and temporary manual identification. Receiving forms/persistence, stock operations, file uploads, offline capture and live external integrations remain outside the enabled slice.

## Run locally

Use **Node 22.22.2**, **npm 10.9.7** and Docker with Compose v2. Start Docker and leave ports **3000, 4000–4002 and 55432** available.

For a fresh checkout, use `dev` for the integrated feature baseline. `main` receives tested promotions through pull requests.

```sh
git clone https://github.com/rodrigonpaiva/apptit.git
cd apptit
git switch dev
npm ci
npm run local:env
npm run git:setup
npm run dev
```

`local:env` generates private synthetic secrets in the ignored `.env` and individual test credentials in `.local/fixture-credentials.json`. It preserves existing settings; do not copy example placeholders as working credentials or commit these files.

`dev` builds the backend, starts PostgreSQL, applies migrations, seeds the synthetic accounts/catalogue and launches the web app and three backend services.

Open **http://127.0.0.1:3000/login**. Use `127.0.0.1` consistently: `localhost` is a different Origin and is rejected by the configured write protection. The current interface uses French copy.

### Test the visible flow

Use the passwords generated in your own `.local/fixture-credentials.json`:

- `chef.a@apptit.test`: Restaurant A, three product references.
- `chef.b@apptit.test`: Restaurant B, one distinct reference.
- `stock.a@apptit.test` / `cook.a@apptit.test`: individual storekeeper/cook accounts for A.
- `chef.multi@apptit.test`: select either explicitly authorized restaurant.

In `/workspace`, search by product name, presentation or textual barcode, for example `0012345678905`. Leaving the page hides private content; returning revalidates access and reloads the list. Logout revokes the server session. Typed navigation/search requires no camera permission. The “Identifier un produit” section optionally scans with the camera and always supports manual identification. OFF defaults to deterministic examples; explicit OFF_MODE=live enables read-only public lookup. Restart dev after configuration changes.

Ctrl+C stops the app processes. `npm run infra:down` stops the local infrastructure while preserving its database volume. A volume is not a backup.

## Verification

After the initial installation/configuration, stop your dev app before running the complete sequence; smoke starts its own production processes and rejects occupied app ports.

```sh
npm run check
npm run infra:up
npm run db:migrate
npm run db:seed
npm run db:seed
npm run test:integration
npm run smoke
```

- `check`: Prisma schemas, lint/module boundaries, types, contract compilation, unit/configuration/security/policy tests and production builds.
- `test:integration`: real PostgreSQL tests for quantities, version conflicts/audit rollback, migration evolution, sessions and catalogue isolation. An unavailable database fails the run instead of skipping tests.
- `smoke`: actual HTTP login, Origin/CSRF/cookies, private catalogue, cross-site denial, forged identity rejection, expiry/revocation and dependency-failure behavior.

[Local setup, commands and troubleshooting](docs/development/local-development.md) covers configuration changes, standalone runtimes and intentional synthetic reset. No real restaurant approval, production deployment, stock availability or live recovery guarantee is claimed.

## Architecture

feature/sp1-06-foundation-verification
- [Setup, commands and troubleshooting](docs/development/local-development.md)
- [Toolchain compatibility](docs/development/toolchain.md)
- [SP1-02 acceptance evidence](docs/delivery/SP1-02.md)
- [SP1-03 quantities and versioned persistence](docs/delivery/SP1-03.md)
- [SP1-04 individual access](docs/delivery/SP1-04.md)
- [SP1-05 private product list](docs/delivery/SP1-05.md)
- [Sprint 1 demonstration and verification](docs/development/foundation-demo.md)
- [SP1-06 delivery evidence](docs/delivery/SP1-06.md)
- [SP2-01 receiving/operation/evidence contracts](docs/delivery/SP2-01.md)
- [SP2-02 product identification and OFF/manual fallback](docs/delivery/SP2-02.md)

Run `npm run verify:foundation` with app ports free for the complete sequential foundation check and a private local JSON report. Run `npm run check` for schema/lint/type/contract/test/build verification. Run `npm run test:integration` and `npm run smoke` after building and starting/migrating/seeding the synthetic databases as documented. No real restaurant approval or deployment is claimed.
=======
TypeScript, Nx/npm workspaces, Next.js/React, NestJS/Apollo GraphQL, Prisma and PostgreSQL. Exact versions are recorded in the lockfile and [toolchain matrix](docs/development/toolchain.md).

| Location | Responsibility |
| --- | --- |
| `apps/web` | Responsive web client and same-origin API proxy |
| `apps/gateway-api` | Public GraphQL/session boundary and response composition |
| `services/identity` | Users, sessions, sites, memberships and authoritative access checks |
| `services/kitchen` | Scoped catalogue and internal versioned reference-draft persistence |
| `packages/*` | Shared contracts, exact domain values and runtime helpers |

Identity and Kitchen own separate databases and generated clients. The gateway has no business database. See [architecture/ADRs](docs/architecture/README.md) and the [typed first-slice contract](docs/architecture/contracts/first-slice.md).

## Protected branch workflow

```text
feature/* → PR → dev → successful dev push CI → promotion PR → main
```

Native GitHub rulesets are active on [main](https://github.com/rodrigonpaiva/apptit/rules/26610391) and [dev](https://github.com/rodrigonpaiva/apptit/rules/26610401). Both require PRs, `branch-policy` and `foundation` from GitHub Actions, an up-to-date base and resolved review conversations. Force pushes/deletion are blocked, with no configured bypass actors. Main promotions use merge commits only.

The required branch-policy check permits only this repository's `dev` to target `main` and verifies successful push CI on that exact dev head. An additional human approval is not mandatory while the repository has one maintainer. Run `npm run git:setup` in each checkout for the local pre-push guard too.

Follow the [branch workflow](docs/development/branch-workflow.md); never commit directly to main/dev or bypass required checks. An active ruleset does not replace review or prove that every defect is detected.

## Product and planning

- [Product specification v0.80](plans/APPTIT_SPEC_v0.80_EN.md)
- [Delivery backlog v1.0](plans/backlog/APPTIT_BACKLOG_v1.0_EN.md)
- [First four sprints](plans/sprints/APPTIT_SPRINTS_01-04_v1.0_EN.md)
