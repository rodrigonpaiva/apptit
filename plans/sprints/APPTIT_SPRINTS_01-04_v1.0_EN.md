# Apptit — First Four Sprint Plans

**Plan version:** 1.0  
**Date:** 4 November 2026 (Europe/Paris)  
**Language:** English, consistent with the specification/backlog deliverables.  
**Baseline:** specification v 0.80 and delivery backlog v 1.0 (AP-001–AP-173).  
**Status:** Proposed sprint forecast; no implementation, test pass, external ticket, deployment or restaurant authorization is implied.

## 1. Planning assumptions

Use **four two-week timeboxes** as a planning proposal, with no calendar start date. Actual engineering availability, team size and velocity have not been provided. The 24 bounded work packages below are a **candidate scope**, not a validated eight-week delivery commitment or four-sprint promise to finish the MVP.

At sprint planning, confirm actual engineering availability, estimate the selected small packages with the team and retain only work that fits. A proposed capacity rule is to plan up to 75% of confirmed available time and retain 25% for integration, defects, review and unknowns; these are planning buffers, not measured team productivity. Do not invent story points or effort estimates before refinement. With part-time availability, take fewer packages or extend the overall calendar; do not reinterpret the restaurant's Monday–Friday hours as developer capacity.

Assumed responsibilities, without named staffing commitments:

| Role | Responsibility |
| --- | --- |
| Product owner — Rodrigo Paiva | Maintain scope/acceptance decisions; arrange permitted operational examples and feedback |
| Engineering owner — unassigned | Resolve ADRs, implement/refine work, integrate and provide actual verification evidence |
| Restaurant decision-maker — not yet designated | Authorize real use/data and name accountable operating participants |
| Chef/storekeeper/food safety lead — to confirm | Qualify files, operations, applicable PMS and meaningful operator review |

Develop and demonstrate with **clearly synthetic data by default**. Restaurant permission, actual PMS validation, real source files and supported-device confirmation are required at their relevant live activation, not for reversible local development. Development fixtures are never marked as real food safety records.

### Sprint versus backlog stage

Sprint 1–4 are timeboxes. Backlog stages S0–S5 are broader delivery milestones and **do not map one-to-one to sprint numbers**. These four sprints build the foundation, a receiving/inventory slice and a planning simulation. They do not complete all S1 items, all S2 planning features, or the full MVP. Approved AI assistance and forecasting remain required in the later MVP backlog.

## 2. Four-sprint overview

| Sprint | Goal | Reviewable increment | Core candidate packages |
| --- | --- | --- | --- |
| 1 | Executable foundation with scoped individual access | Sign in and open a private synthetic-site product list; cross-site access is denied | SP1-01–SP1-06 |
| 2 | Traceable receiving drafts | Identify product, enter quantity/batch, save label and actual observations; no stock entry | SP2-01–SP2-06 |
| 3 | Accepted receipt to stock and safe transfer | Partial acceptance posts once; blocked quantity stays unavailable; reserve-to-kitchen transfer preserves total | SP3-01–SP3-06 |
| 4 | Recipe drafts and stock-based planning simulation | Import one Excel template, display gross/net references, simulate shared-ingredient capacity and shortages | SP4-01–SP4-06 |

Each sprint must finish with a visible vertical demonstration and meaningful relevant checks, not a list of disconnected technical components. No automatic business operation is hidden behind a draft save or scan.

## 3. How sprint packages relate to backlog stories

`SPn-xx` identifies a bounded child work package created for this plan. `AP-nnn` remains the original backlog story. A package typically implements **only a subset** of its parents. Completing SP2-04, for example, does not mark AP-035 complete when assisted field extraction/evaluation or other acceptance conditions remain open.

The source backlog dependencies remain intact. This plan records which prerequisite **contracts or supported subcases** are delivered early, and blocks unsupported runtime paths. It does not silently waive incomplete parent prerequisites. A first private read endpoint can be implemented before every possible access-controlled module exists; complete AP-024 still requires isolation everywhere once those modules exist.

For each parent, use a progress checklist linked to the SP package. Keep the parent open until **all** its original acceptance criteria and dependencies are satisfied. Parent status changes are not part of this document. A rejected or unsupported case is a visible limited capability, not a completed full feature.

Core sprint dependencies are listed per package and contain no later-sprint references. Some packages can proceed independently after their common prerequisite is ready, but no assumed parallel staffing or autonomous delegation is required.

## 4. Sprint plans

### Sprint 1 — Executable foundation and scoped access

**Timebox:** Two weeks, proposed; no dates or effort commitment.

**Sprint goal:** Demonstrate a signed-in individual opening a private product list in the correct synthetic restaurant.

**Entry:** Specification/backlog baseline available; engineering can record first-slice ADRs and use synthetic fixtures. No restaurant permission required for synthetic local work.

**Suggested sequence:** First agree slice contracts, then scaffold and primitive persistence, then access and visible list; finish with the complete vertical demonstration.

#### SP1-01 — Record first-slice architecture and access contracts

**Deliverable:** A small ADR set sufficient for a synthetic authenticated receiving/inventory slice.

**Backlog parents:** AP-011, AP-012, AP-009, AP-010.  
**Prerequisite packages:** Baseline available; no prior sprint package.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Record initial service/module boundaries, database authority, transaction strategy and API/event responsibility while preserving the NestJS/GraphQL and microservices direction.
- AC2: Specify quantity precision/date rules, session identity/revocation and local-draft ownership; unresolved real-site policy is explicitly provisional.
- AC3: Classify adapters as selected, evaluation-only or disabled; define how missing configuration fails and how manual operations remain available.

**Implementation sequence**

1. Compare initial service granularity and document data ownership.
2. Define typed API/error/operation contracts and synthetic assumptions.
3. Document access, evidence and offline boundaries without selecting undocumented live providers.

