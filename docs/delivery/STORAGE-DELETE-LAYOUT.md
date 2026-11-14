# Storage deletion and management layout

Task: user-requested chef storage deletion and professional management layout. Owner: coding agent; independent review pending. Branch: `feature/storage-delete-layout`, base `ea212a5`. Dependencies: receiving photo/physical storage PR #27 integrated into dev.

Scope: chef-only logical removal of a physical location, excluding it from configuration/new receipt choices while preserving historical destination snapshots and location revisions. Same tenant/site/capability and expected-version checks as management. Serialization uses the existing storage lock; retries of the same deletion return the original ID without duplicating history. No stock operation, hard deletion, new role, temperature rule or receipt-finalization feature is introduced.

Owned surfaces: storage contracts/controller/application, additive `202611140002_storage_location_deletion` migration, receiving active-location filters, French messages and storage management UI/CSS, integration/browser tests and this evidence.

Acceptance: chef confirms or cancels removal; storekeeper/foreign scope denied; stale versions rejected; historical receipts remain readable; deleted rooms cannot be reactivated or selected. UI groups category cards, separates the editor, displays actual counts and status, maintains keyboard focus and reflows at five widths.

Checks and evidence: pending final execution. Synthetic isolated PostgreSQL and localhost services only; the running user containers are preserved until integration.

## Executed results

`npm run check` passed Prisma validation, Nx lint/typecheck/build and 81 root tests. `npm run test:integration` passed 43 Kitchen plus four Identity tests against isolated real PostgreSQL. `npm run lint` rechecked the final test scripts. Populated migration upgrade passed, including unchanged historical receipt JSON and the database inactive-on-delete constraint. Twelve browser scenarios passed with no page errors, including actual confirmation/cancellation, focus return, historical destination retention, direct storekeeper API denial and reflow at 320/375/768/1024/1440 px. Screenshots were inspected visually. Camera inputs/provider photos remain controlled synthetic fixtures as documented by the original receiving delivery.

Evidence: updated `evidence/receiving-photos-storage/browser.json`, `upgrade.json`, `storage-populated.png` and empty configuration screenshot. A keyboard-focus issue found by the browser test was corrected before its successful rerun. Migration was applied only to the isolated synthetic test database during verification. No hard deletion of locations, receipt snapshots or revisions occurs. Independent review has not been performed.

Final `npm run smoke`: passed application startup, scoped authenticated flows, private evidence and degraded readiness (exit 0).
