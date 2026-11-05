# Sprint 1 — Technical acceptance test record

Date: 2026-11-05 (Europe/Paris).
Result: **PASS for the enabled local synthetic Sprint 1 scope.** All executed checks passed; no skipped tests or blocking defect was found by this validation. This records technical evidence for the owner's sprint decision, not production readiness or an independent security certification.

## Tested source and isolation

Baseline `fa2a934d27d954defb576eb08435262243913408` plus the current uncommitted SP1-06 changes on `feature/sp1-06-foundation-verification`. A separate fresh Git worktree received the same tracked patch and the four new SP1-06 files; a SHA-256 manifest of 120 public source/configuration files was recorded and checked unchanged after execution. Reports explicitly retain dirty=true rather than attributing these results to an uncreated commit.

Clean `npm ci` used Node 22.22.2/npm 10.9.7 and newly generated private secrets. Application ports were 3100/4100/4101/4102, PostgreSQL 55433, Compose project `apptit-sprint1-t9jptm`. The named volume was created empty; both Identity and all three Kitchen migrations applied. Original development databases, credentials and running app processes were not used for the tests.

## Actual results

| Check | Result |
| --- | --- |
| Clean lockfile installation | Passed |
| Prisma validation, lint/tooling/module boundaries, seven-project type checks, design contract compilation | Passed |
| Unit/configuration/security/branch-policy tests | 17 passed, 0 failed, 0 skipped |
| Seven-project production build | Passed |
| Empty-database migrations and two seeds | Passed |
| PostgreSQL quantity/catalogue integration tests | 8 passed, 0 failed, 0 skipped |
| PostgreSQL individual-session integration tests | 4 passed, 0 failed, 0 skipped |
| Production HTTP smoke including negative authorization | Passed |
| Chromium production-browser acceptance scenarios | 17 passed; no unhandled page errors |
| Source manifest, documentation links, whitespace and private-value checks | Passed |

The seven-stage foundation run completed 2026-11-05 11:10:34–11:10:55 UTC. Browser scenarios completed 11:12:27–11:12:33 UTC. These are local results, not a claim of remote CI on the uncommitted SP1-06 tree.

## Sprint acceptance criteria coverage

| Criterion | Evidence / scope |
| --- | --- |
| SP1-01 AC1 — topology, authority, transactions, API/events | ADR-0001/0002 and first-slice contracts reviewed against actual Web/Gateway/Identity/Kitchen ownership; module boundaries and contract compilation pass. Future stock/outbox/event responsibilities remain contracts only. |
| SP1-01 AC2 — precision/date, session/revocation, draft ownership | ADR-0002/0003; decimal/date/unknown tests, session integration, scoped online browser flow; offline capture is explicitly disabled. Real-site policies remain provisional. |
| SP1-01 AC3 — adapters/config/manual behavior | ADR-0004, runtime config rejection tests and disabled modes; manual search/navigation needs neither camera nor provider access. Evidence storage remains future work. |
| SP1-02 AC1 — fresh setup/check path | Fresh install with new build output, clients and empty databases; all seven verifier stages passed from runbook instructions. |
| SP1-02 AC2 — synthetic mode and secret handling | Generated individual credentials; config/live-mode rejection, HttpOnly cookie/hash checks, safe reporting and repository secret scan. No real restaurant data. |
| SP1-02 AC3 — visible CI outcomes | Branch-policy tests pass. Prior dev baseline CI run 42015585388 is green. SP1-06-specific remote CI is pending until commit/push/PR; no missing result is presented as a pass. |
| SP1-03 AC1 — unit/basis/precision/date/unknown | Seven domain-value tests plus real DB round-trip preserve maximum exact decimals, measured zero vs unknown, date-only values and DST context; invalid input is rejected. |
| SP1-03 AC2 — attributable versions/conflicts | DB tests verify actor/name/session/site snapshots, immutable revisions, one winner for concurrent same-version writes and rollback on audit failure. These use synthetic trusted application contexts; no public draft write endpoint is claimed. Real online actor construction is separately tested in Identity. |
| SP1-03 AC3 — ownership/schema/errors | Empty migration chain, preserved existing marker, separate databases/credentials, field-specific validation and actual HTTP validation smoke pass. |
| SP1-04 AC1 — individual identity/site | Actual browser logins for Chef A, Chef B, storekeeper, cook and multisite Chef; selected site and displayed individual checked. |
| SP1-04 AC2 — scope and revoked-session denial | HTTP, DB and browser checks reject changed tenant/site and forged role/actor. Browser session revoked by its exact stored hash is denied on next catalogue request. Idle/absolute expiry and account/membership changes pass DB/HTTP tests. |
| SP1-04 AC3 — minimal roles/no shared account | Five distinct fixture accounts; explicit capability map and minimal role checks pass; no implicit operational/admin grant exists. |
| SP1-05 AC1 — reference vs batch; textual barcode | Separate catalogue table/cards and null bulk barcode; leading-zero codes survive DB/API/browser search. No available-stock value is inferred. |
| SP1-05 AC2 — responsive states | Chromium 320/390/768/1440 px without horizontal overflow. Phone/tablet captures visually inspected. Loading/empty/no-result/error/retry states exercised. |
| SP1-05 AC3 — scope and camera-free navigation | Real browser cross-site denial; typed name/code search with no camera permission; site selection changes the actual scoped list. |
| SP1-06 AC1 — repeatable full demo | Fresh verifier plus production-browser login → list → cross-site denied → exact-session revoked → next read denied. |
| SP1-06 AC2 — actual records/failure visibility | Unit, integration, smoke and browser outcomes preserved separately. Occupied-port failure behavior was also tested during SP1-06 and recorded as a failed preflight with later steps not_run. No skipped tests or hidden failure is counted as success. |
| SP1-06 AC3 — safe synthetic scope | No public persistence/stock mutation, real-site onboarding or live provider required. Synthetic labels and disabled optional capabilities remain. |