**Parent completion boundary:** Partial AP-011/AP-012/AP-009/AP-010. Final local device, retention, PMS and actual integration choices remain open; no runtime infrastructure or provider is activated by an ADR.

#### SP1-02 — Create reproducible workspace and CI skeleton

**Deliverable:** A runnable local workspace with an application shell, API and required synthetic dependencies.

**Backlog parents:** AP-013, AP-021, AP-150.  
**Prerequisite packages:** SP1-01.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Document a fresh-checkout local start and build/type/lint verification path using the selected workspace tool.
- AC2: Development uses explicit synthetic identities/data and no embedded real credentials or silent live-provider selection.
- AC3: CI records real outcomes and fails visibly; no previous implementation or passed tests are assumed.

**Implementation sequence**

1. Initialize selected monorepo apps/packages and local service configuration.
2. Add validated environment examples and secret redaction.
3. Add basic CI build/type/contract verification.

**Parent completion boundary:** Partial platform/CI scope. No full cloud deployment, complete broker infrastructure, all microservices or full end-to-end suite is promised in this sprint.

#### SP1-03 — Implement quantity and versioned persistence primitives

**Deliverable:** Shared value types and a minimal persisted aggregate with attributable versions.

**Backlog parents:** AP-014, AP-015, AP-016, AP-019.  
**Prerequisite packages:** SP1-01, SP1-02.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Quantity includes unit/basis/precision; expiry date differs from timestamp and unknown differs from zero.
- AC2: Persisted changes identify authenticated user, name at action time, site and version; stale write returns a conflict.
- AC3: Data ownership and migrations/schema evolution are reproducible and API validation returns recoverable errors.

**Implementation sequence**

1. Implement quantity/date/data-quality contracts and repository port.
2. Implement chosen persistence adapter and version checks.
3. Verify representative round-trip, invalid unit and concurrent-update cases.

**Parent completion boundary:** Partial AP-014–AP-019. This establishes contracts for later ledger/evidence workflows; it does not claim every conversion, aggregate, event or audit screen is implemented.

#### SP1-04 — Authenticate and scope a synthetic site

**Deliverable:** Individual access to one synthetic restaurant, with another site available for denial tests.

**Backlog parents:** AP-022, AP-023, AP-024, AP-025.  
**Prerequisite packages:** SP1-01, SP1-02, SP1-03.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Sign-in uses the selected session design and shows actual user and selected authorized site.
- AC2: Server rejects a changed site/tenant identifier and revoked session; hiding UI alone is insufficient.
- AC3: Chef/storekeeper/cook roles expose only the minimal explicit test capabilities and no shared kitchen account.

**Implementation sequence**

1. Implement minimal site membership and session lifecycle.
2. Protect first API/query and application route.
3. Verify cross-site access, expiry and revocation failures.

**Parent completion boundary:** Partial access capability. Complete organizational administration, director activation workflow, full capability matrix, per-product grants and offline identity policy are not marked complete.

#### SP1-05 — Show a private touch-friendly product list

**Deliverable:** A small visible vertical slice: sign in, choose the synthetic site, open its product list.

**Backlog parents:** AP-029, AP-145, AP-146.  
**Prerequisite packages:** SP1-03, SP1-04.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Seeded product reference/presentation is distinct from an actual received batch; barcode is textual.
- AC2: Screen shows user/site and legible empty/loading/error states on phone/tablet layouts.
- AC3: A user from another site cannot read the products; manual navigation works without camera permission.

**Implementation sequence**

1. Create minimal scoped catalogue read model and fixtures.
2. Implement navigation shell, product list and basic shared form/status components.
3. Check actual browser layouts at target small/tablet widths.

**Parent completion boundary:** Only the needed T01/T03 navigation and catalogue read contract. Other screens and full design-system/accessibility coverage remain pending; this list does not imply stock exists.

#### SP1-06 — Verify and demonstrate the executable foundation

**Deliverable:** A repeatable synthetic demonstration and documented verification evidence.

**Backlog parents:** AP-150, AP-024, AP-019.  
**Prerequisite packages:** SP1-02, SP1-03, SP1-04, SP1-05.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Fresh local start, authenticated scoped list and authorization-denial scenario can be repeated from instructions.
- AC2: Relevant build/type/rule checks actually run and outcomes are recorded; failures remain open.
- AC3: Demo cannot create stock, claim restaurant authorization or depend on a live external integration.

**Implementation sequence**

1. Run first-slice smoke and negative authorization checks.
2. Record developer setup and known limitations.
3. Review next-sprint contracts against actual implementation.

**Parent completion boundary:** Slice verification only. No product-wide QA, load result, restore drill or real restaurant test is asserted.

**Sprint review demonstration:** Start local environment → sign in as user A → open site A product list → attempt site B → denied → revoke session → next protected request denied.

**Exit criteria:** Reproducible start, implemented minimal authenticated flow, attributable versioned persistence and recorded first-slice verification. No critical isolation or secret/configuration defect remains in enabled paths.

**Explicitly outside this timebox:** Receiving confirmation, ledger balances, live site onboarding, external production providers, product permissions, AI, production deployment.

**Primary risk and response:** Unresolved architecture/session choices can consume the sprint. Resolve the minimum safe contract early; keep unsupported integrations disabled.

**Handoff:** SP2-01 must be able to rely on actual identity, site authorization, typed quantities and persisted version contracts.

### Sprint 2 — Traceable receiving drafts

**Timebox:** Two weeks, proposed; no dates or effort commitment.

**Sprint goal:** Demonstrate barcode/reference identification, entered batch quantity, label evidence and actual control observations in a saved draft, without stock creation.

**Entry:** Sprint 1 enabled-path exit criteria met; receipt/evidence/quantity contracts reviewed. Real files/PMS may still be unknown and must be labelled synthetic.

**Suggested sequence:** Start from receipt/evidence contracts; add identification and draft form; add evidence and procedure-bound observations; integrate durability and failure states.

#### SP2-01 — Define receiving, stock-operation and evidence contracts

