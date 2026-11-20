# Local alpha.2 container execution

## Scope and ownership

Task: local execution of the published alpha.2 images, following Sprint 2's synthetic receiving-draft boundary. Integration owner: coding agent, infrastructure role. No independent review is claimed. Base: dev `5ce92bbd70ea2af70e812448c5c7933affddc272`; branch `feature/containers-local-compose`.

References: local sprint plan v1.0, Sprint 2 SP2-01–SP2-06; specification v0.80; `SPRINT-2-ACCEPTANCE.md`; existing container publication runbook. This is packaging/execution support, not another product sprint package or stock activation.

Acceptance: start exact existing digests without rebuilding application images; isolated PostgreSQL and private-photo volumes; migrations and synthetic seed; role-scoped generated credentials separate from development configuration; loopback-only host entry; readiness checks; stop/restart without data deletion; browser login and existing receipt regression.

Owned surfaces: `containers/local/`, `scripts/containers/local.mjs`, root npm scripts, README and this guide/evidence. No application contracts, migrations, release tags, package digests or visibility changes. Existing unrelated checkout changes remain untouched.

## Implementation

Docker Compose shares the PostgreSQL network namespace to preserve released loopback contracts. A credential-free HTTP forwarder publishes only `127.0.0.1:3000`. Private photo initialization fixes UID/GID 1000 and mode 0700; the application's private-directory guard caught the initial 0755 volume permissions during verification. Healthchecks for internal services authenticate with their scoped internal token. Failed initial attempts are not acceptance evidence; the complete probe passed after correction.

Commands are documented in `docs/development/local-release-containers.md`. `containers:down` retains volumes and generated credentials. The selected images remain Linux/amd64, including under Apple Silicon emulation.

## Executed verification

- `node --test tests/container-publication.test.mjs tests/container-registry.test.mjs tests/container-retention.test.mjs`: 32 passed, zero failed.
- Focused ESLint for the new runner and container helper scripts: passed.
- `node scripts/containers/local.mjs up`: application images loaded by immutable GHCR digest; PostgreSQL fixture built; migrations and seed completed; services healthy.
- Existing `containers/probe.mjs`, executed inside the gateway with fresh isolated fixture credentials: passed HTTP authentication/CSRF/scope/photo/observation/operation regression, draft state, pending observations, unchanged inventory and dependency-unavailable handling. The test temporarily stopped/restarted only this project's identity container. Sanitized output: `evidence/local-alpha2-compose/probe.jsonl`.
- Host request to `http://127.0.0.1:3000/login`: HTTP 200.

Additional restart/browser verification results are recorded below after execution. No production data, external provider activation, real stock posting or image publication is involved.

- `containers:down` followed by `containers:up`: passed; exact receipt/evidence row counts and the generated settings checksum were unchanged. No volume-delete option was used.
- Host browser-protocol verification after restart: CSRF bootstrap, individual login, workspace HTTP 200, read of a previously stored private PNG through the forwarded route, logout and session revocation passed. Result: `evidence/local-alpha2-compose/restart-browser.json`.
- `git diff --check`: passed. Application runtime source and the published images were not changed or rebuilt. Full repository checks remain subject to PR CI; independent review has not been performed.

The local demonstration is left running at the documented URL. No credentials are included in evidence.
