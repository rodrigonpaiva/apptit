# Sprint 1 — Repeatable synthetic foundation demonstration

Use a checkout containing SP1-06 (its feature branch before integration, `dev` afterward). This runbook verifies the enabled slice, not live restaurant readiness. Credentials, generated clients, build output and local reports are private/ignored; none should be copied into a PR.

## Fresh local start

Use the pinned Node 22.22.2 and npm 10.9.7 with Docker running. Application ports 3000/4000/4001/4002 must be free. Stop your own `npm run dev` with Ctrl+C before running verification; the command never terminates an existing application for you.

```sh
npm ci
npm run local:env
npm run verify:foundation
```

The verifier executes, in order: `check` → `infra:up` → `db:migrate` → `db:seed` → `db:seed` → `test:integration` → `smoke`. A failure stops the sequence and returns a nonzero exit code. Later steps are `not_run`, never passes. It records timestamp, Node version, Git revision/dirty flag (or null for an exported checkout), step outcomes/durations and overall result in `.local/verification/foundation-*.json`. It does not record credentials, cookie values or environment dumps. Dependency installation is a separate required step, not implicitly included in the report.

`check` covers schemas, rules/module boundaries, types, contracts, unit tests and builds. Real PostgreSQL integration tests cover version conflicts, attributable revisions, transaction rollback, schema evolution, sessions and catalogue scope. HTTP smoke starts/stops its own four production app processes and exercises the authenticated catalogue and denied paths. No database test silently skips an unavailable database. The two seeds test repeatability; neither creates stock.

The database remains running with its volume preserved after verification. `npm run infra:down` stops it without removing data. Existing database configuration/credentials must match the volume; do not solve a mismatch by resetting a volume with data you need. No reset is part of verification.

## Visible sprint review

After verification:

```sh
npm run dev
```

1. Open **http://127.0.0.1:3000/login**. `localhost` is a different Origin and is deliberately rejected. Use your own `.local/fixture-credentials.json`; never paste its passwords into shared evidence.
2. Sign in as `chef.a@apptit.test`. Workspace displays the actual identity and Restaurant A; its catalogue contains three synthetic references. Search `0012345678905` and verify the zeros remain intact. Product presentations are not received batches or stock.
3. Attempt site B using the browser console on this same origin. This read-only request must return `errors` with code `FORBIDDEN` and no catalogue data:

```js
fetch('/api/graphql', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    query: 'query Denied($input: SiteScopeInput!) { catalogue(input: $input) { items { id name } } }',
    variables: { input: {
      tenantId: '10000000-0000-4000-8000-000000000002',
      siteId: '20000000-0000-4000-8000-000000000002'
    } }
  })
}).then(response => response.json()).then(console.log);
```

4. Return to the page: losing focus hides private content; returning triggers fresh access validation. The console itself may trigger this lock. No camera permission is needed.
5. Log out using the visible account control (exit icon on small screens). `/workspace` requires authentication again. Sign in as Chef B to see its one distinct reference, or multisite Chef to change between both permitted restaurants.
6. For **server revocation independent of cookie removal**, stop dev and run `npm run smoke`. The automated scenario copies its own cookie, replaces a session and confirms the old cookie is denied; it also revokes only a session created by the smoke and asserts the next catalogue request returns `SESSION_REVOKED`. No administrator revocation UI is claimed.

## Failure and evidence interpretation

- Occupied app port: verification stops before build/migration/seed; stop your own dev session and retry. The failure report remains as evidence of this guard.
- Wrong runtime: `npm ci` rejects unsupported engines. Select the pinned version; do not force installation.
- Missing config/Docker/database: correct the named local prerequisite and rerun. A failed or incomplete report never closes acceptance criteria.
- Dependency outage: private access fails closed; it is not a successful empty catalogue or confirmed logout.
- Reports say `source.dirty=true` when local edits/untracked files exist; a passing report is evidence for that working tree, not a claim that CI passed on a later commit.
- Application tests need no live OFF/AI/OCR/camera/evidence provider. Installing dependencies/building the PostgreSQL image may need network access.

## Isolated empty-database verification

For a fresh-database rehearsal alongside an existing development environment, use a separate disposable checkout and **newly generated secrets**, never copy the working `.env`. Run `local:env` there and adjust its WEB/GATEWAY/IDENTITY/KITCHEN ports, `WEB_ORIGIN`, `POSTGRES_PORT` and both database URL ports consistently. Start every verification/cleanup command with the same distinct `COMPOSE_PROJECT_NAME`; this isolates Compose containers and named volumes from `apptit-synthetic`.

SP1-06 evidence used app ports 3100/4100/4101/4102, DB 55433 and a unique `apptit-sp106-*` Compose project. No primary database reset was performed. Only this specifically created disposable project's volume may be removed after collecting evidence; normal development cleanup remains `infra:down` without volume deletion.

See [delivery evidence](../delivery/SP1-06.md) and [Sprint 2 handoff](../architecture/contracts/sprint-2-handoff.md).