**Deliverable:** A reviewed draft receipt model and immutable future entry contract.

**Backlog parents:** AP-017, AP-032, AP-034, AP-043, AP-020.  
**Prerequisite packages:** SP1-03, SP1-04, SP1-06.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Product, presentation, received batch/date and receipt line have separate identities.
- AC2: Operation ID, payload mismatch, version conflict and uncertain-outcome lookup are defined before stock posting.
- AC3: Received quantity and accepted/rejected/quarantined/pending amounts reconcile in one compatible unit; nominal pack is not total delivered.

**Implementation sequence**

1. Define receipt and ledger-entry states/ports with sample payloads.
2. Implement checked pack/unit conversion contract.
3. Define evidence object ownership and metadata fields.

**Parent completion boundary:** Contract plus draft validation. Stock transaction and full evidence lifecycle are not complete until later implemented/tested slices; no parent dependency is silently waived.

#### SP2-02 — Identify products through OFF or reviewed local fallback

**Deliverable:** A barcode/typed-code lookup that pre-fills available reference attributes and preserves source state.

**Backlog parents:** AP-030, AP-031, AP-033.  
**Prerequisite packages:** SP2-01, SP1-05.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Found, absent, incomplete and unavailable lookup states are distinct and fields retain source/freshness/review state.
- AC2: Missing allergens/nutrition stay unknown; barcode and external attributes never supply assumed actual batch/date.
- AC3: Manual local/label identification remains possible; private restaurant information is not published to OFF.

**Implementation sequence**

1. Implement typed adapter and deterministic recorded fixtures.
2. Build scan/typed-code plus physical-match interface.
3. Document applicable licensing/cache/attribution requirements before any live read-only lookup.

**Parent completion boundary:** Recorded fixtures are the guaranteed development dependency. Live OFF read-only access may be used only after ordinary integration validation; no supplier or public contribution is involved. Full external update workflows remain open.

#### SP2-03 — Capture receipt drafts by product and batch

**Deliverable:** A short receiving draft form with quantity, actual batch/date and storage destination.

**Backlog parents:** AP-034, AP-032, AP-145, AP-146.  
**Prerequisite packages:** SP2-01, SP2-02.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: One scan identifies a product and operator enters quantity; repeat scan never silently increments units.
- AC2: Same barcode with two actual batches creates distinguishable lines; ten checked 5 kg bags show 50 kg in the conversion preview.
- AC3: Saving draft persists receipt data but creates no usable quantity, reservation or stock movement.

**Implementation sequence**

1. Implement draft receipt header/lines and draft save/reload.
2. Build quantity/batch/date/presentation fields and explicit pending statuses.
3. Add invalid conversion and repeated-scan checks.

**Parent completion boundary:** Partial T02/AP-034. Accepted-stock confirmation and partial receipt effects are intentionally unavailable until sprint 3; unknown necessary data cannot be bypassed.

#### SP2-04 — Capture private label photos and manual fallback fields

**Deliverable:** Receipt-linked original label evidence with explicit photo and field states.

**Backlog parents:** AP-020, AP-035, AP-128.  
**Prerequisite packages:** SP2-01, SP2-03, SP1-04.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Image access checks site/user; original capture/record author and receipt/product/batch references remain associated.
- AC2: No-photo, unreadable, upload-pending and upload-failed are distinct; manually typed actual batch/date does not invent a photo.
- AC3: Reopening a draft retrieves saved fields and authorized evidence without duplicate attachments.

**Implementation sequence**

1. Implement private upload/read adapter and metadata.
2. Add capture/retake and manual batch/date fallback.
3. Expose assisted-extraction port/status without pretending stubbed output is live OCR.

**Parent completion boundary:** AP-128 extraction implementation/evaluation remains pending unless genuinely delivered as an optional extension. Manual fallback and evidence capture can complete their scoped acceptance independently; full AP-035 is not Done.

#### SP2-05 — Record procedure-bound receiving observations in draft

**Deliverable:** A receiving-control form driven by an explicitly synthetic versioned profile.

**Backlog parents:** AP-079, AP-080, AP-081, AP-086, AP-036, AP-025.  
**Prerequisite packages:** SP2-03, SP1-03, SP1-04.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Synthetic category/stage/procedure defines required fields, method, unit and evaluation states; no sample threshold is labelled legal or pilot-approved.
- AC2: Store actual entered readings and observed/recorded times separately; blank is pending and not-applicable needs a reason.
- AC3: Within-rule, deviation and inconclusive differ, while chef disposition and ordinary storekeeper capture remain separate capabilities.

**Implementation sequence**

1. Implement minimal profile/procedure snapshot and observation schema.
2. Add actual-temperature/condition capture to receipt draft.
3. Verify missing reading, incorrect unit and rule-version preservation.

**Parent completion boundary:** Narrow synthetic receiving profile only. Full PMS authoring/activation, 32 safety cases, equipment management and real-site validation remain pending. Real receiving release still requires G-PMS.

#### SP2-06 — Preserve drafts under connection failure without false success

**Deliverable:** Visible draft durability and safe failure states for the supported session/device scope.

**Backlog parents:** AP-131, AP-133, AP-134, AP-017, AP-150.  
**Prerequisite packages:** SP2-03, SP2-04, SP2-05.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Successful server draft save is acknowledged; timeout remains uncertain and failed local storage never shows saved.
- AC2: If same-device local draft capture is enabled, persist original user/site/time before announcing saved locally; server receipt remains pending.
- AC3: Session switch/expiry cannot expose or reattribute another user’s local draft; if safe isolation is not ready, offline capture is visibly disabled rather than faked.

**Implementation sequence**

1. Implement save/reload and operation-status recovery for receipt drafts.
2. Implement or explicitly disable bounded local capture based on resolved device policy.
3. Demonstrate network loss, failed photo and unauthorized user-switch behavior.

