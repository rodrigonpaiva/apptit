# GHCR container delivery

Status: implemented and locally verified; registry publication blocked by version prerequisites. Owner: root. Isolated worktree/branch: .local/worktrees/ghcr, chore/ghcr-release-images. Started from origin/dev then fast-forwarded to the already published SP2-05 head 89d59b9 to preserve/test the current Sprint 2 code without merging it into dev. Original checkout, .vscode setting and generated next-env change are preserved.

Scope: API/web images, exact-release checkout, validation before push, private GHCR packages, digest/partial-publish reporting. No tag changes, release creation, Sprint 2 acceptance or production activation. Owner: rodrigonpaiva; packages apptit-api and apptit-web.

Initial inspection: only infra/Dockerfile exists at v0.1.0-alpha.1 (9481acc), for PostgreSQL. Its release was published 2026-11-08; application container files are absent. Preserve that tag and do not rebuild it from current application files. v0.1.0-alpha.2 has no tag/release, and SP2-06/Sprint 2 acceptance remains pending. Package metadata queries returned 404; no private/public package existence claim is inferred from unavailable metadata alone.

Actual build/test evidence and final limitations will be recorded after execution.

## Executed verification (2026-11-08)

Toolchain: Node 22.22.2, npm 10.9.7, Docker Desktop engine 29.6.2, Linux ARM64 containers. The host project remains on `feature/sp2-05-receiving-observations`; this task uses `chore/ghcr-release-images`. Base application commit: `89d59b9dc9f30926511edab33e6154d6565e023e`. New packaging is uncommitted and explicitly labeled `local-sp2-05-dirty`, never as a published release.

- `npm ci --offline`: passed from the real lockfile (714 packages).
- `npm run local:env`: generated fresh ignored synthetic configuration in the isolated worktree; original `.env` untouched.
- `node scripts/containers/build.mjs --version local-sp2-05-dirty`: both API and web built; nonroot execution, OCI labels and absence of `.env`/Git/local directories verified. Initial web build found a missing internal runtime build; corrected before the successful run.
- `node scripts/containers/validate.mjs`: passed with disposable PostgreSQL, migrations, repeated seed, separate identity/kitchen/gateway/web roles, gateway readiness and web HTTP 200. Saved receipt stayed `draft`, pending observation stayed `not_activated` with synthetic/unvalidated profile, stock flag stayed false, inventory counts unchanged. Inherited HTTP access smoke passed; stopping only the task-owned identity container produced readiness 503 and expected unavailable behavior. Owned containers, volume and temporary environment files removed.
- `node --test tests/container-publication.test.mjs`: 13/13 passed, covering invalid/unpublished releases, annotated tag resolution, incomplete Sprint 2, missing tagged Dockerfiles, dirty/wrong source, both-image identity checks, public packages, existing tags, moved tags, successful digest/private reporting, partial push failure and role credential projection. Registry calls/pushes in these tests are simulations; they are not publication evidence.

See [local image metadata](local-images.json) and [local container results](local-validation.json). The SHA values there are local image configuration IDs, not registry manifest digests. Local ARM64 verification does not assert AMD64 or multi-platform publication; the release runner must build and test its own images.

## Version status and next owner

| Version | Verified state | Outcome / next action |
| --- | --- | --- |
| `v0.1.0-alpha.1` | Published release, tag `9481acc34da7583f01f2ba0f62c5e38d0a3b3c22`; only the PostgreSQL Dockerfile is present | Application publication blocked by missing application Dockerfiles/entry/probe sources at that exact commit. Tag preserved; no overlay, retag or manual dispatch. |
| `v0.1.0-alpha.2` | No tag/release; Sprint 2 acceptance/SP2-06 pending | Publication prepared, not executed. Finish and validate Sprint 2, record real acceptance evidence/manifest, integrate/promote through repository CI, publish the corresponding release, then run the workflow. |

No registry login/push, release creation, tag mutation or workflow dispatch was performed. No GHCR manifest digest or successful private-package visibility verification exists from this task. API metadata 404 responses are not proof of package absence. Prepared destination names are `ghcr.io/rodrigonpaiva/apptit-api` and `ghcr.io/rodrigonpaiva/apptit-web`.

Independent review has not occurred; the author performed checks and diff review. No Sprint 2 acceptance is claimed. See the [publication runbook](../../development/container-publication.md) for runtime limits, gate schema, private-package behavior, integration and partial-publication recovery.

## Final checks and environment limit

