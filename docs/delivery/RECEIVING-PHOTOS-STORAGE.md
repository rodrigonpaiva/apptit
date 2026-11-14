# Receiving product reference photos and physical storage locations

Status: implemented; local verification passed. Owner: coding agent. Independent review not performed. Branch `feature/receiving-product-photo-storage`, based on updated dev after AP-128.

Scope: reuse protected product lookup and public reference photos, prefer scoped catalogue photos, prevent stale scanner responses, add chef-only site-scoped configuration of fixed storage categories, persist physical destination per receipt line and retain historical information. Informative temperature copy comes from the explicit user brief; no PMS rules/thresholds/stock activation are introduced.

Repository discovery: current receipt persistence is draft-only; no finalization endpoint exists. Finalized-receipt compatibility can only be checked with a clearly identified stored historical fixture, not a claimed real finalization flow. No translation framework/message catalogue or storage configuration UI existed. New French copy is centralized in a typed `i18n/fr.ts` message catalogue without unrelated app-wide translation work.

Owned surfaces: shared catalogue/location contracts and capabilities; Kitchen additive migration, scoped locations and receipt validation/snapshots; Gateway lookup/management transport; receiving/reference-photo/configuration UI and new messages; seed fixtures and meaningful regression/browser tests. Preserve local environment/credentials and previous uncommitted work in the original checkout.

Planned checks: Nx lint/types/build for affected consumers, real PostgreSQL empty/upgrade migration, fixed categories and access/revocation/scope/inactive/race checks, actual scanner/photo fallback/stale-response browser flows, multiple instances/save/reopen, empty site and legacy read-only readability. Record actual results and blockers below.

## Executed verification

- `npm run check`: passed Prisma schema validation, Nx lint/typecheck/build across all seven projects, contract checks and 81 root tests.
- `npm run test:integration`: passed 42 Kitchen and four Identity tests against isolated synthetic PostgreSQL, including category constraints, permissions, tenant/site isolation, stale versions, immutable history, inactive destinations and concurrent deactivation.
- `node tests/database/storage-upgrade.mjs apptit-storage-eval-postgres-1`: passed populated pre-migration upgrade; original location/name/category and historical receipt JSON preserved. The script creates and drops only its own temporary database. See `evidence/receiving-photos-storage/upgrade.json`.
- `node tests/browser/receiving-storage.mjs /tmp/apptit-storage-browser/node_modules/playwright/index.mjs`: passed eleven real application scenarios, with no page errors and reflow checks at 320, 375, 768, 1024 and 1440 px. See `browser.json` and configuration screenshot. Canvas-generated EAN frames pass through the real ZXing camera decoder; physical camera hardware was not tested. Public provider image responses are controlled deterministic fixtures, not a claim of live OFF availability. Protected lookup and persistence use the actual services/database.

Migration: additive `202611140001_storage_locations`, including nullable catalogue photo, nullable legacy category, location activity/version and immutable location revisions. Existing synthetic catalogue/location seeds preserve existing records and use distinct new physical-location IDs. No production or running alpha.2 database was migrated.

Compatibility limit: the current application still has no receipt-finalization endpoint. The browser and integration tests reopen an explicitly synthetic stored finalized fixture read-only with its original destination; a real finalize/reopen workflow was not executed. Draft saves remain draft-only and introduce no stock movement. Independent review has not been performed. Published alpha.2 images are unchanged.

- Final `npm run smoke`: passed actual service startup, authenticated scoped reads/writes, CSRF, receipt/evidence behavior and degraded readiness. Log contained the smoke PASS summary; exit status 0.