**Parent completion boundary:** Not a complete offline synchronization or lost-device solution. AP-130–AP-138 remain partially/unimplemented as applicable. This sprint cannot be used as a connectivity-ready live pilot.

**Sprint review demonstration:** Scan/type product → OFF fixture or reviewed local fallback → enter two batches → capture label/manual fields → enter an actual illustrative temperature reading → save/reopen → lose connection → see honest pending/error status.

**Exit criteria:** Draft data/evidence can be retrieved privately, batch identity and quantity are separate, control gaps are explicit and no draft changes usable inventory. Network/storage failure never reports false save.

**Explicitly outside this timebox:** Accepted-stock entry, global offline sync, connected thermometer, evaluated OCR automation, quarantine release and complete PMS administration.

**Primary risk and response:** Unselected image extraction or real PMS must not stall the draft path. Keep manual batch/date and explicit synthetic profiles; full parent criteria stay pending.

**Handoff:** Sprint 3 receives validated draft payloads, evidence references, observation/version metadata and a clear operation-result contract.

### Sprint 3 — Accepted receipt to stock and safe transfer

**Timebox:** Two weeks, proposed; no dates or effort commitment.

**Sprint goal:** Demonstrate that only accepted eligible quantities enter usable stock once, then move a bag to the kitchen without changing the site total.

**Entry:** Receipt draft/evidence/observation contracts working; chosen transaction/idempotency design ready; quantity/discrepancy behavior explicit.

**Suggested sequence:** Implement ledger and operation outcomes first; integrate partial receipt; add pending incidents; show batch/opening quality; implement authorized supervisor transfer; run contention/retry walkthrough.

#### SP3-01 — Implement the transactional batch ledger and operation outcomes

**Deliverable:** Durable receipt/transfer-capable stock commands with retry and conflict protection.

**Backlog parents:** AP-043, AP-017, AP-046, AP-018.  
**Prerequisite packages:** SP2-01, SP1-03, SP2-06.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Receipt/transfer entries retain site/location/product/batch/quantity/unit/basis/reason/author and original history.
- AC2: Same operation retry posts once; key/payload mismatch is rejected and uncertain commit outcome can be retrieved.
- AC3: Concurrent confirmations cannot spend the same recorded availability; use recorded transaction authority and durable-event strategy where events leave that boundary.

**Implementation sequence**

1. Implement ledger aggregates, transactions and balance readers.
2. Implement command idempotency/result query and concurrency guard.
3. Implement only required durable event publication/deduplication for this slice, not a gratuitous broker estate.

**Parent completion boundary:** Partial AP-018/AP-043/AP-046. Production consumption, plan allocations, corrections across already-used goods and all movement types remain later work. No negative deficit is silently clamped.

#### SP3-02 — Confirm partial receipts with required controls

**Deliverable:** The first actual synthetic receive-to-usable-stock workflow.

**Backlog parents:** AP-036, AP-037, AP-039, AP-145.  
**Prerequisite packages:** SP3-01, SP2-03, SP2-04, SP2-05.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Review distinguishes accepted/rejected/quarantined/pending amounts and blocks affected usable release if required synthetic control data is missing.
- AC2: Example: ten units delivered, eight accepted and two rejected adds only eight to usable stock.
- AC3: Receipt/evidence reference/accepted entry persist consistently; retry or response loss never adds another eight.

**Implementation sequence**

1. Connect receipt review to transactional confirmation.
2. Implement partial receipt status and effect/result UI.
3. Verify valid, pending, partial, failed and commit-timeout paths.

**Parent completion boundary:** Rules are illustrative fixture configuration only until PMS validation. Production readiness, actual opening inventory and full receipt correction/release remain unproven.

#### SP3-03 — Keep problematic goods unavailable and capture chef review

**Deliverable:** A minimal incident and authorized disposition trail for affected receipt quantities.

**Backlog parents:** AP-038, AP-099, AP-025.  
**Prerequisite packages:** SP3-01, SP3-02, SP2-05.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Storekeeper can report issue without gaining chef disposition rights; only designated chef or configured scoped director substitution reviews.
- AC2: Affected quantities remain unavailable during pending or unresolved deviation; approval cannot override configured safety prohibition.
- AC3: Keep original observation, immediate protection note, reviewer/reason/time and unresolved scope; do not delete a physical fact.

**Implementation sequence**

1. Implement receiving-specific incident/restriction states.
2. Add chef review and separate decision capability.
3. Test unauthorized release and blocked-lot exclusion from usable balance.

**Parent completion boundary:** Receiving-specific subset of AP-099/AP-025, not the complete incident/recall/reuse or director delegation lifecycle. Full release or reversal beyond validated supported paths stays unavailable.

#### SP3-04 — Record synthetic opening balances and show batch quality

**Deliverable:** A site/location/batch view showing usable quantities, dates and observation basis.

**Backlog parents:** AP-041, AP-042, AP-045, AP-047.  
**Prerequisite packages:** SP3-01, SP3-02, SP3-03.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Seeded opening count is an identified inventory event, not a fictitious old delivery; unknown batch/date/origin remain explicit.
- AC2: Show reserve/kitchen, usable/blocked quantity, last observation and estimated/measured/unknown quality.
- AC3: DLC/DDM/known opening deadline differ; unknown or blocked lots cannot increase guaranteed availability and outside coverage is not zero.

**Implementation sequence**

1. Implement opening-observation command for synthetic coverage.
2. Add scoped stock/batch drilldown and last-check fields.
3. Implement nearest-eligible-deadline suggestion without confirming actual use.

**Parent completion boundary:** Actual representative set/count and opening eligibility policy require restaurant input. This is not a completed physical count or full stock-check/adjustment workflow.

#### SP3-05 — Transfer a bag while preserving site total

**Deliverable:** An audited reserve-to-kitchen transfer demonstrated under an explicit supervisor capability.

