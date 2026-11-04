# ADR-0001 — First service topology and workspace

- Date: 2026-11-04
- Status: selected engineering baseline for synthetic first slice
- Sources: specification §§10/18, DEC-001/006/029; AP-011/AP-012; SP1-01 AC1.

## Context and alternatives

A separate service for every listed context multiplies deployment, integration and recovery work before a first visible flow. A single backend process would reduce startup cost but does not preserve the intended microservices baseline. Select a few capability-grouped services, keeping module boundaries explicit so extraction can follow demonstrated need.

## Decision

| Runtime | Owned modules / responsibility |
| --- | --- |
| `apps/web` | Next.js responsive phone/tablet web client; no database or business authority |
| `apps/gateway-api` | NestJS + Apollo GraphQL external boundary; session cookie handling, composition, request limits, typed errors |
| `services/identity` | NestJS identity, credentials, sessions, tenants, sites, memberships and capability assignments |
| `services/kitchen` | NestJS scoped catalogue and later receiving, operational safety snapshots, evidence metadata, lots, ledger; recipes/planning later as separate modules |

Grouping receiving disposition and inventory in Kitchen permits one authoritative transaction when accepting goods. Recipe, safety and catalogue modules communicate through application ports; sharing a runtime does not permit arbitrary cross-module table writes. Identity owns site configuration; Kitchen records reviewed operational snapshots with source version. Changes requiring freshness are revalidated before effect. Catalogue entries cannot be deleted out from under historical references.

Select TypeScript, **Nx + npm workspaces**, npm lockfile, Docker Compose for local dependencies and GitHub Actions for CI. Nx is chosen for task dependency graphs and enforceable module boundaries; plain npm was considered simpler but leaves these conventions to custom scripts. No Nx Cloud dependency, distributed agents or paid service is required. Use `apps/*`, `services/*`, `packages/*`; shared packages contain contracts/value primitives, never another service's repositories or credentials. TypeScript project references and package exports should define build boundaries.

Select responsive Next.js web for the first demonstration. React Native/native delivery and installation/PWA/offline capabilities remain evaluation-only pending device evidence; no separate mobile scaffold in SP1-02. This is a first-slice client choice, not a claim that browsers satisfy all eventual device needs.

The public API is GraphQL via NestJS/Apollo. Federation is not required for this initial composing gateway. Internal calls use versioned HTTP/JSON over private local interfaces, with authenticated service calls and bounded deadlines. Redis RPC, Kafka request/reply and direct browser-to-service access are not selected. File bytes use dedicated authenticated HTTP endpoints, not GraphQL base64 payloads. Jobs/events use contracts distinct from synchronous queries.

## Version and cost policy

Exact Node, npm, Nx, NestJS, Apollo, Next.js, TypeScript, Prisma and PostgreSQL versions are selected together in SP1-02 using current primary documentation and supported stable releases. Record runtime/engine/peer constraints, exact lockfile resolution, image tags (no `latest`) and compatible generated Prisma clients; verify clean install/build. This ADR selects technologies, not unverified version numbers. No cloud cost, staffing or performance claim is made.

## Consequences and revisiting

Three backend processes add local overhead, private-call authentication and identity availability dependency. In return they establish real service ownership while retaining local inventory consistency. Avoid shared DB joins across services, distributed transactions and eager service splitting. Extract modules when independent scaling, ownership, isolation or recovery justifies it; extraction must move authority and event contracts explicitly. SP1-02 only scaffolds what the first authenticated query requires.

## Implementation references

- [Nx TypeScript](https://nx.dev/docs/technologies/typescript/introduction) and [project linking](https://nx.dev/docs/kb/typescript-project-linking): consulted for workspace/project references.
- [NestJS GraphQL](https://docs.nestjs.com/graphql/quick-start) and [microservices](https://docs.nestjs.com/microservices/basics): implementation references; retrieval timed out during this ADR, so compatibility remains to be checked in SP1-02.
