# Apptit

B2B foodservice planning, execution and inventory platform, currently implemented as a local synthetic development environment.

The integrated `dev` baseline supports individual scoped access, a private reference catalogue and traceable receiving drafts: product lookup/scanning, quantity/batch/date entry, private label photos, synthetic procedure-bound observations and committed-save recovery. Post-Sprint-2 extensions add opt-in local OCR with explicit human review, catalogue/OFF reference photos, persistent server-validated product/presentation identities, and chef-managed physical storage destinations with historical retention. Saving or reviewing a draft creates no stock. Offline capture and live operational deployment remain disabled.

Start with the [current execution matrix](docs/planning/DELIVERY-STATUS.md) for SP/AP coverage, integration links, partial parent criteria and the next planned package, **SP3-01**. The [Sprint 2 acceptance](docs/delivery/SPRINT-2-ACCEPTANCE.md) is historical evidence for the bounded synthetic release, not evidence that later extensions are present in published alpha.2.

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
- `test:integration`: real PostgreSQL tests for quantities, version conflicts/audit rollback, migration evolution, sessions, catalogue isolation and private evidence integrity/authorization. An unavailable database fails the run instead of skipping tests.
- `smoke`: actual HTTP login, Origin/CSRF/cookies, private catalogue and receipt-image upload/read, cross-site denial, forged identity rejection, expiry/revocation and dependency-failure behavior.

[Local setup, commands and troubleshooting](docs/development/local-development.md) covers configuration changes, standalone runtimes and intentional synthetic reset. No real restaurant approval, production deployment, stock availability or live recovery guarantee is claimed.

## Architecture

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
- [SP2-03 receipt drafts](docs/delivery/SP2-03.md)
- [SP2-04 private label evidence](docs/delivery/SP2-04.md)
- [SP2-05 synthetic receiving observations](docs/delivery/SP2-05.md)
- [SP2-06 draft durability and recovery](docs/delivery/SP2-06.md)
- [Sprint 2 technical acceptance](docs/delivery/SPRINT-2-ACCEPTANCE.md)
- [Container builds and GHCR publication/retention](docs/development/container-publication.md)

Run `npm run verify:foundation` with app ports free for the complete sequential foundation check and a private local JSON report. Run `npm run check` for schema/lint/type/contract/test/build verification. Run `npm run test:integration` and `npm run smoke` after building and starting/migrating/seeding the synthetic databases as documented. No real restaurant approval or deployment is claimed.
TypeScript, Nx/npm workspaces, Next.js/React, NestJS/Apollo GraphQL, Prisma and PostgreSQL. Exact versions are recorded in the lockfile and [toolchain matrix](docs/development/toolchain.md).

| Location | Responsibility |
| --- | --- |
| `apps/web` | Responsive web client and same-origin API proxy |
| `apps/gateway-api` | Public GraphQL/session boundary and response composition |
| `services/identity` | Users, sessions, sites, memberships and authoritative access checks |
| `services/kitchen` | Scoped catalogue, receipt/evidence/observation and versioned draft persistence |
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

- [Current execution matrix and AP parent coverage](docs/planning/DELIVERY-STATUS.md)
- [Status definitions, maintenance and release boundaries](docs/planning/README.md)

- [Product specification v0.80](plans/APPTIT_SPEC_v0.80_EN.md)
- [Delivery backlog v1.0](plans/backlog/APPTIT_BACKLOG_v1.0_EN.md)
- [First four sprints](plans/sprints/APPTIT_SPRINTS_01-04_v1.0_EN.md)

- [SP2-03 receipt drafts](docs/delivery/SP2-03.md)
- [SP2-04 private label evidence](docs/delivery/SP2-04.md)

- [SP2-05 procedure-bound receiving observations](docs/delivery/SP2-05.md)

### Run the published alpha.2 containers

With Docker Desktop running and port 3000 free, run `npm run containers:up`, then open http://127.0.0.1:3000/login. Generated private fixture credentials are in `.local/alpha2/fixture-credentials.json`. Stop with `npm run containers:down`; database and photo volumes are preserved. On a fresh setup this uses published alpha.2; an existing selected local preview is retained. Published alpha.2 does not contain the later OCR/photo/storage extensions. See [the local release container guide](docs/development/local-release-containers.md) for the explicit local build/preview commands, requirements and troubleshooting.