**Backlog parents:** AP-044, AP-046, AP-019.  
**Prerequisite packages:** SP3-01, SP3-04.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Transfer 5 kg reserve to kitchen leaves total site stock 5 kg and carries batch/date/source identity.
- AC2: Remaining kitchen amount persists across services; repeat scan/command cannot restore full nominal opened-pack weight.
- AC3: Only authorized enabled operator can confirm; no cook withdrawal/use is enabled before per-product authorization and compatibility controls exist.

**Implementation sequence**

1. Implement transfer preview/confirmation and persistent locations.
2. Verify quantity/eligibility/version before effect.
3. Test retransmission, wrong site and concurrent last-quantity transfers.

**Parent completion boundary:** Partial AP-044 through supervisor-operated stock movement. The cook path remains blocked until AP-026/AP-027/AP-071 are delivered; no bypass of the founder’s product-permission requirement.

#### SP3-06 — Demonstrate receipt-to-stock invariants and recovery

**Deliverable:** Repeatable evidence for the first complete inventory entry and transfer slice.

**Backlog parents:** AP-151, AP-150, AP-024.  
**Prerequisite packages:** SP3-01, SP3-02, SP3-03, SP3-04, SP3-05.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Demonstrate separate batches, partial acceptance, required missing readings, quarantine and unauthorized cross-site access.
- AC2: Verify commit-before-timeout retry, duplicate submission and concurrent last-quantity contention.
- AC3: Show trace from receipt and original label to movement/batch; restart preserves author, version and balances.

**Implementation sequence**

1. Run focused domain/integration and screen walkthrough cases.
2. Document real test outcomes and remaining unsupported paths.
3. Review capacity and readiness of sprint 4 input contracts.

**Parent completion boundary:** AP-151 remains partial: production, full recipes, component stock, offline conflict and complete end-to-end safety verification still have later acceptance conditions.

**Sprint review demonstration:** Receive ten units → accept eight and reject two → confirm/retry → usable eight only → inspect blocked second batch → transfer a 5 kg bag reserve→kitchen → total still 5 kg → provoke concurrent/unauthorized attempt → visible denial/conflict.

**Exit criteria:** Atomic entry and transfer, exact retry semantics, cross-site/role restrictions, separate blocked balances and attributable history have demonstrated verification. Synthetic opening inventory is correctly identified.

**Explicitly outside this timebox:** Cook product-authorized withdrawal, production consumption, full quarantine-release/correction workflows, targeted count reconciliation, real-site stock completeness and go-live.

**Primary risk and response:** Concurrency or uncertain commit outcomes must be resolved before enabling mutations. Cut convenience features, not quantity integrity or authorization.

**Handoff:** Sprint 4 consumes authoritative dated stock/eligibility/quality views and must not write stock from menu simulation.

### Sprint 4 — Recipe drafts and stock-based planning simulation

**Timebox:** Two weeks, proposed; no dates or effort commitment.

**Sprint goal:** Demonstrate imported recipe drafts, chef gross/net references and a joint menu-capacity simulation that explains ingredient shortages.

**Entry:** Scoped product/stock contracts and reliable recorded balances available; flat recipe format and ingredient equivalences explicit. Source file remains fixture-only unless authorized real template has been examined.

**Suggested sequence:** Define drafts/mappings first; implement import and loss references; expose review/unsupported-data states; then verify deterministic capacity and weekly simulation.

#### SP4-01 — Define recipe drafts, generic ingredients and source mapping

**Deliverable:** A versioned recipe draft editor linked to explicitly reviewed compatible product presentations.

**Backlog parents:** AP-052, AP-053, AP-148.  
**Prerequisite packages:** SP1-03, SP1-04, SP2-02, SP3-04.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Store generic ingredient identity, net raw quantity/unit and positive reference yield separately from commercial product and actual received batch.
- AC2: Preserve original author/name/version; product equivalence checks units/state rather than similar names alone.
- AC3: Absent yield/mapping/conversion is visible; no automatic brand, allergen-free or complete-nutrition declaration.

**Implementation sequence**

1. Implement flat recipe draft aggregate/editor.
2. Implement reviewed generic-to-product mapping for selected synthetic examples.
3. Design extension points for intermediate preparations and full review.

**Parent completion boundary:** Flat draft subset only. This does not complete nested preparations, standard recipe validation, nutrition or actual production links.

#### SP4-02 — Import one standardized Excel fixture as a draft

**Deliverable:** Preview/import for one documented source template, with retained original file.

**Backlog parents:** AP-003, AP-051.  
**Prerequisite packages:** SP4-01, SP2-04.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Use authorized actual sample if available, otherwise visibly synthetic fixture and provisional template mapping.
- AC2: Preview ingredients/amounts/units/yield and qualitative quantities; incompatible/unknown data remains actionable.
- AC3: Repeated identical import creates no silent duplicate and never overwrites validated data or approves the draft.

**Implementation sequence**

1. Implement one-template parser and staged preview.
2. Retain source file/rows and import identity.
3. Verify invalid yield/unit, repeat import and source-data gaps.

**Parent completion boundary:** A synthetic parser is not validated against the restaurant’s real template. No arbitrary Excel importer or fully approved recipe is implied.

#### SP4-03 — Implement gross/net references and qualitative quantities

**Deliverable:** A recipe calculation preview using explicit chef reference amounts and cleaning yield.

**Backlog parents:** AP-054, AP-055, AP-062.  
**Prerequisite packages:** SP4-01.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Net raw L remains fixed; finite 0≤p<100 gives gross L/(1-p/100), so 8 kg at 20% needs 10 kg gross.
- AC2: Already-cleaned equivalent product uses net without another loss; cooking yield remains separate.
- AC3: To-taste wording stays, numeric chef reference is optional/pending; missing required number is not zero and keeps total calculation incomplete.

**Implementation sequence**

1. Implement scaling Q×P/R and gross/net factor functions.
2. Add loss-reference and qualitative-plus-numeric editor.
3. Verify invalid factors, reference audit and no physical waste movement.

