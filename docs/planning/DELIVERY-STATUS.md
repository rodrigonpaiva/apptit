# Delivery status and backlog traceability

<!-- Generated from delivery-status.json by node scripts/delivery-status.mjs --write. -->

As of **2026-11-19**; assessed integrated dev: `cb112eeb6775c6248e7422285f297102da871d38`. This is a dated execution snapshot, not a claim about the current branch head or running services.

## Reading this register

- Product scope and acceptance criteria remain in the original local specification, backlog and sprint plans. Their Proposed status describes the original forecast, not current execution.
- Integrated means the bounded child delivery reached dev with recorded evidence. It does not mean its parent story is Done, independently reviewed or ready for restaurant use.
- Partial means linked evidence covers a subset or contract; full parent acceptance/dependencies have not been signed off here. Not assessed means no delivery is mapped by this reconciliation, not proof that code is absent.
- All acceptance evidence below is historical. This documentation reconciliation does not rerun application tests or certify operational readiness.

Coverage: **173 original AP IDs**, **37 with partial evidence**, **136 not assessed**, **0 asserted Done**. Twelve sprint packages are integrated; twelve remain planned.

## Sprint package execution

| Package | Scope | Execution | Parents | Evidence / integration |
| --- | --- | --- | --- | --- |
| SP1-01 | Record first-slice architecture and access contracts | integrated | AP-011, AP-012, AP-009, AP-010 | [SP1-01](../delivery/SP1-01.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/5) |
| SP1-02 | Create reproducible workspace and CI skeleton | integrated | AP-013, AP-021, AP-150 | [SP1-02](../delivery/SP1-02.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/5) |
| SP1-03 | Implement quantity and versioned persistence primitives | integrated | AP-014, AP-015, AP-016, AP-019 | [SP1-03](../delivery/SP1-03.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/2) |
| SP1-04 | Authenticate and scope a synthetic site | integrated | AP-022, AP-023, AP-024, AP-025 | [SP1-04](../delivery/SP1-04.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/3) |
| SP1-05 | Show a private touch-friendly product list | integrated | AP-029, AP-145, AP-146 | [SP1-05](../delivery/SP1-05.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/4) |
| SP1-06 | Verify and demonstrate the executable foundation | integrated | AP-150, AP-024, AP-019 | [SP1-06](../delivery/SP1-06.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/5) |
| SP2-01 | Define receiving, stock-operation and evidence contracts | integrated | AP-017, AP-032, AP-034, AP-043, AP-020 | [SP2-01](../delivery/SP2-01.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/8) |
| SP2-02 | Identify products through OFF or reviewed local fallback | integrated | AP-030, AP-031, AP-033 | [SP2-02](../delivery/SP2-02.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/9) |
| SP2-03 | Capture receipt drafts by product and batch | integrated | AP-034, AP-032, AP-145, AP-146 | [SP2-03](../delivery/SP2-03.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/10) |
| SP2-04 | Capture private label photos and manual fallback fields | integrated | AP-020, AP-035, AP-128 | [SP2-04](../delivery/SP2-04.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/11) |
| SP2-05 | Record procedure-bound receiving observations in draft | integrated | AP-079, AP-080, AP-081, AP-086, AP-036, AP-025 | [SP2-05](../delivery/SP2-05.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/12) |
| SP2-06 | Preserve drafts under connection failure without false success | integrated | AP-131, AP-133, AP-134, AP-017, AP-150 | [SP2-06](../delivery/SP2-06.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/15) |
| SP3-01 | Implement the transactional batch ledger and operation outcomes | planned | AP-043, AP-017, AP-046, AP-018 | No implementation acceptance asserted |
| SP3-02 | Confirm partial receipts with required controls | planned | AP-036, AP-037, AP-039, AP-145 | No implementation acceptance asserted |
| SP3-03 | Keep problematic goods unavailable and capture chef review | planned | AP-038, AP-099, AP-025 | No implementation acceptance asserted |
| SP3-04 | Record synthetic opening balances and show batch quality | planned | AP-041, AP-042, AP-045, AP-047 | No implementation acceptance asserted |
| SP3-05 | Transfer a bag while preserving site total | planned | AP-044, AP-046, AP-019 | No implementation acceptance asserted |
| SP3-06 | Demonstrate receipt-to-stock invariants and recovery | planned | AP-151, AP-150, AP-024 | No implementation acceptance asserted |
| SP4-01 | Define recipe drafts, generic ingredients and source mapping | planned | AP-052, AP-053, AP-148 | No implementation acceptance asserted |
| SP4-02 | Import one standardized Excel fixture as a draft | planned | AP-003, AP-051 | No implementation acceptance asserted |
| SP4-03 | Implement gross/net references and qualitative quantities | planned | AP-054, AP-055, AP-062 | No implementation acceptance asserted |
| SP4-04 | Review draft changes without false recipe validation | planned | AP-056, AP-058, AP-057, AP-019 | No implementation acceptance asserted |
| SP4-05 | Calculate explainable capacity for fully covered flat drafts | planned | AP-062, AP-063, AP-045 | No implementation acceptance asserted |
| SP4-06 | Simulate a weekly menu and explain shortages | planned | AP-064, AP-065, AP-066, AP-145, AP-151 | No implementation acceptance asserted |