## Browser scenario details

1. Unauthenticated workspace redirects; current-session API denies access.
2. Incorrect individual credentials show a generic recoverable error and clear the password field.
3. Chef A sees actual identity, selected site, three references and leading-zero barcode.
4. Cross-site/changed-tenant reads deny access despite forged role/actor headers.
5. 320/390/768/1440 px layouts fit, with no camera permission.
6. Manual barcode search and no-result recovery work.
7. Blur removes products; a late response cannot restore them; return refetches.
8. Controlled empty/error responses and delayed loading remain explicit; retry restores actual data.
9. Browser network-offline event hides private data; explicit revalidation recovers.
10. Simulated logout failure stays locked on focus; real retry revokes the copied cookie server-side.
11. Chef B sees its own one reference and is denied site A.
12. Storekeeper and cook each see their actual individual account/permitted list.
13. Multisite Chef changes A → B → A without retaining the prior site's products.
14. Targeted database revocation of this browser's session denies the next read and hides private data.
15. Actual isolated Kitchen shutdown shows unavailable; restart/retry restores data.
16. Actual isolated Identity shutdown fails closed without stale identity/catalogue.
17. No unhandled browser page errors.

Blur/focus transitions are programmatically dispatched. Browser offline and service shutdowns are actual controlled failures. Empty/error/logout-failure states use interception to exercise recovery; server-side authorization/revocation additionally use real responses and DB state. Viewports are browser emulation, not physical-device, Safari or full accessibility coverage.

## Evidence and remaining gates

Private ignored artifacts in `.local/qa-sprint-1/`: `foundation-report.json`, `browser-report.json`, `source-manifest.json`, `acceptance-browser.mjs`, `workspace-320.png`, `workspace-390.png`, `workspace-768.png`, `workspace-1440.png`, `empty.png`, `error.png`. Passwords/cookies are not printed or included in these reports/screenshots. The local browser harness uses an already-installed Playwright/Chromium cache and is not part of GitHub CI. The disposable worktree/container/volume are cleaned up after evidence collection.

No blocking failure was found in the tested enabled paths. The Sprint 1 goal is technically validated locally. Owner acceptance and the usual SP1-06 commit → feature push → dev PR → exact-head CI/review/integration remain distinct. The prior dev baseline [CI run 42015585388](https://github.com/rodrigonpaiva/apptit/actions/runs/42015585388) is green; commit/push of this package is authorized by the user; its PR/remote CI/integration remain pending. Main remains unchanged.

Final visual refinements and personal PIN unlock stay deferred. Full product QA, physical devices, accessibility certification, load/security penetration testing, backup/restore rehearsal, production deployment, live restaurant policy, receiving/stock and external providers are outside this sprint. Native GitHub protection is unavailable on the private repository's current plan; local hooks/CI are not equivalent enforcement. Parent backlog items remain partial as documented.

Next package: [SP2-01 handoff](../architecture/contracts/sprint-2-handoff.md), after SP1-06 integration.
