# SP1-02 toolchain selection

Recorded 2026-11-04 (Europe/Paris). Exact direct versions and all transitive resolutions are in `package-lock.json`. Registry metadata/installed manifests and official references were checked; technology choices implement ADR-0001/0002.

| Component | Selected version | Compatibility / role |
| --- | --- | --- |
| Node / npm | 22.22.2 / 10.9.7 | Declared engine range Node 22.22.2–22.x, npm 10.9.7–10.x; CI selects exact Node |
| Nx / @nx/js / @nx/eslint-plugin | 24.0.4 | Matched versions, local task graph/cache and lint boundaries; no Cloud |
| TypeScript | 5.9.3 | Within Nest GraphQL `^5.5` and typescript-eslint `<6.1`; not registry's newer incompatible TypeScript major |
| Next.js | 16.4.5 | Node ≥20.9; responsive App Router shell; deterministic webpack build, no remote font |
| React / React DOM | 19.3.1 | Matching versions accepted by Next's React 19 peer range |
| Nest common/core/platform-express | 12.3.3 | Matched Nest major; ESM; Node ≥20 |
| Nest GraphQL / Apollo | 14.2.0 | Nest 12 peers; SDL-first shell schema, no federation |
| Apollo Server / Express 5 integration | 5.5.1 / 1.1.2 | Apollo requires GraphQL `^16.11`, Node ≥20 |
| GraphQL | 16.14.2 | Meets both Nest and Apollo peers; registry GraphQL 17 is not compatible with Apollo's declared range |
| Prisma CLI / client / adapter-pg | 7.10.1 | Matched stable release; requires Node ^22.12 (22 line) and TS ≥5.4; Prisma 8 RC deliberately not selected |
| pg | 8.23.1 | PostgreSQL adapter driver |
| PostgreSQL image | 18.6-alpine | Pinned base tag in local Dockerfile; separate logical DBs/roles; no floating latest |
| ESLint / @eslint/js | 10.14.0 / 10.0.1 | Supported installed lint engine; TS lint package accepts ESLint 10 |
| typescript-eslint | 8.72.1 | Supports selected TS and ESLint versions |
| reflect-metadata / RxJS | 0.2.2 / 7.8.2 | Nest peer ranges |

ESM `NodeNext` and `.js` relative imports are used for compiled backend code; Prisma generator emits ESM with service-local output. A common shared generated client is prohibited. Next uses Bundler module resolution. Workspace package exports/TypeScript references provide library boundaries; applications expose no importable package API.

GitHub Actions uses `actions/checkout@v7` and `actions/setup-node@v7`, following their current official examples; the integrated SP1-05 dev head passed the complete remote foundation workflow on 2026-11-05 ([run 42015585388](https://github.com/rodrigonpaiva/apptit/actions/runs/42015585388)). This evidence does not claim CI on later unpushed work.

## Primary references

- [Nx 24 release](https://nx.dev/blog/nx-24-release), [Node support](https://nx.dev/docs/technologies/node/introduction), [version matching policy](https://nx.dev/docs/reference/releases).
- [Next manual installation and requirements](https://nextjs.org/docs/app/getting-started/installation).
- [Prisma 7 system requirements](https://www.prisma.io/docs/orm/v7/reference/system-requirements), [driver adapters](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/database-drivers), [generator options](https://www.prisma.io/docs/orm/v7/reference/prisma-schema-reference).
- [PostgreSQL 18.6 release](https://www.postgresql.org/docs/release/18.6/).
- Nest GraphQL documentation retrieval timed out; the installed official package READMEs, type declarations and published engine/peer manifests supplied the concrete integration API, then build and smoke verified it. This does not assert that a timed-out page was read.

Do not blindly install registry `latest`: at selection time it included a Prisma release candidate and incompatible TypeScript/GraphQL majors. Revisit exact versions through a separately validated dependency update.

- [actions/checkout](https://github.com/actions/checkout) and [actions/setup-node](https://github.com/actions/setup-node).

## SP1-04 additions

`argon2@0.45.2` (Node ≥16.17; tested on selected Node 22) implements password hashes; `@types/express@5.0.6` types the HTTP controllers. Exact versions are fixed in the manifests/lockfile. No auth/cloud provider or native mobile framework is selected.

## SP2-02 scanner

`zxing-wasm@3.1.6` is pinned in the web workspace. Only its reader is lazily imported; the matching WASM is served from the app's fixed same-origin route, with explicit Next file tracing. No CDN or scanner cloud service is used. Controlled Chromium video decoding passed; physical-device/lighting/Safari coverage remains pending. Public MIT and ZXing-C++ Apache-2.0 notices ship in apps/web/public/licenses.