## Post-Sprint-2 extensions

These retrospective parent links identify affected scope; they do not expand the approved story or close its remaining criteria.

| Delivery | Parents | Evidence / integration |
| --- | --- | --- |
| Local published-release Compose | AP-013, AP-021, AP-150 | [LOCAL-ALPHA2-COMPOSE](../delivery/LOCAL-ALPHA2-COMPOSE.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/24) |
| Explicit read-only live OFF lookup | AP-030, AP-033 | [LOCAL-ALPHA2-OFF-LIVE](../delivery/LOCAL-ALPHA2-OFF-LIVE.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/25) |
| Local label OCR with human review | AP-128, AP-035, AP-020 | [AP-128](../delivery/AP-128.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/26) |
| Reference photos and physical destinations | AP-030, AP-031, AP-041, AP-145, AP-146 | [RECEIVING-PHOTOS-STORAGE](../delivery/RECEIVING-PHOTOS-STORAGE.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/27) |
| Chef location removal and management layout | AP-041, AP-019, AP-024, AP-145, AP-146 | [STORAGE-DELETE-LAYOUT](../delivery/STORAGE-DELETE-LAYOUT.md); [PR](https://github.com/rodrigonpaiva/apptit/pull/28) |

## Parent stories with partial evidence

The machine-readable register contains all 173 IDs, including every not-assessed entry. This table shows only parents with linked delivered work. The remaining column is an acceptance boundary, not a new product requirement.

| Parent | Delivered children | Still open / acceptance boundary |
| --- | --- | --- |
| AP-009 | SP1-01 | Only provisional synthetic unknown/deficit assumptions; actual-site eligibility and discrepancy policy is unresolved. |
| AP-010 | SP1-01 | Only provisional private-evidence/session boundaries; retention, holds and device-loss policy remain unresolved. |
| AP-011 | SP1-01 | First-slice topology is adopted; full deployment/integration architecture remains outside delivered scope. |
| AP-012 | SP1-01 | First-slice adapter/access decisions exist; actual devices and remaining provider choices are not qualified. |
| AP-013 | SP1-02, EXT-LOCAL-COMPOSE | Workspace/local runtime evidence is linked; record an explicit full parent AC/dependency acceptance before Done. No extra platform estate is required by this note. |
| AP-014 | SP1-03 | Exact quantity/date primitives exist; all later aggregates/conversions remain to be verified. |
| AP-015 | SP1-03 | Draft/version persistence exists; transactional stock and other domain aggregates are not implemented. |
| AP-016 | SP1-03 | Enabled HTTP/contracts exist; all future domain/error/event contracts remain open. |
| AP-017 | SP2-01, SP2-06 | Draft-save operation recovery exists; stock command outcomes, terminal rejection and contention require SP3-01. |
| AP-019 | SP1-03, SP1-06, EXT-STORAGE-DELETE-LAYOUT | Enabled changes preserve actor/version/history; ledger and later domain audits remain open. |
| AP-020 | SP2-01, SP2-04, EXT-LABEL-OCR | Private receipt originals exist; complete retention, holds, export, restore and evidence categories remain open. |
| AP-021 | SP1-02, EXT-LOCAL-COMPOSE | Configuration/secret safeguards have evidence; reconcile all original parent checks and dependencies before recording full acceptance. |
| AP-022 | SP1-04 | Synthetic memberships exist; organization/site administration, operating calendars and explicit holidays/closures remain open. |
| AP-023 | SP1-04 | Online authentication/revocation has evidence; record full original AC/dependency acceptance separately. Offline capabilities belong to their own stories. |
| AP-024 | SP1-04, SP1-06, EXT-STORAGE-DELETE-LAYOUT | Enabled routes/files are scoped; future modules/jobs and full capability administration remain open. |
| AP-025 | SP1-04, SP2-05 | Minimal fixture capabilities exist; disposition, director substitution and full grants/revocations are not implemented. |
| AP-029 | SP1-05 | Scoped reference catalogue exists; full reviewed product/presentation master and lifecycle remain open. |
| AP-030 | SP2-02, EXT-OFF-LIVE, EXT-RECEIVING-PHOTOS-STORAGE | Protected fixture/live lookup has evidence; original parent acceptance and dependency review have not been recorded as complete. |
| AP-031 | SP2-02, EXT-RECEIVING-PHOTOS-STORAGE | Reference candidates/manual snapshots exist; reviewed persistent master identity must precede stock confirmation. |
| AP-032 | SP2-01, SP2-03 | Checked draft pack previews exist; all conversion/version/use cases remain open. |
| AP-033 | SP2-02, EXT-OFF-LIVE | OFF source attribution/live read policy exists; external-change differences and wider source selection/update review remain open. |
| AP-034 | SP2-01, SP2-03 | Receipt drafts persist; accepted-stock confirmation and full receiving workflow await Sprint 3. |
| AP-035 | SP2-04, EXT-LABEL-OCR | Private photos and optional reviewed local OCR exist; full evidence/field workflow and operational evaluation remain open. |
| AP-036 | SP2-05 | Versioned synthetic observations exist; real PMS profiles and effectful receipt checks remain open. |
| AP-041 | EXT-RECEIVING-PHOTOS-STORAGE, EXT-STORAGE-DELETE-LAYOUT | Named categorized physical destinations and logical removal exist; reserve/kitchen balances and movement semantics remain open. |
| AP-043 | SP2-01 | Future ledger contracts exist; no persisted ledger/balance projection is implemented. |
| AP-079 | SP2-05 | Synthetic receiving-profile subset exists; full applicable PMS catalogue and actual-site qualification remain open. |
| AP-080 | SP2-05 | Synthetic receiving-control subset exists; remaining control workflows and local validation remain open. |
| AP-081 | SP2-05 | Actual synthetic receiving observations exist; complete applicable control coverage remains open. |
| AP-086 | SP2-05 | Receiving observation subset is verified; assess original AC/dependencies across applicable contexts before full parent acceptance. |
| AP-128 | SP2-04, EXT-LABEL-OCR | Local OCR, explicit review and synthetic evaluation exist; full parent acceptance/independent and real-label/device evaluation are not recorded. |
| AP-131 | SP2-06 | Online failure states exist; durable isolated offline preloading/capture remains disabled. |
| AP-133 | SP2-06 | Server operation recovery exists; durable offline queues, retries and full conflict coverage remain open. |
| AP-134 | SP2-06 | Session/scope clearing exists; complete offline ownership, late-event and recovery policy remains open. |
| AP-145 | SP1-05, SP2-03, EXT-RECEIVING-PHOTOS-STORAGE, EXT-STORAGE-DELETE-LAYOUT | Enabled receiving/catalogue/storage journeys exist; remaining product journeys are not implemented. |
| AP-146 | SP1-05, SP2-03, EXT-RECEIVING-PHOTOS-STORAGE, EXT-STORAGE-DELETE-LAYOUT | Enabled screens have responsive/error states; complete device/accessibility review remains open. |
| AP-150 | SP1-02, SP1-06, SP2-06, EXT-LOCAL-COMPOSE | Focused enabled-slice verification and CI exist; full product/operations/real-device verification remains open. |

## Next planned package

**SP3-01** — Implement the transactional batch ledger and operation outcomes. Integrated prerequisites: SP2-01, SP1-03, SP2-06. Planning readiness is not permission to enable stock effects; refine the ledger/operation boundary and its negative/concurrent cases before implementation.

No Sprint 3 or Sprint 4 package is marked implemented. See [maintenance, release distinctions and open reconciliation](README.md).
