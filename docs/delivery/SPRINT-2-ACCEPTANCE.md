# Sprint 2 — Technical acceptance record

Date: 2026-11-13 (Europe/Paris).
Result: **PASS for the implemented online synthetic Sprint 2 scope.** This is technical acceptance of SP2-01–SP2-06 under the sprint's explicit boundaries, not production readiness, full parent-backlog completion, independent security approval or real food-safety validation.

## Validated source and integration

Validated application/packaging commit: `3880beeda643010d8a7156173290040656393c44` (SP2-06). The complete canonical check passed on this source: 54 tests, zero failures, Prisma schemas, lint/module boundaries, seven-project types, contract compilation and production builds. Earlier PostgreSQL/HTTP/browser evidence matches all 110 application/service/package SHA-256 entries. No runtime change occurred between that evidence and this committed source.

Implementation PRs #8–#13 integrated SP2-01–SP2-05 and GHCR packaging. PR #14 corrected runner-local paths before release activation. PR #15 integrates SP2-06 and the bounded build CLI --repository correction. Required current CI status and exact merge commit are recorded below after completion. No branch checks or protections are bypassed.

## Acceptance criteria

| Package | Criteria and actual evidence |
| --- | --- |
| SP2-01 AC1–AC3 | Separate product/presentation/batch/line identities, checked exact unit/pack conversion, explicit unknowns and receipt/disposition reconciliation contracts. Domain tests and compile-only contracts pass. Future stock posting/ledger/outbox ports are contracts, not implemented stock effects. [Delivery](SP2-01.md). |
| SP2-02 AC1–AC3 | Authenticated typed/scanned lookup with explicit found/absent/incomplete/unavailable states and source/synthetic/review metadata. Missing allergens/nutrition remain unknown; no quantity/batch is inferred. Manual fallback and private scope are checked; deterministic fixture is the guaranteed source. [Delivery](SP2-02.md), inherited unit/HTTP/browser checks. |
| SP2-03 AC1–AC3 | Repeated scan never counts goods; explicit distinct batch lines, exact ten-by-five-kg preview, scoped durable draft save/reload with versions and original actor, no stock/reservation. PostgreSQL races/replay/rollback and browser two-batch save/reload pass. [Delivery](SP2-03.md). |
| SP2-04 AC1–AC3 | Private original bytes with immutable author/time/receipt/product/batch links; no-photo/pending/failed/unreadable/available distinct. Controlled upload failure does not announce availability, same upload recovers without duplication, authorized reload/read and foreign denial pass. OCR stays disabled. [Delivery](SP2-04.md). |
| SP2-05 AC1–AC3 | Explicit synthetic profile/rule version, real entered values, observed/recorded times separated, missing and justified NA states, preserved corrections and within-illustration/deviation/inconclusive assessment. Server owns assessment; capture never grants disposition or stock authority. PostgreSQL/HTTP/browser scenarios pass. [Delivery](SP2-05.md). |
| SP2-06 AC1–AC3 | Exact original actor/site/operation recovery confirms only committed save; absent result/timeout remains unconfirmed. Same ID retries once. Online deadlines and denied-context clearing pass. Local capture is explicitly disabled, including when storage writes fail. No unsafe local queue, ownership transfer or false saved-local claim. [Delivery](SP2-06.md). |

## Combined execution evidence

- Root `npm run check`: **54 tests passed / zero failures** with all schema/lint/type/contract/build checks. [Resumed output](evidence/sp2-06/check-resumed.log).
- Real PostgreSQL integration: **41 passed / zero skipped** (37 Kitchen/adapter groups and four Identity groups), including populated migration preservation, audit/outcome rollback, concurrency/idempotency, original actor/site operation lookup, photo integrity and original observation rule/history. [Output](evidence/sp2-06/integration.log).
- HTTP smoke: passed same-origin/CSRF/session/site/capability/foreign/service-only rejection, receipts, private photo and observation flows, operation recovery and degraded dependency readiness. [Output](evidence/sp2-06/smoke.log).
- Chromium vertical review: **12 scenarios passed**, typed OFF fixture → two distinct batch/quantity lines → failed/recovered private label photo → actual illustrative reading with pending condition → save/reload → lost response and real client timeout → unchanged operation retry/status → offline/expired-context lock → different user/site receives no private memory. Every Storage.setItem was forced to throw; no local durability claim occurred. Widths **320/375/768/1024/1440** had no horizontal overflow or page errors. [Result](evidence/sp2-06/browser.json), [screenshots and source hashes](SP2-06.md). This reuses exact-source evidence, not a new device/independent approval assertion.
- Clean committed container builds and initialization on 2026-11-13: both API/web built from the validated SHA with sourceDirty=false, OCI source/version/revision labels, nonroot user and no host .env/Git/local artifacts. Disposable PostgreSQL migrations and repeated seed, separate Identity/Kitchen/gateway/web roles, API readiness and web 200 passed. Receipt stayed draft, SP2-05 observations stayed pending with not_activated disposition, synthetic stock flag stayed false and inventory counts stayed unchanged. Stopping only the owned Identity container caused expected 503/unavailable behavior. No host ports were published; owned containers/anonymous volume/env files removed. [Build](evidence/sprint-2/images.json), [initialization](evidence/sprint-2/validation.json).

The local container platform is Linux ARM64. Local image configuration IDs are not GHCR manifest digests. The publication runner must independently build/validate both exact-release images before any push. No live OFF dependency, restaurant data, real operational thresholds, external messaging, stock transaction or production target was needed.

## Boundaries and release handoff

The supported online synthetic sprint exit criteria are met: private draft/evidence retrieval, separate actual batch/quantity identity, explicit control gaps, no stock effect and no false save under connection/storage failure. Full AP-017/AP-020/AP-030–AP-035/AP-079–AP-086/AP-128/AP-130–AP-138 and related parents remain partial according to their original backlog criteria. Device policy/local encrypted queues/recovery, full PMS/G-PMS, sensors/OCR, accepted-stock entry and production readiness are not granted by this record. No independent reviewer approval is claimed.

The machine-readable acceptance file references the exact validated source commit. The publisher requires that commit to be an ancestor of the release tag and rejects application/service/package drift. Integrate acceptance through dev PR/CI, wait for exact-head dev push CI, then promote this repository's dev into main by a reviewed regular merge-commit PR with passing checks. Only then publish alpha.2 and let the GHCR release job verify both images, private package visibility and registry digests. Alpha.1 retains its original commit; absent application Dockerfiles there remain a historical publication blocker.

## Completed implementation integration

[SP2-06 PR #15](https://github.com/rodrigonpaiva/apptit/pull/15) passed both required checks in [CI run 43414201464](https://github.com/rodrigonpaiva/apptit/actions/runs/43414201464) and merged into dev as `62b0a762509de5cf92dcb812ed235b528005b069`. This documentation-only acceptance branch starts at that integrated dev commit. Validated source `3880beeda643010d8a7156173290040656393c44` is an ancestor; apps/services/packages have no difference from it. The checked-in JSON reports retain actual outcomes while removing the machine-local absolute source path. The report image IDs are local configuration identifiers, not registry digests.

Task/integration owner: root; reviewer: author verification, no independent approval. Owned scope: acceptance record/manifest/reports, delivery status and README discovery links; no runtime, dependency, migration or business-policy change. Checks: exact-source comparison, actual report consistency, JSON gate contract, documentation links and required PR/CI. Next owner: coordinator promotes only after exact dev push CI and promotion PR checks, then publishes the corresponding alpha.2 release and verifies both private registry digests. Current alpha.1 is preserved.