**Parent completion boundary:** AP-054/AP-055/AP-062 are partial until full version review and compound/prepared recipe rules are implemented. These are estimates, not weighed consumption.

#### SP4-04 — Review draft changes without false recipe validation

**Deliverable:** Chef-facing version/difference review with explicit pending composition and unsupported-preparation states.

**Backlog parents:** AP-056, AP-058, AP-057, AP-019.  
**Prerequisite packages:** SP4-01, SP4-02, SP4-03.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Cook can submit draft and chef inspect differences/return corrections under individual identity.
- AC2: Unresolved necessary allergen/composition data cannot be marked definitively approved; final validation is unavailable where its required checks are unfinished.
- AC3: Intermediate/circular/unsupported ingredient dependencies are detected or visibly rejected for calculation; no flattening or invented yield silently bypasses them.

**Implementation sequence**

1. Implement submitted-draft and correction/difference states.
2. Show allergen/nutrition/ingredient pending blocks.
3. Add strict boundary for unsupported component graphs and preserve prior versions.

**Parent completion boundary:** This does not complete AP-056/AP-057/AP-058 or claim a recipe is ready to serve. Full validation, composition aggregation and intermediate yield support remain on the backlog.

#### SP4-05 — Calculate explainable capacity for fully covered flat drafts

**Deliverable:** A deterministic planning simulation using current recorded eligible stock and compatible recipe quantities.

**Backlog parents:** AP-062, AP-063, AP-045.  
**Prerequisite packages:** SP4-01, SP4-03, SP4-04, SP3-04, SP3-06.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Capacity uses every mandatory ingredient for the supported recipe, evaluates batch eligibility for the selected preparation date, and shows limiting ingredient/data quality; partial bounds are labelled.
- AC2: With 5 kg usable rice, A80 g and B60 g yield rice-only isolated 62 A or 83 B; allocating 30 A leaves at most 43 B and 44 B flags 40 g short.
- AC3: Joint availability counts the same commercial stock once even across compatible generic references; unknown mappings/factors and unsupported prepared components prevent complete feasibility claim.

**Implementation sequence**

1. Implement requirement expansion and shared physical-supply allocation for supported flat inputs.
2. Build reason/limiter/shortage preview.
3. Test rice arithmetic plus a complete second limiting ingredient and shared-product mapping.

**Parent completion boundary:** Partial AP-063. Rice-only output is a partial bound, not a valid whole dish; released prepared stock, nested recipes and reservations require later full contracts. Simulation changes no stock.

#### SP4-06 — Simulate a weekly menu and explain shortages

**Deliverable:** A demonstrable chef journey from recipe draft to weekly draft menu and current-stock shortage preview.

**Backlog parents:** AP-064, AP-065, AP-066, AP-145, AP-151.  
**Prerequisite packages:** SP4-02, SP4-04, SP4-05.  
**Owner:** Engineering owner, unassigned; product/operational review as applicable.

**Acceptance criteria**

- AC1: Chef adds/orders arbitrary starters/mains/desserts and adjusts planned portions for site/date/service without equal-portion assumptions.
- AC2: Draft status and unresolved review are always visible; changes recompute shared-ingredient needs and confirmed shortage versus unknown availability.
- AC3: Saving simulation consumes/reserves nothing, sends no order and publishes no menu; no forecast or AI output is faked.

**Implementation sequence**

1. Build narrow weekly draft planner and needs panel.
2. Link source recipe/version, stock snapshot and stale-data recalculation.
3. Demonstrate import→draft→30 A/43 B simulation, then 44 B shortage and unknown-ingredient case.

**Parent completion boundary:** Partial AP-064–AP-066/AP-145. Full published-week revision, future-date allocation, eligible prepared-stock offsets, AI and assisted forecasts are still required later for the MVP. Next-service deadlines remain explicit limitations.

**Sprint review demonstration:** Import standard Excel fixture → inspect generic ingredients/yield → set 8 kg net and 20% loss →10 kg gross preview → simulate rice A/B with 5 kg usable →30 A leaves at most 43 B →44 B signals 40 g shortage → show a complete-recipe limiter and unknown-data state.

**Exit criteria:** Supported flat recipes simulate in compatible units, qualitative/missing values remain explicit, draft review cannot falsely approve composition, joint allocations count physical supply once, and weekly draft/shortage UI changes no stock.

**Explicitly outside this timebox:** Full standard-recipe validation where allergens are incomplete, compound/intermediate production, complete nutrition, public publication, AI recommendations, sales forecasting and all remaining MVP execution.

**Primary risk and response:** Compound recipes and missing real units can expand scope. Restrict the enabled simulator to explicit supported inputs; do not fabricate feasibility or count unsupported dishes as complete.

**Handoff:** Refine full composition/allergen/nutrition and intermediate-recipe support, then stock-grounded AI and pre-service execution/publication; retain all approved MVP features.

## 5. Parallel product/restaurant discovery track

“Parallel” here means independent work that can proceed while engineering develops with fixtures, not a claim that extra people are assigned. Rodrigo can pursue available inputs without stopping synthetic construction. Do not send any messages or obtain third-party data without the relevant authorization.

| Desired review window | Backlog items | Concrete output | If unavailable |
| --- | --- | --- | --- |
| Sprint 1 | AP-001, AP-011, AP-012 | Permission request/context record, initial ADRs and explicit provisional assumptions | Keep permission pending; finish only synthetic supported contracts |
| Sprint 1–2 | AP-002, AP-003, AP-004 | Proposed representative coverage, authorized standard recipe example, permitted Innovorder export/schema | Use clearly synthetic examples; source-specific importer validation stays pending |
| Sprint 1–2 | AP-005, AP-006 | Activity/PMS applicability notes, observation methods, real authority/substitution and updated-information contingency | Do not activate live sanitary profiles; distinguish a fixture threshold from law |
| Sprint 2–3 | AP-007, AP-009, AP-010 | Device/signal/access facts, negative/unknown-stock and evidence-retention policy | Disable unsupported offline/capture/release paths; retain explicit assumptions |
| Sprint 3–4 | AP-008, AP-002 | Draft pilot baseline/effort plan and confirmed recipe/product coverage if authorized | Demonstrations remain synthetic and partial; no savings or adoption claim |