- `npm run check`: passed (exit 0): Prisma schema validation, seven-project lint/boundaries/typecheck, contracts, **50 tests passed / 0 failed**, and all seven production builds. The new container scripts and entry points are included in root lint.
- Workflow YAML parsed successfully using the installed YAML parser; asserted release-published/manual triggers, exact token permissions, SHA checkout and build → validate → publish ordering. Hosted Actions execution: not executed; workflow is not integrated into the default branch.
- After adding uncertain-push reporting, `npm run containers:test` passed again (13/13) and focused lint passed. A failed push without a confirmed digest is reported as an uncertain registry effect, including an explicit warning in the job summary.
- A final image rebuild attempt was interrupted by Docker Desktop disk exhaustion (`no space left on device`; daemon unavailable). The successful image/smoke evidence above is retained, not replaced by that failed attempt. The optional extra database probe added for that repetition was withdrawn; the delivered runtime probe is the already passed version. The remaining changes after the successful image run are publication tooling/tests, root command/lint wiring and documentation; they do not change application/domain code or the Dockerfile. No successful final rebuild is claimed.
- Stopped only this task's stuck build clients and removed only this worktree's reproducible `node_modules` and `.next` directories, freeing approximately 1 GiB. No broad Docker prune, named-volume deletion or cleanup of other worktrees was performed. Full revalidation on the publication runner remains mandatory before any push.

The original checkout still has its preexisting generated `apps/web/next-env.d.ts` modification and `.vscode` directory. The release tag still resolves to its original SHA. No task commit/push/PR or main/dev merge was performed; the bounded change is in the isolated topic worktree. Integration owner next: review/integrate this infrastructure slice through `dev`, preserving SP2-05 work, and complete the remaining Sprint 2 work before alpha.2 activation.

## Authorized continuation — final rebuild recovered

The user authorized repeating the interrupted build and integrating through PR/CI before completing Sprint 2. Docker 29.6.2 was available again with approximately 17 GiB free. On 2026-11-08, `node scripts/containers/build.mjs --version local-sp2-05-dirty` completed successfully for both images, and `node scripts/containers/validate.mjs` passed again with the same isolated synthetic migration/repeat-seed/draft/no-stock/observation/dependency-failure checks. The linked JSON reports now contain this recovered final run. No prior failed attempt is treated as a pass. No registry publication occurred.

SP2-05 integration PR: https://github.com/rodrigonpaiva/apptit/pull/12. This infrastructure branch is being committed/pushed for its own PR into dev, under the user's continuation authorization. Both require passing foundation/branch-policy checks before merge. Alpha.2 remains gated on the SP2-06 work and real Sprint 2 acceptance.


## Pre-activation workflow correction

Final integration review found that `runner` context is unavailable in job-level `env`. The original release job used it there for report paths. Paths now come from runner shell variables in a first step through `GITHUB_ENV`; artifact paths remain in supported step context. This preserves exact-tag checkout, token permissions and publication gates. Source: https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#context-availability. The correction must pass its own PR/CI before alpha.2 activation; a generic foundation pass alone does not prove a release-only workflow is valid.

`actionlint` 1.7.12 validated the corrected release workflow successfully (`-shellcheck=` because shellcheck is not installed locally). Binary came from the official rhysd/actionlint release into /tmp; no repository dependency/lock change. Hosted publication remains gated until Sprint 2 acceptance and release publication.

## Alpha.2 published release, partial registry result and hardening

The accepted Sprint 2 baseline was promoted through PR #17, after exact-dev CI and a bounded no-content-change ancestry sync (#18). Main `4c84d46` passed push CI. Alpha.2 was published as a prerelease at that exact commit; alpha.1 remained unchanged. Release workflow 43417110222 built and validated both images, pushed API, then stopped at private visibility verification before web. Subsequent anonymous registry reading confirmed the API digest is publicly readable. [Exact evidence, cause and blocked recovery](alpha2-first-attempt/README.md).

The correction does not move the release tag, overwrite the API, delete versions or publish web into an unresolved public namespace. Registry preflight and strict existing-digest proof now precede any push; lack of REST metadata never establishes privacy. A new owner decision is required because GitHub does not support public-to-private package conversion. Future activation must use updated reviewed workflow tooling, with image sources still checked out from the original release commit.


## Owner-approved alpha.2 API retention

The user subsequently explicitly authorized keeping the exact existing `apptit-api` alpha.2 digest public and publishing `apptit-web` private, without deletion. The reviewed approval record permits retention only for that source/tag/digest/platform with prior two-image validation. It never permits a new public API push or an overwrite. Other packages/releases remain private by default. [Decision and tests](alpha2-first-attempt/README.md#explicit-owner-decision--2026-11-13). The release tag is not moved; a manual workflow from updated main will use the original tagged image sources.
