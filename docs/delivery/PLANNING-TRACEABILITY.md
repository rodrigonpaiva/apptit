# Planning execution traceability reconciliation

Date: 2026-11-19 (Europe/Paris). Task: close finding 5 from the repository resumption review. Owner: repository integration owner/coding agent. Independent reviewer: unassigned; no independent approval claimed. Branch: `docs/delivery-planning-traceability`, base dev `cb112eeb6775c6248e7422285f297102da871d38`.

## Scope and criteria

Reconcile original local specification v0.80, backlog v1.0 and first-four-sprints v1.0 with delivery records and actual merged PRs. Preserve all 173 AP IDs and original product rules; distinguish integrated child scope, partial parent evidence, not-assessed work, synthetic acceptance, review and release/runtime state. Update stale present-tense README/OCR/status navigation while retaining historical results. Make the register maintainable and checked in CI without requiring excluded local plans. Do not implement Sprint 3, change application behavior, migrate data, start containers or publish images.

Owned files: `docs/planning/`, README/architecture navigation, dated notices in the original SP/acceptance/extension reports, `scripts/delivery-status.mjs` and its CI step. No application, database, dependency, lockfile, tag or original `plans/` file changes. Original next-env/VScode edits in the separate checkout remain untouched.

## Delivered

- One JSON execution register and deterministically rendered Markdown matrix cover all 173 AP IDs, 24 SP packages and five post-Sprint-2 extensions. Twelve SP packages and the extensions are integrated; twelve remain planned. Thirty-seven parents have partial evidence; 136 remain not assessed. No full AP completion or MVP percentage is asserted.
- Links connect bounded delivered scope to original parents, evidence paths, merge PRs/commits, remaining boundaries and review status. Source fingerprints identify the original local planning edition. The register does not replace the source backlog, and mappings do not authorize expanded scope.
- README now describes opt-in local OCR and physical destinations, points to execution tracking, and distinguishes published alpha.2 from a retained local preview. Dated notices explain superseded pending steps without changing historical test results.
- The maintenance guide explains owner duties, source changes, honest status transitions, release/runtime distinctions and the next package SP3-01. Existing independent-review/restaurant/PMS/device/offline/restore gaps are kept open.

## Executed checks

- `node scripts/delivery-status.mjs --write` and `--check`: passed 173-ID coverage, 24-package coverage, reciprocal AP/child mapping, evidence existence, next-package dependency checks, deterministic rendering and four available source fingerprints.
- The same checker ran in an isolated temporary layout with no `plans/`: passed with zero source files available, as required for a fresh CI checkout. It does not silently claim the missing sources were inspected.
- Temporary negative probes: missing AP ID, broken reciprocal mapping, stale generated Markdown and missing evidence each returned failure as expected. Probes did not mutate the repository register.
- `npm run lint`: passed all project/tooling checks; Nx cache reuse remains reported.
- `node --test tests/branch-policy.test.mjs tests/container-publication.test.mjs`: 25 passed, zero failed/skipped.
- `git diff --check`: passed. Original planning source fingerprints still match. Merged PRs #1–#28 and dev head/CI were inspected through read-only GitHub queries.

Application/database/browser tests were not rerun locally for this documentation/tooling slice; Docker was unavailable and no local startup was attempted. Historical application results remain linked to their tested sources. Required PR CI runs independently in its own synthetic environment; it must pass before merge. This task does not close the other five findings or claim independent review.