Real-device checks for prototype compatibility may be performed when equipment/access is available; this does not authorize restaurant operational use. Player and printer selection remain explicitly deferred and are not placed into these sprints as procurement tasks.

## 6. Prerequisite contracts and honest limitations

This table addresses prerequisites from the broader parent graph that are only partly delivered in the first four timeboxes.

| Parent prerequisite | First supporting package | Supported behavior | Still required later |
| --- | --- | --- | --- |
| AP-009 / AP-010 real policy | SP1-01, with discovery track | Explicit provisional unknown/deficit/access/retention assumptions for synthetic data | Competent actual-site decisions before relevant live use |
| AP-011 / AP-012 complete architecture/access | SP1-01 | First-slice topology, data/session/operation/evidence ports and disabled-provider behavior | Remaining detailed deployment/device/integration ADRs and field confirmation |
| AP-014–AP-019 shared infrastructure | SP1-03, SP2-01, SP3-01 | Quantity/version/audit/API plus implemented receipt/transfer transaction, retry and relevant event contracts | All later aggregates/events, full movement/correction and production contracts |
| AP-020 evidence lifecycle | SP2-04 | Private receipt photo upload/read/reference and honest upload states | Complete retention/holds/export/recovery behavior and all evidence categories |
| AP-024 / AP-025 authorization everywhere | SP1-04, SP3-03 | Deny-by-default on every enabled endpoint/file; scoped capture/chef review | Every later module/tool/job and complete substitution/capability administration |
| AP-079–AP-086 PMS infrastructure | SP2-05 | Synthetic versioned receiving rule, actual observation and pending/deviation state | Real applicable PMS activation, all controls/cycles and full authoring/review |
| AP-099 incident lifecycle | SP3-03 | Receiving issue, restriction, protected pending quantity and reviewer trail | Recall/TIAC, other incidents, complete release/correction and verified closure |
| AP-128 assisted label extraction | SP2-04 defines port | Manual entry remains functional and original photo retained; unsupported extraction clearly disabled | Actual extraction, human review UI and evaluation before claiming the approved assisted capability complete |
| AP-130–AP-138 offline suite | SP2-06 | Honest save/failure status; bounded local draft only if ownership and durability are implemented | Full preload, isolated queues, revalidation, conflict/late-event and lost-device recovery |
| AP-026 / AP-027 / AP-071 cook product grants | Not delivered here | Only explicit authorized supervisor stock transfer; no enabled cook withdrawal path | Product/cook grants, bulk confirmation and compatibility/eligibility checks before cook path activation |
| AP-057 intermediates and cycles | SP4-04 boundary contract | Unsupported compounds/cycles cannot silently enter a complete flat calculation | Actual graph/yield and prepared-stock-aware requirements/production |
| AP-056 / AP-058 full recipe validation | SP4-04 | Submitted draft/difference/correction with unreviewed composition clearly pending | Complete reviewed product/allergen composition and exact chef validation |
| AP-063 complete capacity / AP-065 full plan | SP4-05–SP4-06 | Eligible-date, current-recorded-stock flat-recipe simulation and simple joint supply constraints | Prepared stock, nested recipes, full horizon/reservation/revision policies and source coverage |
| AP-145 / AP-146 complete UX | SP1-05 onward | Enabled screens have task context, access/error/loading/pending states and touch-friendly components | All 12 contracts, extended administrative forms and full device/accessibility review |
| AP-150 / AP-151 verification | Every sprint, especially SP1-06/SP3-06 | Actual focused checks for implemented contracts | Full MVP scenarios, real devices, restore, operator usability and live readiness |

A partial dependency is sufficient only for the exact bounded supported use case. If a real input requires an unfinished branch, the operation remains pending/unsupported or is removed from that timebox's enabled demo. Never fabricate an equivalent safe result.

## 7. Sprint cadence and capacity decisions

- **Planning:** confirm availability and select a forecast from the candidate packages; resolve contract questions and define demonstration data. No external dependency is treated as implicitly completed.
- **During the timebox:** finish one end-to-end path before broadening it. Review blockers and actual scope frequently; keep meaningful verification near the change.
- **Refinement:** prepare the next sprint's inputs, not every future implementation detail. Routine technical choices follow recorded direction; material product changes return to Rodrigo.
- **Review:** demonstrate the listed user flow with actual outcomes, show unresolved cases and record which SP acceptance passed, failed or was unverified. Count no parent story Done on partial evidence.
- **Retrospective:** adjust next forecast to observed capacity/rework. If the first sprint is smaller than forecast, reduce later commitments rather than hide quality work.

The suggested 25% integration/risk buffer is not a pool of extra feature commitments. Optional work can be drawn only after the core goal is complete and verified; avoid using it for marketplace, printer/player purchases or unselected infrastructure.

### Scope reduction order if capacity is lower than assumed

| Sprint | Keep the goal intact | Reduce or move first | Never trade away |
| --- | --- | --- | --- |
| 1 | Scoped authenticated vertical read with persisted identity/version | Extra administrative screens, visual polish, unnecessary service splitting | Server isolation, individual author, recoverable configuration/error state |
| 2 | Product/batch quantity draft, private evidence and actual/pending observations | Live OFF convenience, extraction automation, broader draft form categories; local capture may remain explicitly disabled | No stock entry from draft/scan, real evidence states, manual fallback, no false save or ownership transfer |
| 3 | Consistent accepted entry and total-preserving transfer | Advanced batch filters, complete incident administration, extra read projections | Partial-quantity reconciliation, blocked-stock exclusion, transaction/idempotency/concurrency and authorization |
| 4 | Flat draft quantities/mapping, gross/net and explainable shared-stock simulation | Import convenience variants, category reorder polish, more recipe examples; split import from simulator if source work is larger | Incomplete-data honesty, compatible units, single physical supply, no publication/consumption from draft |

If one of the kept core contracts does not fit, move the unfinished work to the next forecast and slide the dependent demonstration. Do not call the sprint goal met or keep a later schedule by bypassing that prerequisite.

## 8. End-of-sprint review checklist

For each sprint review, attach actual evidence for:

1. A repeatable user journey through the enabled UI and API with the correct identity/site.
2. Scoped acceptance checks, with failed/unrun cases explicitly listed.
3. Relevant original author, version and corrected-value behavior.
4. Meaningful error, unknown-data and permission states, without expected values filled as observations.
5. Retry/concurrency checks whenever an effectful command is enabled.
6. Updated docs, reproducible local start, migration/schema and source fixtures as applicable.
7. The original AP acceptance criteria still outstanding after completing the SP child.
8. A realistic next-sprint forecast informed by actual capacity, not the number of parent references.

A build or synthetic demo is not restaurant approval, safety certification, a usability test, an AI evaluation, actual stock measurement or achieved waste reduction. Deployment and real operational use require their own concrete readiness review from the original backlog.

## 9. End-of-four-sprints product boundary

**Target demonstration, if the forecast fits and passes:** individual scoped access → reference lookup → product/batch receiving draft and receipt photo → actual control observations → accepted synthetic entry exactly once → blocked-stock separation → authorized reserve/kitchen transfer → draft recipe/import → net/gross references → shared-ingredient planning simulation and shortage explanation.

**Still required for the approved MVP:** complete applicable safety profile/forms and incidents; real sample import validation; recipe/allergen validation and nutritional estimates; intermediate prepared-stock flow; cook product authorizations; actual production/additional batches/adaptations and approval before service; menu publication/display/fallback; component closing/eligible reuse/labels; Innovorder import and chef-confirmed forecasting; stock-aware AI discovery/portion recommendations; targeted counts and late reconciliation; complete bounded offline behavior; reporting, restore/device/operator checks and agreed live-pilot evidence.

These remain on the existing backlog. Their order after sprint 4 should use actual learning and prerequisite contracts. This plan neither removes them nor promises the full MVP at the end of eight calendar weeks.

## 10. Backlog-to-sprint traceability

All entries below are **planned partial contributions**, unless an actual subsequent review proves every original parent acceptance criterion complete. No backlog status was modified while preparing this plan.

| Backlog parent | Planned sprint packages |
| --- | --- |
| AP-003 | SP4-02 |
| AP-009 | SP1-01 |
| AP-010 | SP1-01 |
| AP-011 | SP1-01 |
| AP-012 | SP1-01 |
| AP-013 | SP1-02 |
| AP-014 | SP1-03 |
| AP-015 | SP1-03 |
| AP-016 | SP1-03 |
| AP-017 | SP2-01, SP2-06, SP3-01 |
| AP-018 | SP3-01 |
| AP-019 | SP1-03, SP1-06, SP3-05, SP4-04 |
| AP-020 | SP2-01, SP2-04 |
| AP-021 | SP1-02 |
| AP-022 | SP1-04 |
| AP-023 | SP1-04 |
| AP-024 | SP1-04, SP1-06, SP3-06 |
| AP-025 | SP1-04, SP2-05, SP3-03 |
| AP-029 | SP1-05 |
| AP-030 | SP2-02 |
| AP-031 | SP2-02 |
| AP-032 | SP2-01, SP2-03 |
| AP-033 | SP2-02 |
| AP-034 | SP2-01, SP2-03 |
| AP-035 | SP2-04 |
| AP-036 | SP2-05, SP3-02 |
| AP-037 | SP3-02 |
| AP-038 | SP3-03 |
| AP-039 | SP3-02 |
| AP-041 | SP3-04 |
| AP-042 | SP3-04 |
| AP-043 | SP2-01, SP3-01 |
| AP-044 | SP3-05 |
| AP-045 | SP3-04, SP4-05 |
| AP-046 | SP3-01, SP3-05 |
| AP-047 | SP3-04 |
| AP-051 | SP4-02 |
| AP-052 | SP4-01 |
| AP-053 | SP4-01 |
| AP-054 | SP4-03 |
| AP-055 | SP4-03 |
| AP-056 | SP4-04 |
| AP-057 | SP4-04 |
| AP-058 | SP4-04 |
| AP-062 | SP4-03, SP4-05 |
| AP-063 | SP4-05 |
| AP-064 | SP4-06 |
| AP-065 | SP4-06 |
| AP-066 | SP4-06 |
| AP-079 | SP2-05 |
| AP-080 | SP2-05 |
| AP-081 | SP2-05 |
| AP-086 | SP2-05 |
| AP-099 | SP3-03 |
| AP-128 | SP2-04 |
| AP-131 | SP2-06 |
| AP-133 | SP2-06 |
| AP-134 | SP2-06 |
| AP-145 | SP1-05, SP2-03, SP3-02, SP4-06 |
| AP-146 | SP1-05, SP2-03 |
| AP-148 | SP4-01 |
| AP-150 | SP1-02, SP1-06, SP2-06, SP3-06 |
| AP-151 | SP3-06, SP4-06 |

## 11. First action

Refine **SP1-01** against AP-011/AP-012 and document the first-slice contracts. Then start SP1-02 without initiating a production deployment. At planning, confirm actual engineering capacity and adjust the six candidate packages accordingly. No additional product interview is needed to reopen the approved scope.

## 12. Planning validation

This document's preparation checked all 24 package IDs, parent references against the 173-item backlog, and an acyclic prerequisite graph with no dependency on a later sprint. These are planning consistency checks, not software or operational tests. The original specification/backlog were left unchanged.
