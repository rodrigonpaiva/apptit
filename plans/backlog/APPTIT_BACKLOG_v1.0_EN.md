# Apptit — Complete Delivery Backlog

**Backlog version:** 1.0  
**Date:** 4 November 2026 (Europe/Paris)  
**Product owner:** Rodrigo Paiva  
**Baseline:** specification v0.80, English working edition `APPTIT_SPEC_v0.80_EN.md`, with the Portuguese `APPTIT_SPEC_v0.1.md` as the original decision record.  
**Planning status:** Proposed; implementation and test completion are not asserted. No tickets were created in an external tracker.

## 1. Purpose and authority

This backlog translates the current specification into reviewable discovery work, engineering enablers and user stories. It includes the complete current MVP, profile-dependent safety coverage, technical/operational preparation and explicitly deferred evolution. Its scope is complete against the v0.80 baseline, not a claim that every technical subtask or local legal obligation is already known. New learning may require refinement.

Confirmed founder decisions remain authoritative. Story decomposition, dependencies, priorities, work packages, acceptance wording and delivery sequence are implementation proposals; their presence does not approve a new feature, choose a provider, certify compliance or authorize a restaurant pilot. Later explicit decisions in the specification prevail over older proposals. Existing code is neither required for compatibility nor presumed absent everywhere.

The MVP should win the team over by helping them plan and execute service with less effort, using traceable inventory and assisted forecasting, and track waste reduction as an economic outcome of the pilot.

### Scope labels

| Label | Meaning |
| --- | --- |
| MVP | Required capability for the approved pilot scope; exact proposed behavior still follows source authority |
| DISCOVERY | Evidence, configuration or ADR needed for dependent build/live decisions; can use clearly marked synthetic assumptions where appropriate |
| CONDITIONAL | Required if the actual site performs the activity; record competent applicable/not-applicable/unknown determination, not an optional safety cut |
| DEFERRED | Explicit later evolution or hardware choice; never a first-MVP prerequisite by mere presence here |

P0 means correctness, dependency, operational safety or foundational delivery priority. P1 is the next delivery priority **within the MVP**, including approved AI assistance and forecasting, not permission to remove it. P2 is deferred evaluation. These are proposed ordering aids, not an arbitrary deadline or emergency severity scale. No story points, person-days, named assignees, delivery dates or passed checks are invented.

Suggested tracker flow: Proposed → Ready → In progress → Review/verification → Done, with an explicit Blocked state and blocker reference. Ready requires the story-specific contracts, not every future decision; Done requires actual acceptance evidence. Deferred items stay outside the MVP board unless scope is explicitly reopened.

All items start as **Proposed** and **Unestimated**. Implementation status must be confirmed separately. Work packages under a card are concrete subdivision candidates, not a claim of code already written. An issue tracker can split them further while retaining the parent ID and acceptance contract.

## 2. Scope safeguards and operating invariants

- Pilot: a potentially authorizable corporate restaurant, about 400 lunches/day Monday–Friday, plus drinks/ready-product cafeteria. Authorization is pending; the average is not daily demand or concurrent users.
- Start with selected complete recipes and their ingredients plus selected cafeteria products, not whole-restaurant inventory by default. Outside coverage is unknown, not zero.
- Marketplace, purchase-order creation/sending, automatic Innovorder API, advertising, IoT and advanced AI are deferred. Missing ingredients and CSV/Excel import stay in MVP.
- Player and printer selection remain deferred. Browser display contracts and printable label content can be developed without buying equipment. Actual display/print integration must be qualified before relying on it operationally.
- Barcode identifies a commercial presentation, not the delivered batch or expiry. OFF enriches data and never certifies an actual delivery or allergen absence.
- One scan per product/batch plus entered quantity; no routine unit-by-unit scan. Receipt photos are reused in the kitchen; manual batch/date is the failure fallback.
- Whole-bag movement to the kitchen is a transfer, not consumption. Remaining kitchen stock persists; no fictitious return is required.
- Net raw recipe quantities, gross procurement/use basis, ready preparation yield and reference served grams are distinct. Do not apply cleaning loss twice or invent missing factors.
- Dose-by-eye production produces theoretical estimates. Human confirmation does not make them measured. Targeted observations and chef/storekeeper-confirmed adjustments reconcile them.
- Production confirmation consumes once. Additional batches add only incremental use. Sales, photos, scans, publication, leftover entry and repeated collection do not consume raw ingredients again.
- Cook product authorization, recipe compatibility and batch eligibility are independent. Bulk grants cover the exact reviewed recipe product set for one cook/site/version, not all stock or future products.
- Cooks/sous-chef write recipe drafts; chef validates. Chef/director substitution approves and publishes; actual ingredient adaptations need review and updated relevant public information before serving.
- Customers choose components freely; no individual plate logging. Chef grams/percentages are references, not observed choices or intake. POS sales do not establish side selections.
- Leftover quantity validation, reuse eligibility/authorization, physical conservation and disposal are separate facts. An authorized person cannot override a safety prohibition.
- Offline records preserve actual author/time and visible pending status. Local save, synchronization, approval, publication and remote notification delivery are separate.
- Historical data is corrected/versioned, not destructively rewritten. Idempotency, concurrency protection and scope authorization apply to every effectful path.
- The 32 safety cases are a profile-based catalogue. Applicable operational coverage cannot be silently removed by classifying a screen or integration as future work.

## 3. Dependency and readiness rules

`Depends on` lists prerequisite contracts/capabilities, not story-number order or a calendar commitment. Numeric IDs are stable references and do not imply execution sequence. A valid topological order is supplied in the structured export. A stage is a target integration milestone; shared infrastructure may be delivered earlier than its numeric neighbors.

Dependencies on discovery require the relevant reviewed contract/decision. Synthetic implementation can proceed against explicitly provisional fixtures, but must not mark the real-data task done or pass the live gate without evidence. Absence of restaurant authorization does not prevent synthetic development.

A dependency on a conditional branch is satisfied only by its implemented applicable behavior **or** a documented competent not-applicable determination for this site. Unknown applicability is not a waiver. For example, no reheating does not require operating a reheating process just to close service. Where a digital branch cannot yet cover an exercised process, an explicit operator-accepted transitional procedure must be tracked and reviewed before live release; do not claim full digitization or remove the risk.

Public-information fallback and food-safety emergency actions must work in the real world without waiting for the application. This backlog authorizes no external messages, supplier contacts, production deployment or authority notifications.

### Readiness gates

Gates below apply at the relevant live activation or dependent slice. Their presence does not require permission to continue reversible design or synthetic development.

| Gate | Required evidence | Lead role, not an assigned person |
| --- | --- | --- |
| G-LIVE | Restaurant permission, data purposes, accountable operational lead | Product owner / restaurant decision-maker |
| G-DATA | Authorized source examples, complete selected coverage and validated mapping/opening facts as relevant | Chef / storekeeper / authorized POS owner |
| G-PMS | Actual activities/PMS/rules/methods/limits/corrective action and competent applicability validation | Restaurant food safety lead |
| G-DEVICE | Supported devices, actual camera/scanner/network and bounded offline behavior | Engineering + operators |
| G-PRIVACY | Scope, retention, evidence access, health-data exclusion, holds and device-loss policy | Accountable operator + engineering |
| G-STOCK | Unknown/negative stock, conversions and physical-use exception policy | Chef + engineering |
| G-ARCH | Recorded initial topology, data authority, identity, contracts and provider boundaries | Engineering lead |
| G-OPS | Agreed recovery/performance goals, monitoring and rehearsed restore | Operations lead |
| G-PILOT | Baseline, comparable measures, observation period/resources and review criteria | Product owner + restaurant |

## 4. Proposed delivery milestones

| Stage | Demonstrable outcome | Exit evidence |
| --- | --- | --- |
| S0 — Discovery/contracts | Known unknowns, source fixtures, scoped responsibilities and initial ADRs | Discovery outputs and explicit provisional assumptions; no invented authorization |
| S1 — First vertical slice | Individual/site access, opening stock, barcode/OFF receipt, actual checks, batch evidence and transfers | Partial acceptance, retry/concurrency, blocked stock and private-file checks; capture/sync boundaries visible |
| S2 — Planning value | Recipe import/drafts/validation, conversions, nutrition status, joint capacity, shortages and chef-controlled AI menu/portion suggestions | Complete recipe examples, shared ingredients, unknown inputs, rejection/manual fallback and source provenance |
| S3 — Execution/safety/publication | Product grants, actual batches, incremental production, adaptations, approved public information and applicable controls | Trace receipt→preparation→service, correct public change handling and all applicable incident paths |
| S4 — Closing and learning | Leftovers/reuse/labels, sales imports, assisted quantity forecast, reconciliation and reports | No second deductions, actual export semantics, partial/estimated states and late-sync review |
| S5 — Pilot readiness/evaluation | Operator-reviewed workflow, verification/recovery evidence and agreed measurement | Explicit live prerequisites and coverage; observed feedback/results, not predetermined success |
| HARDWARE — Deferred choice | Selected player/printer and physical qualification when reopened | Actual complete cost, compatibility, display/label tests and fallback |
| FUTURE — Later vision | Separately validated commercial/integration/segment expansion | New scope decision and task-specific evidence, not implicit MVP inclusion |

The first buildable slice starts with AP-011/AP-012 contracts, AP-013–AP-024 foundations, then a synthetic receipt/ledger demonstration through AP-034–AP-046, with AP-079–AP-086/AP-099 for validated form/incident contracts. Include enough offline capability to expose pending states; do not postpone consistency until UI completion. This is sequencing guidance, not a fixed sprint calendar. Full MVP includes later S2–S4 value and applicable controls.

## 5. Story readiness and definition of done

**Before starting a story:** review its baseline references, effect/authorization, aggregate ownership, units/states, dependency contracts, acceptance/failure cases and necessary gate for the intended environment. Resolve material unknowns or document a bounded synthetic spike. Do not call all 173 items implementation-ready merely because they have cards.

**Before completing a story:** demonstrate acceptance on the intended interface and business use case; verify relevant scope, concurrent/retry/correction behavior and provenance; provide understandable empty/loading/error/partial/offline states; update contracts/docs; record meaningful tests or operator checks proportionate to risk. If a test was not run, mark it unverified. Do not add low-value tests that only mirror implementation.

**Before live use:** satisfy applicable gates, show explicit safety coverage and contingencies, rehearse recovery and review actual devices/operator tasks. No delivery, usability, model quality, financial return, safety certification or successful test is claimed by this planning document.

## 6. Epic overview

The baseline contains **18 epics, 173 items, 519 acceptance conditions and 346 subordinate implementation work packages**. Scope: 12 discovery items, 130 MVP items, 16 profile-conditional items and 15 deferred items. The traceability matrices cover all 38 explicit RF requirement IDs, 58 founder decisions, 32 safety cases and matching flows, and 12 screen contracts. Coverage means a documented planned treatment, not implemented or legally certified coverage.

| Epic | Outcome | Items |
| --- | --- | --- |
| E00 — Discovery, decisions and pilot preparation | Resolve material unknowns without reopening approved product decisions. | 12 |
| E01 — Architecture and platform foundation | Create explicit domain boundaries and consistent transactional contracts. | 9 |
| E02 — Identity, tenant/site isolation and permissions | Every operational action has the correct individual, scope and authority. | 7 |
| E03 — Product catalogue and Open Food Facts | Identify real products and keep external references distinct from delivery facts. | 5 |
| E04 — Receiving and label evidence | Accept eligible goods once with short, traceable receiving checks. | 7 |
| E05 — Inventory ledger, transfers and physical checks | Maintain explainable batch balances without claiming theoretical use is measured. | 10 |
| E06 — Recipes, intermediate preparations and nutrition | Maintain reviewed, versioned recipes linked to actual products and calculation bases. | 11 |
| E07 — Capacity, weekly menu planning and publication | Plan feasible services and publish matching approved information. | 8 |
| E08 — Production execution and adaptations | Record actual preparation batches and changes before serving. | 9 |
| E09 — Food safety procedures, controls and incidents | Support every applicable local safety workflow and preserve evidence/gaps. | 27 |
| E10 — Closing, leftovers, eligible reuse and labels | Distinguish remaining food, disposal and authorized prepared stock. | 6 |
| E11 — Innovorder imports and assisted forecasting | Build comparable dish history and explainable quantity recommendations. | 9 |
| E12 — Stock-aware AI assistance and evaluation | Provide useful chef-controlled suggestions with bounded tools and provenance. | 9 |
| E13 — Offline continuity and shared-device recovery | Preserve individual observations through network and device changes. | 9 |
| E14 — Tasks, alerts, reporting and pilot economics | Make follow-up actionable and measure value with explicit coverage. | 6 |
| E15 — Operational UX and screen integration | Deliver a usable phone/tablet journey with task-oriented navigation. | 5 |
| E16 — Verification, operations and live-pilot release | Demonstrate critical invariants, recovery and actual operator readiness. | 9 |
| E17 — Deferred product and integration evolution | Preserve the broader vision without making it an MVP dependency. | 15 |

## 7. Detailed backlog

Every acceptance bullet below is a separate reviewable condition. Cross-cutting invariants and the definition of done also apply. Owner roles express capability, not named assignment. Gates are live-readiness dependencies rather than approval prompts for routine work.

### E00 — Discovery, decisions and pilot preparation

Resolve material unknowns without reopening approved product decisions.

#### AP-001 — Obtain pilot permission and establish data authority

**Type:** Discovery · **Scope:** DISCOVERY · **Priority:** P0 · **Stage:** S0 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a product owner, I need to use restaurant operations and data only within an explicit agreed scope.

**Acceptance criteria**

- AC1: Record the authorizing organization/person, site, allowed purposes and data access.
- AC2: Separate founder access from actual restaurant permission; unresolved permission remains visible.
- AC3: Document operator/customer data ownership, exports and operator-change questions without inventing agreement.

**Implementation work packages**

- AP-001.T1: Prepare an authorization and data-responsibility record.
- AP-001.T2: Confirm pilot lead and allowed sample collection.

**Depends on:** No hard item dependency; baseline/DoR applies.  
**Activation/readiness gates:** G-LIVE.  
**Spec trace:** §4, §4.1, §24.4, DEC-003, DEC-004.

#### AP-002 — Select the representative pilot coverage

**Type:** Discovery · **Scope:** DISCOVERY · **Priority:** P0 · **Stage:** S0 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to start with complete selected recipes and relevant cafeteria products.

**Acceptance criteria**

- AC1: Record selected recipes with every ingredient and selected cafeteria articles; no invented approved count.
- AC2: Mark tracked, partially tracked and outside-coverage data, including shared uses.
- AC3: Identify where opening quantities will be observed and how expansion is reviewed.

**Implementation work packages**

- AP-002.T1: Build recipe/product/location coverage manifest.
- AP-002.T2: Review kitchen/cafeteria shared stock and off-recipe uses.

**Depends on:** AP-001.  
**Activation/readiness gates:** G-DATA.  
**Spec trace:** RF-03.1, §7, §23, DEC-016, DEC-024.

#### AP-003 — Inspect the standardized Excel recipe template

**Type:** Discovery · **Scope:** DISCOVERY · **Priority:** P0 · **Stage:** S0 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a product owner, I need to map the actual standard recipe files rather than build a universal importer.

**Acceptance criteria**

- AC1: Obtain an authorized example or explicitly use a synthetic fixture until permission.
- AC2: Record sheet/column layout, generic ingredient wording, units, reference yield and qualitative quantities.
- AC3: Document missing gross/net/loss/nutrition/allergen data as missing, not source-provided.

**Implementation work packages**

- AP-003.T1: Profile a real template and prepare fixtures.
- AP-003.T2: Approve one documented mapping contract.

**Depends on:** AP-001.  
**Activation/readiness gates:** G-DATA.  
**Spec trace:** RF-04.13, DEC-048, DEC-053, DEC-058.

#### AP-004 — Inspect Innovorder sales exports and access conditions

**Type:** Discovery · **Scope:** DISCOVERY · **Priority:** P0 · **Stage:** S0 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a product owner, I need to interpret actual sales granularity and correction semantics.

**Acceptance criteria**

- AC1: Record authorized CSV/XLSX columns, units, periods, stable identifiers if present and dish naming.
- AC2: Verify bundles/options/cancellations and whether totals are already net.
- AC3: Document accessible history and import effort; do not assume sides, API access or diner identities.

**Implementation work packages**

- AP-004.T1: Acquire permitted export/cancellation examples.
- AP-004.T2: Create reviewed mapping and reconciliation fixtures.

**Depends on:** AP-001.  
**Activation/readiness gates:** G-DATA.  
**Spec trace:** RF-13.1, DEC-026, DEC-027, DEC-028.

#### AP-005 — Qualify actual kitchen activities and PMS controls

**Type:** Discovery · **Scope:** DISCOVERY · **Priority:** P0 · **Stage:** S0 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a food safety lead, I need to activate only locally applicable procedures and legally supportable configuration.

**Acceptance criteria**

- AC1: Record local/central/satellite activities, beverage handling, external dispatch and special processes as known/unknown/not applicable.
- AC2: Review actual paper forms, limits, monitoring method/frequency, corrective actions and competent validation.
- AC3: Preserve source/version and outstanding legal-consolidation checks; no automatic simplified profile or generic temperatures.

**Implementation work packages**

- AP-005.T1: Conduct activity and PMS review with restaurant lead.
- AP-005.T2: Produce applicable-control and transition-coverage register.

**Depends on:** AP-001.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** RF-08.1, RF-08.3, UC-S01, UC-S02, F01, F02, §21.2, DEC-003, DEC-018, DEC-035, DEC-036.

#### AP-006 — Define responsibilities, substitution and urgent fallbacks

**Type:** Discovery · **Scope:** DISCOVERY · **Priority:** P0 · **Stage:** S0 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a restaurant manager, I need to make operational authority and contingencies explicit.

**Acceptance criteria**

- AC1: Confirm chef/director substitution and designate the additional eligible-reuse responsible person without assuming they are the same.
- AC2: Define observation/review ownership, incident contacts and alternative public-information procedure.
- AC3: Document what small ingredient adaptation means operationally without waiving pre-service review.

**Implementation work packages**

- AP-006.T1: Write site capability/delegation matrix.
- AP-006.T2: Review safety emergency and display-failure procedures.

**Depends on:** AP-001, AP-005.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** RF-01, RF-04, RF-13, UC-S25, UC-S31, DEC-032, DEC-033, §24.4.

#### AP-007 — Evaluate actual phones, tablets, scanners and signal gaps

**Type:** Discovery · **Scope:** DISCOVERY · **Priority:** P0 · **Stage:** S0 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to design capture and recovery for real devices.

**Acceptance criteria**

- AC1: Record operating systems, browsers, camera/scanner permissions, shared-device use and weak-signal areas.
- AC2: Agree supported offline duration/preloads and device-loss/unsent-evidence handling.
- AC3: Do not equate infrared description with a connected thermometer or confirmed display protocol.

**Implementation work packages**

- AP-007.T1: Run device/work-area capability survey.
- AP-007.T2: Write compatibility and offline acceptance matrix.

**Depends on:** AP-001.  
**Activation/readiness gates:** G-DEVICE.  
**Spec trace:** §13, §24.4, DEC-013, DEC-029, DEC-030, DEC-039, DEC-010.

#### AP-008 — Define pilot baseline, targets and evaluation period

**Type:** Discovery · **Scope:** DISCOVERY · **Priority:** P0 · **Stage:** S0 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a product owner, I need to judge adoption and economics against a credible initial baseline.

**Acceptance criteria**

- AC1: Agree observation scope, period and responsible roles without invented numeric targets.
- AC2: Measure total new and existing work, not menu time in isolation.
- AC3: Separate estimate/measurement, retained surplus/disposal, forecasting usefulness and causal limitations.

**Implementation work packages**

- AP-008.T1: Draft pilot measurement plan and data dictionary.
- AP-008.T2: Agree success/review and stop/escalation conditions.

**Depends on:** AP-001, AP-002.  
**Activation/readiness gates:** G-PILOT.  
**Spec trace:** §15, §23.2, DEC-005, DEC-055, DEC-002.

#### AP-009 — Resolve quantity-discrepancy and eligibility policies

**Type:** Discovery · **Scope:** DISCOVERY · **Priority:** P0 · **Stage:** S0 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to record physical truth without hiding deficits or granting unsafe availability.

**Acceptance criteria**

- AC1: Define negative-balance/conflict handling, unknown opening batches/dates and required conversion checks.
- AC2: A rejected normal stock operation must still allow recording an already-occurred physical use as an incident.
- AC3: Agree targeted-count coverage/frequency experimentally, not as an invented fixed rule.

**Implementation work packages**

- AP-009.T1: Document ledger exception and unknown-data policies.
- AP-009.T2: Review representative stock and conversion examples.

**Depends on:** AP-002, AP-005.  
**Activation/readiness gates:** G-STOCK.  
**Spec trace:** RF-03, RF-03.1, RF-03.3, RF-03.4, DEC-021.

#### AP-010 — Define retention, privacy and incident holds

**Type:** Discovery · **Scope:** DISCOVERY · **Priority:** P0 · **Stage:** S0 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a restaurant manager, I need to retain required evidence without unnecessary personal data.

**Acceptance criteria**

- AC1: Differentiate records/photos/samples, purposes, applicable duties and retention authorities.
- AC2: Document private attachment access, export, deletion and investigation holds.
- AC3: No universal retention duration, employee diagnosis capture or default cross-customer model training is inferred.

**Implementation work packages**

- AP-010.T1: Create category-based retention/access matrix.
- AP-010.T2: Review lost-device, operator-change and incident-hold cases.

**Depends on:** AP-001, AP-005, AP-006.  
**Activation/readiness gates:** G-PRIVACY.  
**Spec trace:** RF-08.2, UC-S21, UC-S26, §14, §11.1.

#### AP-011 — Choose initial technical architecture through ADRs

**Type:** Discovery · **Scope:** DISCOVERY · **Priority:** P0 · **Stage:** S0 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to start construction with justified authority and deployment boundaries.

**Acceptance criteria**

- AC1: Preserve NestJS/GraphQL and microservices direction while deciding initial service granularity.
- AC2: Resolve database authority, monorepo tool, broker/cache roles, attachments, cloud/recovery, API/event contracts and version selection.
- AC3: Record alternatives, transaction/recovery consequences and current documentation to consult at implementation; no live provider is activated.

**Implementation work packages**

- AP-011.T1: Write topology/data-ownership and integration ADRs.
- AP-011.T2: Define local synthetic-data development slice.

**Depends on:** No hard item dependency; baseline/DoR applies.  
**Activation/readiness gates:** G-ARCH.  
**Spec trace:** §10, §18, DEC-006, §16, DEC-001.

#### AP-012 — Choose session, offline access and integration contracts

**Type:** Discovery · **Scope:** DISCOVERY · **Priority:** P0 · **Stage:** S0 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to resolve access and external-service behavior before dependent code.

**Acceptance criteria**

- AC1: Select authentication/session/revocation and shared-device switching policy without assuming a PIN decision.
- AC2: Specify OFF and AI licensing/data-use, timeouts, limits and source provenance requirements.
- AC3: Separate selected providers from evaluation candidates; record capability-disable behavior and manual fallback.

**Implementation work packages**

- AP-012.T1: Write access/offline and adapter ADRs.
- AP-012.T2: Define typed provider-independent ports and validated settings.

**Depends on:** AP-007, AP-010, AP-011.  
**Activation/readiness gates:** G-ARCH.  
**Spec trace:** §10, §11, §13, RF-02.1, DEC-010, DEC-030.

### E01 — Architecture and platform foundation

Create explicit domain boundaries and consistent transactional contracts.

#### AP-013 — Initialize the selected monorepo and local runtime

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to run a reproducible synthetic-data development environment.

**Acceptance criteria**

- AC1: Chosen workspace/tooling follows the recorded ADR and declares module boundaries.
- AC2: A documented command starts required local services without live credentials.
- AC3: Build/lint/type checks run for initial apps/packages and fail visibly on errors.

**Implementation work packages**

- AP-013.T1: Create workspace, apps and domain/shared packages.
- AP-013.T2: Add Docker development configuration and onboarding instructions.

**Depends on:** AP-011.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §10, §18, DEC-001.

#### AP-014 — Define domain quantities, money, dates and data quality

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to avoid ambiguous units, time and false precision across modules.

**Acceptance criteria**

- AC1: Quantities store unit/basis/precision and conversion provenance; kg/litre needs a validated factor.
- AC2: Site-local dates and expiry types differ from UTC instants; money keeps currency.
- AC3: Unknown, estimated, measured and imported data states remain distinct through serialization.

**Implementation work packages**

- AP-014.T1: Implement shared value objects and validation contracts.
- AP-014.T2: Add arithmetic/date/round-trip contract cases.

**Depends on:** AP-011, AP-009.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §9, RF-04.5, RF-04.9.

#### AP-015 — Implement persistence ownership and versioned migrations

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to store each authoritative aggregate with explicit consistency.

**Acceptance criteria**

- AC1: Chosen databases follow ownership ADR rather than parallel conflicting authorities.
- AC2: Migrations/schema transitions and development seeds are reproducible.
- AC3: Critical transactions expose conflict outcomes and preserve historical versions.

**Implementation work packages**

- AP-015.T1: Implement repository ports/adapters and schema management.
- AP-015.T2: Document ownership and rollback/recovery constraints.

**Depends on:** AP-013, AP-014.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §10.1, §10.2, §14, DEC-006.

#### AP-016 — Define versioned API and asynchronous contracts

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to compose screens and integrations through stable business use cases.

**Acceptance criteria**

- AC1: GraphQL/API operations carry typed inputs, authorization context and recoverable domain errors.
- AC2: Events carry event/operation ID, tenant/site, version, actor and correlation.
- AC3: Documents, telemetry and file imports are not forced through unsuitable GraphQL transport.

**Implementation work packages**

- AP-016.T1: Define first-slice schemas and event envelopes.
- AP-016.T2: Implement contract validation and compatibility examples.

**Depends on:** AP-013, AP-014.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §10.2, §18.

#### AP-017 — Provide idempotent command and uncertain-result handling

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to retry critical commands without duplicate effects.

**Acceptance criteria**

- AC1: An operation ID plus actor/scope/action payload distinguishes retry from a genuinely new operation.
- AC2: Same key with incompatible content is rejected, not silently reused.
- AC3: Clients can retrieve outcome after timeout; rejected/processing/completed results remain distinguishable.

**Implementation work packages**

- AP-017.T1: Implement operation registry and transactional command boundary.
- AP-017.T2: Test response loss after commit and duplicate concurrent submission.

**Depends on:** AP-015, AP-016.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-03, RF-07.2, §14, F30.

#### AP-018 — Implement durable event publication and consumer deduplication

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to propagate committed changes without assumed database-broker atomicity.

**Acceptance criteria**

- AC1: Commit/event publication follows the selected outbox/inbox or equivalent documented strategy.
- AC2: Repeated/out-of-order deliveries cannot duplicate stock or regress domain state.
- AC3: Failed delivery is observable and recoverable with tenant/site context.

**Implementation work packages**

- AP-018.T1: Implement selected durable publisher/consumer adapters.
- AP-018.T2: Add replay, duplicate and recovery scenarios.

**Depends on:** AP-015, AP-016, AP-017.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §10.2, §14.

#### AP-019 — Provide attributable audit history and optimistic version checks

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to know who changed each version without destructive corrections.

**Acceptance criteria**

- AC1: Store authenticated stable author and name at action time, site, times and relevant old/new values.
- AC2: Author, validator and substituting director are separate identities/events.
- AC3: Concurrent modification rejects stale approval and retains exact reviewed version; account rename/deactivation preserves past attribution.

**Implementation work packages**

- AP-019.T1: Implement audit and version-check infrastructure.
- AP-019.T2: Expose authorized history retrieval without leaking secrets.

**Depends on:** AP-015, AP-016.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-01, RF-04.5, RF-04.8, DEC-047.

#### AP-020 — Store private evidence with lifecycle and integrity metadata

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to retrieve label/procedure evidence securely and reliably.

**Acceptance criteria**

- AC1: Attachments require scoped authorization for upload/read/export and preserve original evidence metadata.
- AC2: Pending/failed upload differs from absent/unreadable evidence; reference exists only for its actual state.
- AC3: Apply validated size/type/storage/retention rules, incident holds and recoverable upload behavior.

**Implementation work packages**

- AP-020.T1: Implement evidence port, private storage adapter and metadata.
- AP-020.T2: Verify access denial, retry and incomplete-upload cleanup.

**Depends on:** AP-010, AP-012, AP-019.  
**Activation/readiness gates:** G-PRIVACY.  
**Spec trace:** RF-08.2, UC-S26, §14.

#### AP-021 — Validate configuration and keep secrets server-side

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to disable incomplete capabilities predictably.

**Acceptance criteria**

- AC1: Required incomplete configuration prevents unsafe capability startup.
- AC2: Secrets and admin/device credentials never appear in client bundles, public URLs or logs.
- AC3: Test adapters are explicit and cannot silently select live providers.

**Implementation work packages**

- AP-021.T1: Implement typed configuration and capability health checks.
- AP-021.T2: Add redaction and invalid-configuration checks.

**Depends on:** AP-012, AP-013.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §14, §10.2.

### E02 — Identity, tenant/site isolation and permissions

Every operational action has the correct individual, scope and authority.

#### AP-022 — Create organizations, sites and operating calendar

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a site administrator, I need to scope operations and calendars to real sites.

**Acceptance criteria**

- AC1: User membership is explicit by organization/site; changing identifiers does not expand access.
- AC2: Lunch and cafeteria share site stock but keep identifiable contexts.
- AC3: Monday–Friday defaults support explicit holidays/closures/timezone and do not imply every weekday opened.

**Implementation work packages**

- AP-022.T1: Implement tenant/site membership and calendar use cases.
- AP-022.T2: Add scoped setup UI with unknown fields visible.

**Depends on:** AP-015, AP-019.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-01, §4, §4.1, DEC-004, DEC-023, DEC-024.

#### AP-023 — Authenticate individuals and revoke sessions

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a team member, I need to use my own identity on permitted devices.

**Acceptance criteria**

- AC1: Login/session behavior follows the access ADR; no shared kitchen account.
- AC2: Revocation prevents new server operations and does not erase pending authorship.
- AC3: Session expiry and reauthentication are recoverable without silently changing record ownership.

**Implementation work packages**

- AP-023.T1: Implement session lifecycle and authorization context.
- AP-023.T2: Verify expiry/revocation across operational endpoints.

**Depends on:** AP-012, AP-021, AP-022.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-01, §13.0, UC-S31, F31.

#### AP-024 — Enforce tenant/site/capability isolation everywhere

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to prevent unauthorized data access beyond UI hiding.

**Acceptance criteria**

- AC1: API, search, cache/jobs/events, files and AI retrieval validate explicit scope.
- AC2: A user with two sites cannot access a third by identifier, filter or attachment link.
- AC3: Platform administrator and tenant administrator capabilities are distinct; deny by default.

**Implementation work packages**

- AP-024.T1: Implement reusable server policies and scoped query contracts.
- AP-024.T2: Add cross-tenant/site negative integration cases.

**Depends on:** AP-016, AP-022, AP-023.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-01, §14, UC-S31, F31.

#### AP-025 — Configure separate operational capabilities and director substitution

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a site administrator, I need to delegate only the established operational rights.

**Acceptance criteria**

- AC1: Separate capture, recipe/menu validation, publication, stock adjustment, receiving disposition and eligible reuse.
- AC2: Chef absence can enable director substitution using own identity/site scope and recorded reason.
- AC3: Additional reuse responsible person is designated explicitly; no mandatory double approval or inferred storekeeper release.

**Implementation work packages**

- AP-025.T1: Implement capability assignments and substitution lifecycle.
- AP-025.T2: Show active authority and audit grants/revocations.

**Depends on:** AP-006, AP-019, AP-024.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** RF-01, DEC-032, DEC-033, DEC-054, UC-S31, F31.

#### AP-026 — Grant or deny product-use permissions to individual cooks

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to control which concrete products each cook may withdraw or use.

**Acceptance criteria**

- AC1: Permission records actual product/presentation, recipient, site/context, granter and time.
- AC2: Catalogue visibility, recipe compatibility, batch eligibility and publishing stay independent.
- AC3: Revocation affects new confirmations without rewriting earlier actual use.

**Implementation work packages**

- AP-026.T1: Implement individual grants/revocations and requests.
- AP-026.T2: Integrate server permission check with withdrawal use case.

**Depends on:** AP-019, AP-025, AP-031.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-01, RF-03.5, DEC-049.

#### AP-027 — Release assigned-recipe product sets in one confirmation

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to avoid repetitive grants for a reviewed recipe assignment.

**Acceptance criteria**

- AC1: Modal identifies cook, recipe/version and exact reviewed product set with Yes release / No cancel.
- AC2: Cancel grants nothing; unknown ingredient mappings prevent claiming complete release.
- AC3: Later additions do not widen the old grant, other prior grants are not revoked and changed sets require fresh review.

**Implementation work packages**

- AP-027.T1: Implement assignment/product-set snapshot and bulk grant command.
- AP-027.T2: Build accessible confirmation/difference UI and audit result.

**Depends on:** AP-026, AP-053, AP-056.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-01, DEC-050, RF-04.6.

#### AP-028 — Identify, lock and switch shared-device operators

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a team member, I need to switch users without taking ownership of someone else’s work.

**Acceptance criteria**

- AC1: Active person/site is always visible and locking/switching follows selected authentication policy.
- AC2: Pending content stays owned by original author and inaccessible outside granted scope.
- AC3: Logout/revoke handling distinguishes local protection from preservation of unsent records.

**Implementation work packages**

- AP-028.T1: Implement session bar and lock/switch flows.
- AP-028.T2: Test user A pending record then user B login/logout.

**Depends on:** AP-023, AP-024, AP-025.  
**Activation/readiness gates:** G-DEVICE.  
**Spec trace:** §13.0, T12, DEC-030, UC-S31, F31.

### E03 — Product catalogue and Open Food Facts

Identify real products and keep external references distinct from delivery facts.

#### AP-029 — Model generic references, commercial presentations and actual batches

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to keep recipe, commercial and delivery identities separate.

**Acceptance criteria**

- AC1: Generic ingredient, commercial product/pack, supplier source and received batch have separate identifiers.
- AC2: Barcode is stored as text and never substituted for actual batch/date.
- AC3: Bulk/no-GTIN and reviewed manual local products are supported.

**Implementation work packages**

- AP-029.T1: Implement catalogue aggregate/repository and validators.
- AP-029.T2: Create distinct-identity seed examples.

**Depends on:** AP-014, AP-015, AP-024.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-02, RF-02.1, RF-04.6, §9, DEC-048.

#### AP-030 — Look up product attributes through the OFF adapter

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to prefill available product information from a barcode.

**Acceptance criteria**

- AC1: Return available identity/pack/ingredients/allergens/traces/nutrition/categories with source/freshness.
- AC2: Missing product, incomplete response, service failure and schema failure are distinguishable.
- AC3: A response does not certify delivery condition or actual expiry; no private stock contribution is sent.

**Implementation work packages**

- AP-030.T1: Implement typed OFF lookup/cache/retry boundary under reviewed terms.
- AP-030.T2: Add found, missing, partial, timeout and schema-change fixtures.

**Depends on:** AP-012, AP-021, AP-029.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-02.1, DEC-017, §20.

#### AP-031 — Review and maintain a local product record

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to complete identification when external information is absent or wrong.

**Acceptance criteria**

- AC1: Reference-to-package mismatch can be corrected from label/documentation while preserving source.
- AC2: Reviewed fields are not silently overwritten by future OFF updates.
- AC3: Missing allergen/nutrition data remains unknown, not zero or free-from.

**Implementation work packages**

- AP-031.T1: Implement editable reference review and fallback capture.
- AP-031.T2: Store field-level provenance/review and product versions.

**Depends on:** AP-019, AP-020, AP-030.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-02, RF-02.1, RF-08.2.

#### AP-032 — Define checked packaging and quantity conversions

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to convert delivered packs to compatible operational quantities.

**Acceptance criteria**

- AC1: Nominal pack size and number of packs are distinct; ten 5 kg bags imply 50 kg only after checked conversion.
- AC2: Cases/mass/volume/count relationships require explicit compatible factors.
- AC3: Changing presentation preserves historical conversions and flags invalid downstream mappings.

**Implementation work packages**

- AP-032.T1: Implement versioned packaging/unit mapping.
- AP-032.T2: Show conversion preview and reject incompatible units.

**Depends on:** AP-014, AP-029, AP-031.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-02.1, RF-07.1, RF-04.6.

#### AP-033 — Preserve source licensing and external update review

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to reuse permitted external data without corrupting approved references.

**Acceptance criteria**

- AC1: Record applicable OFF data/image attribution/storage policy and provider terms validation.
- AC2: External changes appear as reviewable differences rather than historical overwrites.
- AC3: External recipe/nutrition candidates are not selected automatically or copied beyond licensed limits.

**Implementation work packages**

- AP-033.T1: Implement source/version metadata and attribution display.
- AP-033.T2: Document allowed cache/import boundaries and source-update workflow.

**Depends on:** AP-012, AP-030, AP-031.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-02.1, RF-04.4, RF-04.9, §11.

### E04 — Receiving and label evidence

Accept eligible goods once with short, traceable receiving checks.

#### AP-034 — Open a receipt and scan one product per batch

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to record deliveries quickly without scanning every identical unit.

**Acceptance criteria**

- AC1: Receipt header captures authorized site/operator/source/document without requiring purchase order.
- AC2: Scan/type identifies product; quantity is manually entered for that batch.
- AC3: Repeated scanning does not silently increment quantity, same-code different batches stay separate and scan alone creates no stock.

**Implementation work packages**

- AP-034.T1: Implement receipt draft/line commands.
- AP-034.T2: Build touch-first scan and physical-match interface.

**Depends on:** AP-017, AP-024, AP-031, AP-032.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-07.1, RF-07.2, T02, DEC-037, DEC-017, DEC-019, UC-S04, F04.

#### AP-035 — Capture receipt label photos with assisted batch/date entry

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to retain batch evidence once for later reuse.

**Acceptance criteria**

- AC1: Photo is linked to exact receipt/product/batch; original image and capture/record times preserved.
- AC2: Assisted fields are suggestions needing review; failed photo/extraction permits manual actual batch/date.
- AC3: No photo, unreadable photo, upload pending and extraction failure remain separate; no invented evidence.

**Implementation work packages**

- AP-035.T1: Implement capture/retake and human-reviewed field proposals through adapter.
- AP-035.T2: Support manual fallback and partial evidence states.

**Depends on:** AP-020, AP-034, AP-128.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-07.1, RF-08.2, DEC-034, DEC-038, UC-S07, F07, T02.

#### AP-036 — Record applicable receiving checks and actual temperature

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to assess delivered goods using validated local procedures.

**Acceptance criteria**

- AC1: Form is selected from reviewed product/state/stage/site profile, not irreversible OFF category alone.
- AC2: Actual chilled/frozen reading keeps value/unit/method/time/author and instrument when required.
- AC3: Blank/not-applicable/deviation/within-rule differ; expected values never become observations.

**Implementation work packages**

- AP-036.T1: Integrate profile-driven observation form.
- AP-036.T2: Preserve original rule version and observed readings.

**Depends on:** AP-005, AP-034, AP-086.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** RF-07.1, RF-08.1, UC-S04, UC-S05, F04, F05, DEC-039, T02.

#### AP-037 — Review accepted, rejected, quarantined and pending quantities

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to see exactly what enters usable inventory.

**Acceptance criteria**

- AC1: Mutually exclusive dispositions reconcile to actual delivered quantity in compatible unit.
- AC2: Complete accepted subset can be confirmed while remainder remains explicitly unresolved.
- AC3: Required missing control/critical deviation prevents affected usable release and rejected quantities never increase capacity.

**Implementation work packages**

- AP-037.T1: Implement receipt line state machine and stock-effect preview.
- AP-037.T2: Create partial receipt and invalid-total acceptance cases.

**Depends on:** AP-017, AP-032, AP-034, AP-036, AP-043.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-07, RF-07.2, UC-S04, F04, T02, DEC-019, DEC-037.

#### AP-038 — Request chef disposition of problematic received goods

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to decide affected quantities with evidence and correct authority.

**Acceptance criteria**

- AC1: Storekeeper captures issue; chef or active director substitute decides per local procedure.
- AC2: Affected batch/quantity remains unavailable while pending; stock-adjustment rights alone do not release it.
- AC3: Decision records reason/evidence/author/time; applicable safety prohibitions cannot be overridden.

**Implementation work packages**

- AP-038.T1: Connect receiving deviations to incident and disposition cases.
- AP-038.T2: Show pending decision and authorized action UI.

**Depends on:** AP-025, AP-037, AP-099.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** RF-07, DEC-053, DEC-054, UC-S23, F23, DEC-019.

#### AP-039 — Confirm receipts consistently and recover uncertain outcomes

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to complete a valid receipt once despite retry or timeout.

**Acceptance criteria**

- AC1: Accepted quantity/evidence linkage/ledger entry commit consistently with operation ID.
- AC2: Same confirmation retry creates no extra stock; a new real delivery of the same barcode is allowed.
- AC3: After timeout UI retrieves result; no success on failed persistence and no blanket receipt cancellation after posting.

**Implementation work packages**

- AP-039.T1: Implement receipt-to-ledger transaction and result query.
- AP-039.T2: Test commit-before-timeout and repeated confirmations.

**Depends on:** AP-017, AP-018, AP-037.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-07.1, RF-07.2, RF-03, T02, DEC-017, UC-S04, F04.

#### AP-040 — Correct a confirmed receipt or release quarantined goods

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to resolve later receipt changes without deleting original facts.

**Acceptance criteria**

- AC1: Draft cancellation posts no stock; confirmed correction uses attributable adjustment/reversal.
- AC2: Quarantine release requires separate eligible decision and affects only remaining relevant quantity.
- AC3: Linked production or concurrent movements are checked; correction cannot silently restore already-used goods.

**Implementation work packages**

- AP-040.T1: Implement correction/release commands with version checks.
- AP-040.T2: Expose original receipt, differences and resulting restrictions.

**Depends on:** AP-019, AP-038, AP-039.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** RF-07, RF-07.2, UC-S23, F23.

### E05 — Inventory ledger, transfers and physical checks

Maintain explainable batch balances without claiming theoretical use is measured.

#### AP-041 — Register persistent storage and usage locations

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to track reserves and kitchen stock within one site.

**Acceptance criteria**

- AC1: Reserve/kitchen locations are distinct but aggregate to the same site quantity.
- AC2: Opening state and applicable conditions remain attached after a move.
- AC3: Location change alone does not consume, release or create product availability.

**Implementation work packages**

- AP-041.T1: Implement site-scoped location model.
- AP-041.T2: Add location and aggregate balance views.

**Depends on:** AP-022, AP-029.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-03.2, DEC-020, T03.

#### AP-042 — Record the representative opening physical inventory

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to establish observed starting balances without invented deliveries.

**Acceptance criteria**

- AC1: Selected products are counted by location/batch where known with observed amount/unit/method/author/time.
- AC2: Unknown batch/date/source is explicitly pending under agreed eligibility policy.
- AC3: Opening movement is identified as inventory, retry-safe and never a fabricated historic receipt.

**Implementation work packages**

- AP-042.T1: Implement opening observation/review/import command.
- AP-042.T2: Display tracked/partial/untracked coverage.

**Depends on:** AP-002, AP-009, AP-017, AP-041, AP-043.  
**Activation/readiness gates:** G-DATA, G-STOCK.  
**Spec trace:** RF-03.1, DEC-016, UC-S06, F06.

#### AP-043 — Implement the batch movement ledger and balance projections

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to explain every stock balance by attributable events.

**Acceptance criteria**

- AC1: Entries record site/location/product/batch/quantity/unit/basis/time/reason and movement type.
- AC2: Physical/reserved/usable/blocked quantities derive under one documented authority.
- AC3: Confirmed history is not deleted; projections can be reconciled/rebuilt without becoming a competing authority.

**Implementation work packages**

- AP-043.T1: Implement transactional ledger and balance readers.
- AP-043.T2: Add invariant/rebuild checks for the first movement types.

**Depends on:** AP-014, AP-015, AP-017, AP-019, AP-041.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-03, §9, §10.2.

#### AP-044 — Transfer whole or partial packs without consumption

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to move goods into the kitchen while keeping site totals correct.

**Acceptance criteria**

- AC1: Transfer preserves product/batch/date and requires origin/destination/quantity.
- AC2: Moving 5 kg reserve to kitchen preserves 5 kg site total; remainder persists without fictitious daily return.
- AC3: A repeated operation or scan never refills an opened package or duplicates allocation.

**Implementation work packages**

- AP-044.T1: Implement transfer use case and preview.
- AP-044.T2: Add whole-bag/open-pack/reverse-transfer scenarios.

**Depends on:** AP-017, AP-032, AP-043.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-03.2, DEC-020, T03.

#### AP-045 — Manage expiry type, opening and usable-batch rotation

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to choose a physically confirmed eligible batch near its deadline.

**Acceptance criteria**

- AC1: DLC/DDM and validated opening/preparation deadlines have source/quality and distinct treatment.
- AC2: Suggest nearest eligible deadline for use date, excluding blocked/unknown/insufficient cases appropriately.
- AC3: User confirms actual package batch or another eligible choice; suggestion itself reserves/consumes nothing.

**Implementation work packages**

- AP-045.T1: Implement eligibility/rotation service with stable tie-breaker.
- AP-045.T2: Build batch choice and unknown-date follow-up.

**Depends on:** AP-005, AP-009, AP-043.  
**Activation/readiness gates:** G-PMS, G-STOCK.  
**Spec trace:** RF-03, UC-S06, F06, DEC-018, DEC-042, DEC-040, T03.

#### AP-046 — Protect concurrent stock and allocation mutations

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to prevent two confirmations spending the same availability.

**Acceptance criteria**

- AC1: Concurrent valid operations are serialized/checked under chosen transaction/version policy.
- AC2: Stale confirmation returns conflict with no hidden partial effect.
- AC3: Previously observed physical deficits remain recordable as incidents, never clamped away or made available.

**Implementation work packages**

- AP-046.T1: Implement availability guard and conflict response.
- AP-046.T2: Run last-quantity contention and retry cases.

**Depends on:** AP-009, AP-017, AP-043.  
**Activation/readiness gates:** G-STOCK.  
**Spec trace:** RF-03, RF-04.1, §19.

#### AP-047 — Show inventory quality and partial coverage

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to know the limitations behind each balance and capacity figure.

**Acceptance criteria**

- AC1: Display last physical check, observation basis, pending operations and relevant opening/blocked states.
- AC2: Untracked product is unknown rather than zero; estimated balance remains estimated after validation.
- AC3: Kitchen/cafeteria shared uses do not duplicate stock or claim full-restaurant coverage.

**Implementation work packages**

- AP-047.T1: Implement scoped quality/coverage projection.
- AP-047.T2: Add task-oriented stock and batch drilldown.

**Depends on:** AP-002, AP-042, AP-043, AP-045.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-03.1, RF-03.4, T03, DEC-016.

#### AP-048 — Prioritize targeted physical checks explainably

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to focus checks on uncertainty affecting upcoming work.

**Acceptance criteria**

- AC1: Prioritize using dated counts, open packs, divergence, estimated balances and menu shortage impact.
- AC2: Each task states its reason; no uncalibrated probability or automatically classified waste.
- AC3: Manual checks remain possible and an empty queue never certifies all stock accurate.

**Implementation work packages**

- AP-048.T1: Implement rule-based prioritization queue.
- AP-048.T2: Record coverage, effort and outcomes for pilot review.

**Depends on:** AP-043, AP-047.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-03.4, DEC-031, T11.

#### AP-049 — Observe physical quantities and confirm traceable adjustments

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to reconcile stock with actual observations under correct authority.

**Acceptance criteria**

- AC1: Observation records amount/unit/batch/location/method and original observer/time; visual quantity stays estimate.
- AC2: Chef or storekeeper can approve, including same observer/confirmer, without required dual signature.
- AC3: Approval posts one difference; rejection preserves observation, and unknown cause is not automatically waste.

**Implementation work packages**

- AP-049.T1: Implement observation/review/adjustment lifecycle.
- AP-049.T2: Test estimated 2.6 kg vs observed 2.2 kg produces one minus 0.4 kg difference.

**Depends on:** AP-025, AP-046, AP-048.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-03.3, RF-03.4, DEC-031, T11, DEC-021.

#### AP-050 — Reconcile counts against concurrent and late movements

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to avoid overwriting newer stock with an old count.

**Acceptance criteria**

- AC1: Use observation time and intervening movements to compute comparable difference.
- AC2: Unknown batch allocation, pending offline use or unresolvable ordering requires visible review.
- AC3: Resubmission/reclassification never repeats consumption or changes historical author.

**Implementation work packages**

- AP-050.T1: Implement reconciliation preview and conflict handling.
- AP-050.T2: Add count-before-consumption and late-sync fixtures.

**Depends on:** AP-049, AP-137.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-03.4, RF-03.3, §13.1, F30, DEC-031, T11.

### E06 — Recipes, intermediate preparations and nutrition

Maintain reviewed, versioned recipes linked to actual products and calculation bases.

#### AP-051 — Import standardized Excel recipes as drafts

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to reuse the restaurant’s existing ingredient/quantity/yield files.

**Acceptance criteria**

- AC1: Compatible files reuse reviewed template mapping and preview source rows before confirmation.
- AC2: Original file/wording/yield/qualitative quantities remain; unknown units/mappings are explicit.
- AC3: Reimport creates no silent duplicates or overwrite of validated versions; imported recipes are not auto-approved.

**Implementation work packages**

- AP-051.T1: Implement template-specific parser and import registry.
- AP-051.T2: Build preview/error/ingredient-association UI.

**Depends on:** AP-003, AP-014, AP-017, AP-020, AP-052.  
**Activation/readiness gates:** G-DATA.  
**Spec trace:** RF-04.13, DEC-058, T04, DEC-011.

#### AP-052 — Create versioned generic recipe and ingredient drafts

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to describe recipe ingredients and positive reference yield.

**Acceptance criteria**

- AC1: Keep stable recipe identity distinct from version, generic ingredient and commercial product.
- AC2: Store net raw amount/unit and portion yield, or appropriate preparation yield; missing/zero yield is invalid for full calculation.
- AC3: Source contains no assumed cooking method, brands, allergens or nutrition; optional enrichment remains identified.

**Implementation work packages**

- AP-052.T1: Implement recipe/version/draft aggregate and editor.
- AP-052.T2: Add required-data and unit/basis validation.

**Depends on:** AP-014, AP-019, AP-024, AP-029.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04, RF-04.6, RF-04.8, DEC-022, DEC-048, DEC-053, DEC-052.

#### AP-053 — Review generic-ingredient to commercial-product equivalence

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to calculate from products actually compatible with the recipe.

**Acceptance criteria**

- AC1: Associations check presentation, unit/base, culinary characteristics and validated yields.
- AC2: Similar names do not automatically merge products, raw/cleaned/processed forms or generic identities.
- AC3: One physical product compatible with several references remains one availability; historical execution links survive later mapping edits.

**Implementation work packages**

- AP-053.T1: Implement reviewed mapping/version contracts.
- AP-053.T2: Show unresolved mappings and affected recipe differences.

**Depends on:** AP-031, AP-032, AP-052.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.6, RF-04.1, DEC-048.

#### AP-054 — Calculate gross requirements from chef loss references

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to see gross and net raw weights with editable reference loss percentage.

**Acceptance criteria**

- AC1: Net L stays fixed when gross-based loss p changes; gross=L/(1-p/100), finite 0≤p<100.
- AC2: Example 8 kg net at 20% needs 10 kg gross;25% needs approximately 10.667 kg; pre-cleaned equivalent uses net without another cleaning loss.
- AC3: Editing a reference creates versioned audit, recalculates affected drafts and creates no actual disposal or historical movement change.

**Implementation work packages**

- AP-054.T1: Implement deterministic loss/yield calculations and validation.
- AP-054.T2: Build gross/net/percentage editor with provenance.

**Depends on:** AP-014, AP-019, AP-052, AP-053.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.5, DEC-045, DEC-046, DEC-047, DEC-022.

#### AP-055 — Maintain chef numeric references for “to taste” ingredients

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to estimate stock use and nutrition without removing culinary wording.

**Acceptance criteria**

- AC1: Keep original to-taste/quantity-sufficient text and chef-defined numeric reference/unit per yield.
- AC2: Missing numeric reference is not zero and prevents falsely complete capacity/nutrition totals.
- AC3: Ingredient presence, allergens, actual product/batch and permissions remain even when quantity is unknown.

**Implementation work packages**

- AP-055.T1: Implement qualitative-plus-numeric ingredient representation.
- AP-055.T2: Add chef-reference review and scaling scenarios.

**Depends on:** AP-052, AP-054.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.12, DEC-057.

#### AP-056 — Submit, correct and validate recipe versions

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to approve the exact submitted draft while preserving its author.

**Acceptance criteria**

- AC1: Cooks/sous-chef can draft/submit; chef validates or returns correction; chef can author/validate directly.
- AC2: Previous validated version remains identified and stale concurrent review cannot approve changed content.
- AC3: Validation preserves author/validator and does not publish menu, replace past executions or expand cook grants.

**Implementation work packages**

- AP-056.T1: Implement draft/in-review/correction/validated lifecycle.
- AP-056.T2: Build difference review and impact indicators.

**Depends on:** AP-025, AP-052, AP-053, AP-054, AP-055.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.8, DEC-052, T06, DEC-047.

#### AP-057 — Define intermediate preparations and prevent recipe cycles

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to reuse sauces and broths with their own yields and versions.

**Acceptance criteria**

- AC1: Intermediate recipe declares kg/litre/unit yield and consuming recipes declare compatible required amounts.
- AC2: Raw/net/ready yield and mass/volume conversions remain separate; missing factors leave incomplete calculation.
- AC3: Reject self-reference and indirect cycles; edits preserve historical batch recipe versions.

**Implementation work packages**

- AP-057.T1: Implement recipe-component graph and reference validation.
- AP-057.T2: Add multi-level/circular/unit-mismatch cases.

**Depends on:** AP-014, AP-052, AP-054, AP-056.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.7, DEC-051.

#### AP-058 — Aggregate reviewed allergens from products and components

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to review visible allergen information grounded in actual composition.

**Acceptance criteria**

- AC1: Visible block separates declared presence, traces, unknown and provisional product choices.
- AC2: Include sauce/seasoning/intermediate composition; generic names or missing OFF fields never prove absence.
- AC3: Product/version changes flag affected recipes/executions; local cross-contamination is not inferred from OFF.

**Implementation work packages**

- AP-058.T1: Implement versioned composition/allergen projection.
- AP-058.T2: Build source/evidence and pending-data review blocks.

**Depends on:** AP-031, AP-053, AP-055, AP-057.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.9, RF-04, RF-08.2, DEC-053, UC-S08, F08.

#### AP-059 — Normalize nutritional references with explicit basis

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to use compatible ingredient nutrition without arbitrary brand assumptions.

**Acceptance criteria**

- AC1: Preserve source/version/date/product state, units and 100 g/100 ml/known-portion basis.
- AC2: Missing nutrient is unknown rather than zero; as-sold/prepared and kg/litre are not mixed without valid factors.
- AC3: OFF/local reviewed references are supported; no external nutrition database/API is selected by this task.

**Implementation work packages**

- AP-059.T1: Implement nutrition-reference mapping and provenance.
- AP-059.T2: Expose partial/incompatible source status for review.

**Depends on:** AP-031, AP-033, AP-053.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.9, DEC-053.

#### AP-060 — Calculate estimated nutrition per portion and ready-weight basis

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to see a useful nutritional table without false completeness.

**Acceptance criteria**

- AC1: Show energy kJ/kcal, fat/saturates, carbohydrate/sugars, protein/salt and fibre where supported.
- AC2: Compatible edible quantity×reference nutrients aggregates once through intermediate components and scales by positive yield.
- AC3: Missing final ready mass prevents definitive per 100 g ready totals; chef nominal mass may be explicitly estimated, process limitations remain visible.

**Implementation work packages**

- AP-060.T1: Implement versioned nutrient aggregation and completeness checks.
- AP-060.T2: Build per-portion/per 100 g table with assumptions and source drilldown.

**Depends on:** AP-055, AP-057, AP-059, AP-061.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.9, RF-04.10, DEC-053.

#### AP-061 — Define chef portion grams and component percentages

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to set planning references supported by explicit ready/raw conversions.

**Acceptance criteria**

- AC1: Positive total grams and component percentages total 100% before full-reference validation; do not silently fix sum.
- AC2: 500 g at 40/20/40 yields 200/100/200 g; protein preparation mass is not protein nutrient mass.
- AC3: Ready portion/cleaned raw/gross raw stay separate; reference composition does not claim each customer chose it.

**Implementation work packages**

- AP-061.T1: Implement reference-portion components and conversion validation.
- AP-061.T2: Show gram totals, yield limitations and calculation impacts.

**Depends on:** AP-014, AP-054, AP-057.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.10, RF-04.11, DEC-054, DEC-056.

### E07 — Capacity, weekly menu planning and publication

Plan feasible services and publish matching approved information.

#### AP-062 — Scale recipe requirements in compatible stock units

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to derive repeatable ingredient needs from yield and planned portions.

**Acceptance criteria**

- AC1: Use Q×P/R for net raw amounts and validated gross/presentation factors only where necessary.
- AC2: Missing/zero yield or required conversion produces incomplete state, not fabricated capacity.
- AC3: Retain internal precision and separate culinary/batch/whole-unit/purchase rounding assumptions.

**Implementation work packages**

- AP-062.T1: Implement deterministic requirement expansion service.
- AP-062.T2: Add 10-vs 100 yield, cleaned/raw, cooked/raw and batch fixtures.

**Depends on:** AP-014, AP-053, AP-054, AP-055, AP-057.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04, RF-04.1, RF-04.5, DEC-012, DEC-022.

#### AP-063 — Calculate isolated and joint menu capacity

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to see limiting ingredients without double-counting shared stock.

**Acceptance criteria**

- AC1: Isolated capacity is minimum whole portions across all valid mandatory ingredients; partial input is labelled partial bound.
- AC2: With 5 kg rice at 80 g A and 60 g B, isolated 62 A or 83 B;30 A leaves 43 B,44 B flags 40 g short.
- AC3: All physical product supply constraints are shared across compatible generic references and prepared stock; no double allocation.

**Implementation work packages**

- AP-063.T1: Implement joint feasibility engine using unique supply pools.
- AP-063.T2: Expose ingredient-level reason and competing allocations.

**Depends on:** AP-045, AP-046, AP-057, AP-062.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.1, RF-04.6, RF-04.7, DEC-012, DEC-051, T04.

#### AP-064 — Plan weekly lunch menus with free category composition

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to choose any number of starters, mains and desserts.

**Acceptance criteria**

- AC1: Select site/week/date/service and configure/order items without fixed quotas or equal-portion assumptions.
- AC2: Record attendance source/history/company/chef adjustment separately from per-dish quantities.
- AC3: Changes recalculate daily/weekly needs and eligibility for use dates; holidays/closures are not zero-demand observations.

**Implementation work packages**

- AP-064.T1: Implement weekly draft planner and versioned service items.
- AP-064.T2: Provide import/create recipe entry and editable duplication shortcuts.

**Depends on:** AP-022, AP-056, AP-063.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04, T04, DEC-011, DEC-023, DEC-024, DEC-025.

#### AP-065 — Apply joint-plan revisions without duplicate commitments

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to revise quantities while preserving history and allocation consistency.

**Acceptance criteria**

- AC1: Draft is simulation and causes no consumption; any confirmed commitment/reservation follows documented policy.
- AC2: Editing a plan evaluates before its own allocations and subtracts those allocations once.
- AC3: Concurrent stock/recipe/plan changes require revalidation; show current stock, projected use and expected receipts separately.

**Implementation work packages**

- AP-065.T1: Implement plan revision/apply use case and allocation semantics.
- AP-065.T2: Test reopen/edit/date-change and shared-stock conflicts.

**Depends on:** AP-017, AP-019, AP-046, AP-063, AP-064.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04, RF-04.1, §19, T04.

#### AP-066 — Generate the missing-ingredient list

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to know what the current plan lacks without creating orders.

**Acceptance criteria**

- AC1: Aggregate compatible ingredient quantities for selected site/service/period with stock quality and timestamp.
- AC2: Released prepared stock offsets new production once; unknown availability differs from confirmed missing quantity.
- AC3: Recalculate after plan/balance change; create no purchase, stock movement, supplier contact or arbitrary margin.

**Implementation work packages**

- AP-066.T1: Implement shortages projection and partial-data display.
- AP-066.T2: Connect list to weekly planner and stock references.

**Depends on:** AP-047, AP-063, AP-065.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-05, §23, DEC-009, T04.

#### AP-067 — Approve and publish an exact menu-information version

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to release reviewed composition and information before serving.

**Acceptance criteria**

- AC1: Only chef/active director substitute can approve/publish; recipe validation and public publication are distinct.
- AC2: Output contains approved dish information/allergens, not costs, forecasts or stock.
- AC3: Record version/site/channel/window and pending/sent/applied-or-unverified states; concurrent changes require review.

**Implementation work packages**

- AP-067.T1: Implement publication contract and review interface.
- AP-067.T2: Connect preparation change invalidation and fallback indicator.

**Depends on:** AP-025, AP-058, AP-064, AP-019.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04, RF-04.2, UC-S08, F08, T06, DEC-033, DEC-011.

#### AP-068 — Render independent browser display and expiry fallback

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a diner, I need to see current approved dish information in a readable display.

**Acceptance criteria**

- AC1: Browser output has channel-scoped revocable identity without admin secrets or required third-party signage subscription.
- AC2: Only valid approved content displays; stale cache expires to defined fallback.
- AC3: Last communication is not proof of display/audience; layout/pagination must not hide configured dishes or allergens.

**Implementation work packages**

- AP-068.T1: Build browser display and restricted device/content endpoint.
- AP-068.T2: Test content expiry, clock/network restart and revocation using available browser.

**Depends on:** AP-021, AP-024, AP-067.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.3, RF-04.2, T06, DEC-014, DEC-015.

#### AP-069 — Handle failed or stale public-information delivery

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to keep customers informed when the display does not update.

**Acceptance criteria**

- AC1: Sending to a channel/spreadsheet does not claim actual screen update.
- AC2: Known composition change cannot leave old information treated as current; show required local contingency before serving.
- AC3: Withdrawal/partial channel failure is traceable and fallback does not expose private data or expired current menus.

**Implementation work packages**

- AP-069.T1: Implement delivery-attempt status and stale-version detection.
- AP-069.T2: Provide operational verification and alternative-information checklist.

**Depends on:** AP-006, AP-067, AP-068.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** RF-04.2, RF-04.3, §19, UC-S08, UC-S13, F08, F13, T06.

### E08 — Production execution and adaptations

Record actual preparation batches and changes before serving.

#### AP-070 — Assign preparation and review withdrawal permissions

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to direct cooks to preparations and the right product-release context.

**Acceptance criteria**

- AC1: Assignment identifies cook/site/service/recipe version without granting stock globally.
- AC2: Bulk authorization is explicit through its own confirmation, not a side effect of assignment.
- AC3: Future recipe/mapping changes show differences before additional grants.

**Implementation work packages**

- AP-070.T1: Implement preparation assignments and links to authorization context.
- AP-070.T2: Show assigned work from service/planning views.

**Depends on:** AP-027, AP-064.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-01, RF-03.5, T01, T07, DEC-050.

#### AP-071 — Scan product and validate cook, recipe and batch separately

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to select permitted actual products without bypassing safety.

**Acceptance criteria**

- AC1: Check individual product permission, reviewed ingredient compatibility and batch eligibility independently.
- AC2: Denied product offers chef request, unknown batch stays pending and manual exception keeps identical controls.
- AC3: Scan alone changes no stock; repeated same-product scan does not increment quantity.

**Implementation work packages**

- AP-071.T1: Implement withdrawal/use validation flow and exception request.
- AP-071.T2: Link transfer or preparation draft only after appropriate explicit action.

**Depends on:** AP-026, AP-027, AP-045, AP-053, AP-070.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-03.5, T07, DEC-049, DEC-042.

#### AP-072 — Draft production with actual batches and reused receipt evidence

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to record preparation facts as work progresses.

**Acceptance criteria**

- AC1: Draft identifies recipe/composition version and actually observed products/batches, including multiple batches.
- AC2: Reuse readable receiving photos with original metadata; new photo only for missing/mismatched evidence.
- AC3: Rotation suggestion is not actual use proof; missing batch/evidence remains visible and draft posts no confirmed consumption.

**Implementation work packages**

- AP-072.T1: Implement production draft and actual ingredient links.
- AP-072.T2: Offer explicit batch confirmation and evidence lookup.

**Depends on:** AP-035, AP-056, AP-058, AP-071.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04, RF-08.2, UC-S07, F07, T07, DEC-040, DEC-041, DEC-034.

#### AP-073 — Confirm portions and post theoretical ingredient use once

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to finish each preparation with portions and actual batches on one screen.

**Acceptance criteria**

- AC1: Completion captures counted/estimated portions, actual batches, author/time and version; no automatic approval of adaptations.
- AC2: Valid confirmation computes compatible theoretical use once; by-eye dosing remains estimated balance.
- AC3: Example 30 portions at 8 kg/100 gives 2.4 kg net theoretical use; sales and preceding transfers do not deduct again.

**Implementation work packages**

- AP-073.T1: Implement production-consumption transaction.
- AP-073.T2: Show review of computed/corrected use and confirmation result.

**Depends on:** AP-017, AP-043, AP-046, AP-062, AP-072.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-03.3, RF-04, T07, DEC-041, DEC-021.

#### AP-074 — Add incremental batches and correct production records

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to report extra lunch production without reposting previous batches.

**Acceptance criteria**

- AC1: Add production accepts additional quantity and unique batch, not a mistaken accumulated total.
- AC2: 80 initial plus 20 additional equals 100; extra 20 causes only extra 20 theoretical use.
- AC3: Correction preserves original record and posts difference; retry duplicates neither batch nor consumption.

**Implementation work packages**

- AP-074.T1: Implement incremental/correction commands and service totals.
- AP-074.T2: Preserve per-batch composition/lot/time and audit differences.

**Depends on:** AP-019, AP-073.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04, RF-03.3, T07, DEC-043.

#### AP-075 — Produce and consume shared intermediate preparations

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to track prepared sauce stock without consuming raw ingredients twice.

**Acceptance criteria**

- AC1: Producing intermediate batch consumes source ingredients once and records declared ready yield/quality.
- AC2: Using 2 kg and 3 kg from 10 kg batch leaves 5 kg and preserves links into both final dishes.
- AC3: Plan needs 12 kg with eligible 10 kg prepared stock derive raw requirements only for extra 2 kg; no expiry/thermal reset by incorporation.

**Implementation work packages**

- AP-075.T1: Implement intermediate production and prepared-stock use commands.
- AP-075.T2: Verify shared-batch availability, permissions and full source trace.

**Depends on:** AP-043, AP-057, AP-063, AP-073.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.7, UC-S07, UC-S15, DEC-051, T07.

#### AP-076 — Propose or record actual ingredient adaptations

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to capture true composition without overwriting the standard recipe.

**Acceptance criteria**

- AC1: Record old/new ingredient/product/amount/unit, batch, reason, author/time and proposed/already-used state.
- AC2: Compute composition/allergen/capacity/use differences; a small quantity does not imply no impact.
- AC3: Already-used unauthorized product remains recorded as incident; rejection cannot undo physical use or restore stock.

**Implementation work packages**

- AP-076.T1: Implement execution-change aggregate and impact preview.
- AP-076.T2: Link to actual evidence and chef review queue.

**Depends on:** AP-019, AP-058, AP-071, AP-072, AP-099.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04, RF-03.5, UC-S08, F08, DEC-033, DEC-049.

#### AP-077 — Validate adaptations before service and update information

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to release the exact changed preparation and matching customer information.

**Acceptance criteria**

- AC1: Chef/director reviews exact differences before serving; cook cannot self-publish.
- AC2: Approval updates applicable public information version and records actual composition; rejection triggers proposal correction or actual-food disposition.
- AC3: An execution change does not edit standard/future recipes, duplicate full consumption or retrospectively prove prior correct communication.

**Implementation work packages**

- AP-077.T1: Implement version-bound change decision and affected-consumption adjustment.
- AP-077.T2: Connect publication/fallback and retained-preparation history.

**Depends on:** AP-025, AP-067, AP-069, AP-076.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04, UC-S08, F08, T06, DEC-033.

#### AP-078 — Track component production without individual plate capture

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to run free-choice service without per-customer data entry.

**Acceptance criteria**

- AC1: Record offered component/preparation batches and extra production, retaining indivisible mixed dishes where appropriate.
- AC2: Shared sides across mains keep one stock/batch identity; nominal percentages do not become observed customer choices.
- AC3: Traceability claims stop at known batch/service level and raw use still derives from production, not inferred plates.

**Implementation work packages**

- AP-078.T1: Implement component/service associations and aggregate production views.
- AP-078.T2: Connect per-component closing and actual POS granularity.

**Depends on:** AP-061, AP-073, AP-074, AP-075.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.11, DEC-056, T07, T09.

### E09 — Food safety procedures, controls and incidents

Support every applicable local safety workflow and preserve evidence/gaps.

#### AP-079 — Version establishment activities and sanitary profile

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a restaurant manager, I need to activate the controls matching actual operation.

**Acceptance criteria**

- AC1: Record local/central/satellite, channels/populations/processes/equipment/formalities and responsible substitutes.
- AC2: Applicable/not-applicable/unknown have justification; unknown never enables a simpler regime.
- AC3: Activity changes require profile review and preserve previously applied profile.

**Implementation work packages**

- AP-079.T1: Implement profile/formality records and evidence.
- AP-079.T2: Build setup and activity-change review.

**Depends on:** AP-005, AP-019, AP-020, AP-025.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S01, F01, RF-08.3, §21.1, DEC-036.

#### AP-080 — Version and activate validated PMS procedures

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a food safety lead, I need to use justified controls rather than universal defaults.

**Acceptance criteria**

- AC1: Procedure stores hazards, prerequisite/operational prerequisite/CCP classification, source/version, scope and validation.
- AC2: Limits/method/frequency/actions derive from competent local review and legal alternatives only where admitted.
- AC3: Activation is exact-version authorized; later changes do not rewrite historical assessments.

**Implementation work packages**

- AP-080.T1: Implement procedure/rule lifecycle and source registry.
- AP-080.T2: Add validated configuration import/editor and review history.

**Depends on:** AP-005, AP-019, AP-025, AP-079.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S02, F02, RF-08.1, §21.2, §21.4, DEC-018, DEC-035.

#### AP-081 — Define reusable control, cycle and decision form schemas

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to support many safety cases without 32 separate mandatory screens.

**Acceptance criteria**

- AC1: Schema declares context/observations/units/methods/timing/evidence/authorized decisions per version.
- AC2: Task status, assessment status and incident status are separate.
- AC3: Unknown/not-applicable/estimated/measured remain distinguishable and legal settings cannot be silently weakened.

**Implementation work packages**

- AP-081.T1: Implement typed control/cycle/decision schemas and validation.
- AP-081.T2: Build preview using synthetic PMS configurations.

**Depends on:** AP-014, AP-016, AP-080.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §21.5, §21.8, §22.5, T08, DEC-036.

#### AP-082 — Review procedure changes and notify affected roles

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a food safety lead, I need to change future procedure use without erasing the past.

**Acceptance criteria**

- AC1: Show exact source/parameter difference and affected activities before activation.
- AC2: Existing observations retain applied procedure; open work requiring changed rules requests review.
- AC3: Updated instructions reach affected roles through recorded tasks without claiming competence from reading.

**Implementation work packages**

- AP-082.T1: Implement version impact review and communication requirements.
- AP-082.T2: Link changes to training/review task generation.

**Depends on:** AP-019, AP-080, AP-105.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S02, UC-S32, F02, F32.

#### AP-083 — Monitor storage temperature and assess affected goods

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a designated operator, I need to respond to storage failure using actual readings and exposure history.

**Acceptance criteria**

- AC1: Identify equipment/product category and air-vs-food readings with method/time.
- AC2: Out-of-rule or inconclusive result links potentially affected batches and immediate protection.
- AC3: Later normal reading never erases failed interval or automatically releases goods; unknown exposure remains unknown.

**Implementation work packages**

- AP-083.T1: Configure storage control through shared form.
- AP-083.T2: Link incident, equipment and affected-stock restrictions.

**Depends on:** AP-080, AP-086, AP-094, AP-099.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S05, F05, RF-08.

#### AP-084 — Guide workstation separation and cross-contamination prevention

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to follow local preparation hygiene and handling instructions.

**Acceptance criteria**

- AC1: Instructions match validated task/ingredient/utensil/surface context including relevant vegetable handling.
- AC2: Failures can interrupt/correct affected work and open incident.
- AC3: No generic chemical/concentration advice or inference of allergen safety from ingredient/photo alone.

**Implementation work packages**

- AP-084.T1: Provide contextual preparation instructions and observation form.
- AP-084.T2: Link relevant cleaning/incident records.

**Depends on:** AP-080, AP-086, AP-099.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S09, F09.

#### AP-085 — Record process-specific cooking controls

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to document required cooking evidence on the correct batch.

**Acceptance criteria**

- AC1: Actual time/core temperature/other validated parameters keep instrument/method and batch link.
- AC2: Hot-holding reference is not treated as universal cooking proof; special processes use qualified branch.
- AC3: Missing required observation stays pending; later readings preserve original failure and disposition.

**Implementation work packages**

- AP-085.T1: Configure cooking form and assessment.
- AP-085.T2: Associate batch, recheck and incident outcomes.

**Depends on:** AP-080, AP-086, AP-099.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S10, F10, §21.4.

#### AP-086 — Capture and assess actual observations without inventing compliance

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a designated operator, I need to record a valid observation or explicit gap under its procedure.

**Acceptance criteria**

- AC1: Store actual value/unit/object/method/observed-time/record-time/operator and exact rule version.
- AC2: Within-rule/deviation/inconclusive/pending and justified not-applicable are distinct outcomes.
- AC3: Missing expected value is never auto-filled, correction retains original and task completion does not close incident.

**Implementation work packages**

- AP-086.T1: Implement observation/assessment use cases and contextual form.
- AP-086.T2: Test missing/stale/incorrect-unit/out-of-rule data and correction.

**Depends on:** AP-019, AP-020, AP-024, AP-081.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-08, §21.5, T08, UC-S03, F03, DEC-018, DEC-035.

#### AP-087 — Record cooling cycles and conservation destination

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to document cooling as observed events rather than inferred sensor data.

**Acceptance criteria**

- AC1: Cycle keeps preparation/container IDs, start/required actual readings/end and destination.
- AC2: Validated applicable timing/temperature rule is versioned; incomplete start/readings/delay becomes inconclusive/deviation.
- AC3: Timer is not a sensor, two points do not generate measured continuous curve and offline does not waive physical control.

**Implementation work packages**

- AP-087.T1: Implement timed-cycle commands and cooling form.
- AP-087.T2: Test interruption/missing reading/late completion and protected-stock outcome.

**Depends on:** AP-080, AP-086, AP-099.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S11, F11, §21.4, T01.

#### AP-088 — Check eligibility and preserve reheating history

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to reheat only under the applicable validated process.

**Acceptance criteria**

- AC1: Review origin/conservation/deadline/prior cycles before starting linked cycle.
- AC2: Record actual observations and applicable duration/date-of-use restrictions.
- AC3: Rename/split/reprint never resets history and failed cycle does not return automatically to generic reuse.

**Implementation work packages**

- AP-088.T1: Implement reheating eligibility/cycle and result flow.
- AP-088.T2: Propagate history into service and disposition views.

**Depends on:** AP-080, AP-086, AP-099.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S12, F12, §21.4, T02.

#### AP-089 — Review distribution readiness and record replenishments

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a service team, I need to serve identified preparations with current information and applicable controls.

**Acceptance criteria**

- AC1: Readiness reviews approved composition/current information and necessary controls rather than declaring food safe by a button.
- AC2: Record exposed batches/times/replenishments separately from protected reserve.
- AC3: Different batch/composition retains traceability; unresolved critical information or display failure invokes proper review/contingency.

**Implementation work packages**

- AP-089.T1: Implement distribution readiness and batch-exposure records.
- AP-089.T2: Connect service-opening UI to control and publication states.

**Depends on:** AP-069, AP-077, AP-080, AP-086.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S13, F13, T01, T06.

#### AP-090 — Track retained reference samples and incident holds

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a designated operator, I need to retain required plats témoins separately from edible inventory.

**Acceptance criteria**

- AC1: Show covered dishes and justified profile-specific exceptions; record ID/service/batch/quantity/time/location.
- AC2: Apply validated storage/retention rule without attributing guidance sample grams as universal law.
- AC3: Incident hold prevents routine disposal; expiry enables reviewed disposal record rather than asserting physical action.

**Implementation work packages**

- AP-090.T1: Implement sample inventory and hold/disposal lifecycle.
- AP-090.T2: Add sample-missing and new-service sample scenarios.

**Depends on:** AP-080, AP-086, AP-104.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S14, F14, §21.4, T04.

#### AP-091 — Execute and verify cleaning/disinfection tasks

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a designated operator, I need to follow actual zone/equipment cleaning procedure.

**Acceptance criteria**

- AC1: Executor records required parameters and time separately from verifier/result.
- AC2: Failed cleaning preserves original and opens corrective action; unsupported chemical substitutions are not proposed.
- AC3: A photograph/checkmark is not microbiological effectiveness and no uniform frequency is inferred.

**Implementation work packages**

- AP-091.T1: Configure cleaning schedule/form and verification.
- AP-091.T2: Link incidents, methods and repeat execution.

**Depends on:** AP-080, AP-086, AP-099, AP-105.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S17, F17.

#### AP-092 — Report pest signs and follow interventions

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a designated operator, I need to protect potentially affected areas and food.

**Acceptance criteria**

- AC1: Record observed area/point/sign/evidence and affected objects with restricted map access.
- AC2: Intervention and effectiveness review remain open if signs persist.
- AC3: No external-provider contract is presumed legally mandatory and no observed sign is not absolute absence.

**Implementation work packages**

- AP-092.T1: Configure pest observation and intervention form.
- AP-092.T2: Link protective incidents and follow-up tasks.

**Depends on:** AP-080, AP-086, AP-099.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S18, F18.

#### AP-093 — Manage water, ice and food-contact steam issues

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a food safety lead, I need to apply the validated response to suspect supply or results.

**Acceptance criteria**

- AC1: Record source/point/uses, relevant notice/result/document and affected activities.
- AC2: Source changes/pending results/supply failure trigger required assessment and protective actions.
- AC3: Filter presence or resumed supply is not automatic potability/resolution; no improvised AI treatment instructions.

**Implementation work packages**

- AP-093.T1: Configure water source/use record and check form.
- AP-093.T2: Track incident, alternative supply and reviewed restart.

**Depends on:** AP-080, AP-086, AP-099.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S19, F19.

#### AP-094 — Maintain equipment and verify measuring instruments

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a designated operator, I need to know whether equipment and readings are fit for the process.

**Acceptance criteria**

- AC1: Equipment/instrument records keep method, intervention, result and applicable verification schedule.
- AC2: Failed/overdue checks prompt impact review for affected product/records and explicit availability state.
- AC3: Instrument adjustment preserves old readings; no universal annual calibration requirement is invented.

**Implementation work packages**

- AP-094.T1: Implement equipment/instrument lifecycle and maintenance form.
- AP-094.T2: Link actual readings, downtime and impact incidents.

**Depends on:** AP-080, AP-086, AP-099.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S20, F20.

#### AP-095 — Provide personnel hygiene instructions and restricted impediment reporting

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a team member, I need to communicate handling restrictions without exposing health details.

**Acceptance criteria**

- AC1: Provide role-relevant hygiene guidance from local procedure.
- AC2: Restricted operational impediment capture stores minimum necessary measures, not diagnoses on shared dashboards.
- AC3: Task substitution preserves real author; reading/checklist does not prove actual behavior or fitness.

**Implementation work packages**

- AP-095.T1: Implement instructions and restricted operational notice.
- AP-095.T2: Verify shared-device privacy and designated-recipient access.

**Depends on:** AP-010, AP-025, AP-080, AP-086.  
**Activation/readiness gates:** G-PMS, G-PRIVACY.  
**Spec trace:** UC-S21, F21.

#### AP-096 — Plan analyses and review laboratory results

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a food safety lead, I need to follow applicable microbiological and shelf-life verification.

**Acceptance criteria**

- AC1: Programme records category/criterion/sample/laboratory/method/result and supporting document chain.
- AC2: Distinguish safety vs process-hygiene criteria and applicable source versions including required Listeria update review.
- AC3: Inconclusive/unreadable is not satisfactory; OCR/one negative report does not certify all food and no generic monthly plan is imposed.

**Implementation work packages**

- AP-096.T1: Implement risk-configured analysis programme and result review.
- AP-096.T2: Link affected batches/processes and corrective actions.

**Depends on:** AP-080, AP-086, AP-099.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S22, F22, §21.2, S11, S12.

#### AP-097 — Qualify special food processes before enabling specialized forms

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a food safety lead, I need to support actual special activities without generic pseudo-validation.

**Acceptance criteria**

- AC1: Freezing/thawing/sous-vide/raw/mincing/preserving branches require declared activity, validated process and equipment.
- AC2: Each enabled branch stores its own prerequisites/limits/evidence and rejects copied unrelated thresholds.
- AC3: Already-occurred physical facts can be recorded without retroactive authorization; freezing does not rescue expired goods.

**Implementation work packages**

- AP-097.T1: Implement special-process profile and conditional forms.
- AP-097.T2: Validate actual enabled branches against local procedure.

**Depends on:** AP-079, AP-080, AP-086, AP-099.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S27, F27.

#### AP-098 — Support qualified dispatch, satellite receiving or donation

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a responsible operator, I need to retain origin-to-destination responsibility when these activities apply.

**Acceptance criteria**

- AC1: Require validated profile/formalities, recipient, eligible quantities/batches and relevant transport documents.
- AC2: Departure/arrival/acceptance differ and receiver discrepancies remain traceable.
- AC3: Donation bypasses no safety restriction; branch does not enable marketplace, assumed logistics role or live tracking.

**Implementation work packages**

- AP-098.T1: Configure actual dispatch/destination branch and documents.
- AP-098.T2: Link receiving/history and satellite-specific restrictions.

**Depends on:** AP-079, AP-080, AP-086, AP-099.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S28, F28, RF-06.

#### AP-099 — Handle deviation, protection, quarantine and disposition

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a responsible operator, I need to retain an auditable path from issue to reviewed resolution.

**Acceptance criteria**

- AC1: Capture initial known/estimated scope, original evidence, immediate physical protection, owner/action and permitted decision.
- AC2: Stock correction, task completion and safety release remain separate rights/states; unknown cause stays explicit.
- AC3: Urgency does not await app approval; verified closure or re-open preserves history and disposal posts only once.

**Implementation work packages**

- AP-099.T1: Implement incident/restriction/decision lifecycle.
- AP-099.T2: Connect controls/receiving/use to protection and reviewed closure.

**Depends on:** AP-019, AP-025, AP-043, AP-080.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S23, F23, RF-07, RF-08, §21.5, T08.

#### AP-100 — Trace and coordinate withdrawal/recall

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a food safety lead, I need to locate affected stock and recorded services without inventing reach.

**Acceptance criteria**

- AC1: Search product/batch/receipts/current quantities/preparations/services/known professional recipients.
- AC2: Block eligible suggestions and coordinate actual isolation/retrieval with known gaps shown.
- AC3: Internal notice is not external recall; prepare communications but do not send without explicit authorization or collect diner identities by default.

**Implementation work packages**

- AP-100.T1: Implement trace graph/search and recall action list.
- AP-100.T2: Link incident holds, evidence and authorized communication records.

**Depends on:** AP-020, AP-043, AP-072, AP-075, AP-099, AP-104.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S24, F24, §19.

#### AP-101 — Record TIAC suspicion and preserve emergency evidence

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a food safety lead, I need to follow validated real-world emergency channels without waiting for AI.

**Acceptance criteria**

- AC1: Emergency registration remains possible with incomplete profile and shows validated contacts or explicit missing-contact contingency.
- AC2: Preserve actual menu/batches/controls/samples and evidence holds; diagnosis is not delegated to AI.
- AC3: App entry does not mean authority notified; restricted actual-notification references remain separate from general dashboards.

**Implementation work packages**

- AP-101.T1: Implement emergency incident path and preservation commands.
- AP-101.T2: Provide offline contingency access and restricted file assembly.

**Depends on:** AP-006, AP-010, AP-020, AP-099, AP-104.  
**Activation/readiness gates:** G-PMS, G-PRIVACY.  
**Spec trace:** UC-S25, F25.

#### AP-102 — Export an authorized inspection and traceability dossier

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a restaurant manager, I need to retrieve readable evidence with versions and explicit gaps.

**Acceptance criteria**

- AC1: Filter authorized site/period/lot/service and export profile/PMS/observations/incidents/evidence.
- AC2: Missing tasks, late entries, demo records and unknown trace links are never hidden or relabelled as real complete compliance.
- AC3: Export enforces private access and includes original/amended values and applied procedures.

**Implementation work packages**

- AP-102.T1: Implement dossier query/export and manifest.
- AP-102.T2: Verify scoped retrieval and incomplete-file cases.

**Depends on:** AP-020, AP-024, AP-086, AP-099, AP-104.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** UC-S26, F26, RF-11.

#### AP-103 — Record training, understanding checks and PMS improvement

**Type:** Story · **Scope:** CONDITIONAL · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a restaurant manager, I need to improve actual practice after procedure changes or recurring issues.

**Acceptance criteria**

- AC1: Associate role/person/procedure with instruction/training activity and adopted understanding check.
- AC2: No invented certificate renewal or competence inferred from reading alone.
- AC3: Review recurring deviations and action effectiveness; AI summary cannot change limits or close cases autonomously.

**Implementation work packages**

- AP-103.T1: Implement training/review records and improvement actions.
- AP-103.T2: Link procedure revisions and follow-up ownership.

**Depends on:** AP-080, AP-086, AP-099, AP-105.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** UC-S32, F32, §21.3.

#### AP-104 — Enforce retention schedules and investigation holds

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a restaurant manager, I need to keep evidence available for its validated purpose.

**Acceptance criteria**

- AC1: Apply category-specific retention from reviewed policy with separately tracked sample retention.
- AC2: Authorized incident hold suspends relevant deletion/disposal and records scope/reason/release.
- AC3: Deletion/hold changes are audited; no universal photo duration or silent loss of unsynced data.

**Implementation work packages**

- AP-104.T1: Implement retention policy/hold evaluation and dry-run report.
- AP-104.T2: Verify hold propagation and authorized release.

**Depends on:** AP-010, AP-019, AP-020, AP-024.  
**Activation/readiness gates:** G-PRIVACY.  
**Spec trace:** UC-S14, UC-S25, UC-S26, F14, F25, F26, §14.

#### AP-105 — Schedule applicable controls and record omissions

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a designated operator, I need to see the right routine or event-triggered safety work.

**Acceptance criteria**

- AC1: Tasks derive from actual site/service/calendar/procedure, with assigned owner/substitute and relevant context.
- AC2: Performed, late, omitted and justified not-applicable differ; never copy prior reading.
- AC3: Reminder created/sent/delivered states differ and completing task cannot close its incident.

**Implementation work packages**

- AP-105.T1: Implement calendar/event task generation and execution states.
- AP-105.T2: Show role-relevant service queue and missed-control follow-up.

**Depends on:** AP-022, AP-025, AP-080, AP-086.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** UC-S03, F03, RF-09, T01.

### E10 — Closing, leftovers, eligible reuse and labels

Distinguish remaining food, disposal and authorized prepared stock.

#### AP-106 — Capture and validate estimated component leftovers

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to close service with realistic quantity quality and chef review.

**Acceptance criteria**

- AC1: Cooks including sous-chef record preparation/batch amount/unit/estimated or measured basis, author/time; no per-diner capture.
- AC2: Chef validates exact version or returns correction; validation does not turn estimate into measurement.
- AC3: Unknown is not zero; production/sales gaps and shared components remain visible without duplicated leftovers.

**Implementation work packages**

- AP-106.T1: Implement closing draft/review lifecycle.
- AP-106.T2: Connect production totals, unimported-sales state and component quantities.

**Depends on:** AP-025, AP-074, AP-078.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-10, RF-13, T09, DEC-044, DEC-056.

#### AP-107 — Classify surplus eligibility and authorize its destination

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to distinguish protected surplus from ineligible exposed or returned food.

**Acceptance criteria**

- AC1: Review actual origin/exposure/thermal/storage history and profile-specific satellite rules.
- AC2: Chef or designated responsible decides without mandatory joint signature; insufficient information never grants generic tomorrow expiry.
- AC3: Quantity validation and safety release differ; immediate protective handling does not await administrative approval.

**Implementation work packages**

- AP-107.T1: Implement candidate/blocked/released/disposed prepared-stock decision.
- AP-107.T2: Link supporting cycles, evidence and actual destination.

**Depends on:** AP-006, AP-045, AP-080, AP-088, AP-099, AP-106.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** RF-13, UC-S15, F15, §21.4, T05, DEC-032, T09.

#### AP-108 — Allocate retained prepared stock and record later reuse

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to carry eligible prepared food into a new service without repeating raw use.

**Acceptance criteria**

- AC1: Store preparation/batch/container quantities separately from raw stock with source/composition/thermal history.
- AC2: Partial consumption/disposal and split containers update the same stock once.
- AC3: New plan shows eligible carryover separately from new-production need; reuse never resets deadline or constitutes measured waste savings.

**Implementation work packages**

- AP-108.T1: Implement prepared-stock carryover, allocation and consumption.
- AP-108.T2: Verify split/partial-use and changed-service history.

**Depends on:** AP-043, AP-065, AP-075, AP-107.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-13, RF-04.7, UC-S15, F15, DEC-051, T09.

#### AP-109 — Generate compact printable bac labels

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to identify retained containers with necessary readable fields.

**Acceptance criteria**

- AC1: Preview name, production date/time where applicable, validated use deadline and short authorized-lookup ID.
- AC2: Small adhesive format is the direction, but no printer/dimensions or universal legal-minimum content is assumed.
- AC3: Draft clearly indicates pending release/date; reprint creates neither stock nor extended expiry; QR optional.

**Implementation work packages**

- AP-109.T1: Implement configurable print/PDF payload and versioned preview.
- AP-109.T2: Record container split/label replacement and retry behavior.

**Depends on:** AP-006, AP-019, AP-020, AP-107, AP-108.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** RF-13, UC-S16, F16, §24.4, T09.

#### AP-110 — Record disposal and known destinations without double deduction

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a cook, I need to distinguish physical disposal from unexplained discrepancies.

**Acceptance criteria**

- AC1: Record object/category/cause/amount/unit/quality/observed destination with actual execution state.
- AC2: Raw stock disposal posts once; prepared food whose raw ingredients were already consumed does not deduct them again.
- AC3: Later waste collection or corrected classification does not repost disposal; unknown production-minus-sales remains unresolved.

**Implementation work packages**

- AP-110.T1: Implement destination/disposal commands and ledger linkage.
- AP-110.T2: Connect hygienic waste handling and estimate/measured reporting.

**Depends on:** AP-017, AP-043, AP-099, AP-106.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-10, UC-S29, F29, T09.

#### AP-111 — Compare expected cleaning loss with observed disposal

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to understand preparation loss without presenting a reference as measured rubbish.

**Acceptance criteria**

- AC1: Expected gross-minus-net remains recipe reference; observed disposal/reused trimmings/unknown destination remain separate.
- AC2: Aggregate comparable cleaning rate uses sum differences divided by sum gross, not unweighted percentage average.
- AC3: No mixed incompatible units, automatic disposal events or retrospective reference rewrite.

**Implementation work packages**

- AP-111.T1: Implement reference-versus-observation indicators.
- AP-111.T2: Expose coverage/source/period and known destination differences.

**Depends on:** AP-054, AP-110.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.5, RF-10, DEC-045, DEC-046.

### E11 — Innovorder imports and assisted forecasting

Build comparable dish history and explainable quantity recommendations.

#### AP-112 — Preview Innovorder CSV/XLSX sales imports

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to see actual export contents and unresolved interpretation before applying.

**Acceptance criteria**

- AC1: Import scope captures site/period/source/units and preserves original file.
- AC2: Use reviewed actual schema; invalid/empty/incompatible data produces no silent writes.
- AC3: Preview rows/mapping needs/totals, without allocating weekly totals to fictional daily services.

**Implementation work packages**

- AP-112.T1: Implement export parser and staged import preview.
- AP-112.T2: Add authorized anonymized or synthetic schema fixtures.

**Depends on:** AP-004, AP-014, AP-020, AP-024.  
**Activation/readiness gates:** G-DATA.  
**Spec trace:** RF-13.1, T10, DEC-027.

#### AP-113 — Map till articles to dish identity and effective recipe version

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to keep comparable history despite names and menu changes.

**Acceptance criteria**

- AC1: Prefer verified stable code where present; name suggestions require reviewed mapping.
- AC2: Map reused articles by effective date/service and preserve rename/version history.
- AC3: Unmapped article never silently creates/merges a recipe or invents side choices.

**Implementation work packages**

- AP-113.T1: Implement effective article-to-dish mapping.
- AP-113.T2: Build match-review UI and unresolved row state.

**Depends on:** AP-052, AP-064, AP-112.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-13, RF-13.1, RF-04.11, DEC-026, T10.

#### AP-114 — Interpret options, cancellations and import corrections once

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to obtain net sales without double counting exports or adjustments.

**Acceptance criteria**

- AC1: Document bundle/option/weight units and whether export already nets cancellations.
- AC2: Same-file/op retry changes no totals; revised file updates matched prior scope with retained history.
- AC3: Manual/future API overlap is identifiable; cancellation and counter-entry remain auditable and raw stock is untouched.

**Implementation work packages**

- AP-114.T1: Implement import reconciliation and deduplication.
- AP-114.T2: Verify bundle/refund/revised-period fixtures before confirmation.

**Depends on:** AP-017, AP-019, AP-112, AP-113.  
**Activation/readiness gates:** G-DATA.  
**Spec trace:** RF-13.1, T10, §19, DEC-027.

#### AP-115 — Build dish execution and component-history views

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to compare what was planned, produced, sold and left.

**Acceptance criteria**

- AC1: History shows stable dish/version/site/service plus planned/declared production, net sales, known non-sale outflow and stockout.
- AC2: No offering/closed day is not zero demand; recorded stockout means constrained sales, not invented lost demand.
- AC3: Component apparent outflow uses compatible known inputs/destinations and stays estimated; no nominal percentage allocation of sales.

**Implementation work packages**

- AP-115.T1: Implement chronological history/read models.
- AP-115.T2: Surface missing sales/leftovers, competitors and reference changes where available.

**Depends on:** AP-078, AP-106, AP-110, AP-114.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-13, RF-04.11, DEC-026, DEC-056.

#### AP-116 — Provide cold-start and transparent baseline quantity suggestions

**Type:** Story · **Scope:** MVP · **Priority:** P1 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to plan with useful references even when history is sparse.

**Acceptance criteria**

- AC1: No usable history offers manual chef reference explicitly without a fake historical forecast.
- AC2: Limited comparable history shows indicative average, count/period/selection and gaps.
- AC3: Demand suggestion differs from ingredient capacity and carryover stock; no invented interval or guaranteed precision.

**Implementation work packages**

- AP-116.T1: Implement baseline/chef-input forecast adapter.
- AP-116.T2: Expose evidence/history and fallback in planner.

**Depends on:** AP-004, AP-063, AP-115.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-13, DEC-025, DEC-028, §11.2, DEC-026.

#### AP-117 — Review and apply assisted forecast quantities

**Type:** Story · **Scope:** MVP · **Priority:** P1 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to control changes to planned quantities.

**Acceptance criteria**

- AC1: Suggestion keeps input snapshot/method version/horizon/limitations and manual adjustment reason.
- AC2: Only explicit chef confirmation changes the exact current plan; changed inputs require revalidation.
- AC3: Decline or model failure keeps manual planning; apply starts no production/reservation/purchase/publication and later recompute never overwrites approved quantity.

**Implementation work packages**

- AP-117.T1: Implement suggestion decision and plan-apply command.
- AP-117.T2: Build compare/accept/edit/reject with version feedback.

**Depends on:** AP-017, AP-019, AP-025, AP-065, AP-116.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-13, DEC-028, T04, DEC-007.

#### AP-118 — Evaluate forecast candidates chronologically

**Type:** Enabler · **Scope:** MVP · **Priority:** P1 · **Stage:** S5 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the quality team, I need to decide whether complexity improves on a baseline with available data.

**Acceptance criteria**

- AC1: Split train/evaluation by time without future observations or post-event features.
- AC2: Compare error/bias and chef/baseline results with coverage, stockout and low-demand treatment.
- AC3: No model promotion without documented review; insufficient data records not evaluable and does not remove assisted MVP planning.

**Implementation work packages**

- AP-118.T1: Implement reproducible dataset/evaluation report.
- AP-118.T2: Define reviewable promotion and rollback criteria without selecting a provider.

**Depends on:** AP-008, AP-115, AP-116.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-13, §11.2, DEC-028.

#### AP-119 — Preserve forecast decisions and method rollback

**Type:** Enabler · **Scope:** MVP · **Priority:** P1 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to audit forecast changes and recover from a poor method.

**Acceptance criteria**

- AC1: Version dataset references, method/settings, suggestion and confirmed/adjusted outcome separately.
- AC2: Retiring a method preserves previous explanations and exact applied plan.
- AC3: Return to transparent baseline/manual planning on failure without erasing evidence.

**Implementation work packages**

- AP-119.T1: Implement forecast-run registry and adapter selection.
- AP-119.T2: Verify replay, failure fallback and rollback behavior.

**Depends on:** AP-019, AP-116, AP-117.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-13, §11.2, §14, DEC-028.

#### AP-120 — Qualify cafeteria sales and product usage without meal assumptions

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to cover selected cafeteria products at their real granularity.

**Acceptance criteria**

- AC1: Selected drinks/ready articles keep compatible units and source channel while sharing stock with kitchen.
- AC2: No assumption every beverage is packaged or every cafeteria sale equals a lunch portion.
- AC3: Actual usage/outflow method is reviewed before claims of complete balance; API/second till/food-production scope is not inferred.

**Implementation work packages**

- AP-120.T1: Document selected cafeteria article-to-stock rules.
- AP-120.T2: Implement permitted recorded outflows/history at approved scope.

**Depends on:** AP-002, AP-004, AP-043, AP-114.  
**Activation/readiness gates:** G-DATA.  
**Spec trace:** §4, §23.1, RF-03.1, RF-13.

### E12 — Stock-aware AI assistance and evaluation

Provide useful chef-controlled suggestions with bounded tools and provenance.

#### AP-121 — Provide typed bounded AI orchestration

**Type:** Enabler · **Scope:** MVP · **Priority:** P1 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to separate generated proposals from deterministic operational authority.

**Acceptance criteria**

- AC1: Harness authorizes scope and typed tools, validates structured outputs and bounds time/retries/steps/cost.
- AC2: Model never writes database directly, approves safety release, invents stock or treats retrieved documents as privileged instructions.
- AC3: Failures yield explicit recoverable/manual fallback and logged provenance without secrets or unnecessary personal data.

**Implementation work packages**

- AP-121.T1: Implement provider-independent orchestration/tool ports.
- AP-121.T2: Add invalid-output, prompt-injection and tool-failure fixtures.

**Depends on:** AP-012, AP-016, AP-021, AP-024.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §11, §21.9.

#### AP-122 — Retrieve authorized recipes, procedures and current stock context

**Type:** Story · **Scope:** MVP · **Priority:** P1 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to receive suggestions grounded in permitted references.

**Acceptance criteria**

- AC1: Filter tenant/site before model retrieval and retain version/date/source.
- AC2: Use deterministic capacity/eligibility results, not model-produced arithmetic.
- AC3: No unreviewed stale procedure or other customer data becomes authoritative; insufficient evidence is explicit.

**Implementation work packages**

- AP-122.T1: Implement scoped retrieval adapters and context builder.
- AP-122.T2: Verify leakage, stale-source and contradictory-source cases.

**Depends on:** AP-024, AP-033, AP-056, AP-063, AP-080, AP-121.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §11.1, RF-04.4, §21.9.

#### AP-123 — Search dishes by theme and present origin-labelled results

**Type:** Story · **Scope:** MVP · **Priority:** P1 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to discover relevant dishes such as Thai cuisine from a clear search bar.

**Acceptance criteria**

- AC1: Prioritize appropriate validated own recipes and distinguish drafts/AI ideas/licensed external references.
- AC2: Each result shows relevance, stock matches, confirmed shortage vs unknown, source/status and limitations.
- AC3: No claim of web search/authenticity without evidence, fabricated references or whole-recipe feasibility for unquantified ideas.

**Implementation work packages**

- AP-123.T1: Implement thematic query/results UI and structured result schema.
- AP-123.T2: Connect scoped retrieval and manual recipe search fallback.

**Depends on:** AP-056, AP-066, AP-121, AP-122.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.4, DEC-007, DEC-055, T05.

#### AP-124 — Open existing recipes or create AI-assisted drafts

**Type:** Story · **Scope:** MVP · **Priority:** P1 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to turn useful ideas into reviewed local recipes.

**Acceptance criteria**

- AC1: Existing result opens referenced version without duplicate recipe.
- AC2: New permitted idea creates draft with human author plus AI/source provenance separately.
- AC3: Draft completion and chef validation remain required; selection does not publish, consume, purchase or grant cook products.

**Implementation work packages**

- AP-124.T1: Implement result-to-version/draft actions.
- AP-124.T2: Route incomplete ingredients/yields/weights/nutrition into existing recipe review.

**Depends on:** AP-017, AP-033, AP-052, AP-056, AP-123.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.4, RF-04.8, DEC-055, T05.

#### AP-125 — Recommend stock-aware menu choices and revalidate acceptance

**Type:** Story · **Scope:** MVP · **Priority:** P1 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to consider ingredient availability and near deadlines without losing choice.

**Acceptance criteria**

- AC1: Show eligible quantities/quality/use dates, limiting ingredients, reasons and impact on joint plan.
- AC2: Alternative candidates share the same supply pools; accepting one recalculates remaining alternatives.
- AC3: Accept/edit/reject possible; apply once to draft after revalidation, with no publication, reservation or raw consumption.

**Implementation work packages**

- AP-125.T1: Implement candidate assessment and chef decision command.
- AP-125.T2: Connect plan difference preview and known shortage conditional options.

**Depends on:** AP-017, AP-045, AP-063, AP-065, AP-123, AP-124.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.4, DEC-007, T05.

#### AP-126 — Suggest portion weights and composition with dietary sources

**Type:** Story · **Scope:** MVP · **Priority:** P1 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to review balanced-food and stock-use advice without unsupported clinical claims.

**Acceptance criteria**

- AC1: Use eligible stock/yields/joint plan and sourced general adult/weekly guidance, not inventory alone.
- AC2: Show proposed grams/percentages vs current reference, deterministic impacts and assumptions.
- AC3: Chef accepts/edits/rejects; unavailable data/model keeps manual editing, no 40/20/40 universal rule or personal health collection.

**Implementation work packages**

- AP-126.T1: Implement portion-advice structured proposal and source retrieval.
- AP-126.T2: Integrate comparison/acceptance with versioned portion editor.

**Depends on:** AP-059, AP-060, AP-061, AP-121, AP-122.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.10, DEC-054, §11.

#### AP-127 — Evaluate AI quality, permission boundaries and operating cost

**Type:** Enabler · **Scope:** MVP · **Priority:** P1 · **Stage:** S5 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the quality team, I need to review suggestion usefulness and constraints before pilot enablement.

**Acceptance criteria**

- AC1: Scenario set covers near expiry, unknown allergens, shared stock, substitutions, conflicting sources and cross-tenant/tool failures.
- AC2: Report groundedness/restriction violations/human intervention/latency/cost with explicit threshold decision.
- AC3: No autonomous plan/publication/safety effects, fabricated confidence or default shared customer training.

**Implementation work packages**

- AP-127.T1: Build versioned task fixtures and evaluation harness.
- AP-127.T2: Record evaluation decision, known limitations and manual-fallback behavior.

**Depends on:** AP-008, AP-121, AP-123, AP-125, AP-126.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §11.2, §21.9, §14.

#### AP-128 — Suggest label batch and date fields with human review

**Type:** Story · **Scope:** MVP · **Priority:** P1 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to reduce typing while retaining original evidence and uncertainty.

**Acceptance criteria**

- AC1: Extraction returns proposed fields tied to actual image/source and marks unreadable/uncertain output.
- AC2: Batch/date used operationally require human review; failing extraction leaves manual entry with photo status preserved.
- AC3: No silent approved-field overwrite, invented batch/expiry or claim of infallible recognition.

**Implementation work packages**

- AP-128.T1: Define lightweight extraction adapter/evaluation and manual fallback.
- AP-128.T2: Implement reviewable field proposals independent of chosen model/tool.

**Depends on:** AP-012, AP-020, AP-021, AP-024.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-07.1, RF-08.2, DEC-038, §11.

#### AP-129 — Retain limited AI context and recommendation provenance

**Type:** Enabler · **Scope:** MVP · **Priority:** P1 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to remember useful authorized context without turning memory into stock authority.

**Acceptance criteria**

- AC1: Persist only purposeful site/owner-scoped preferences or proposal context with review/expiry policy.
- AC2: Transactional balances, permissions and procedure approval are re-read from authorities, never memory.
- AC3: Log source/method/version and accepted/rejected outcome without storing unrestricted customer training material.

**Implementation work packages**

- AP-129.T1: Implement bounded preference/provenance storage where needed.
- AP-129.T2: Document unnecessary memory/agent/fine-tuning features as deferred.

**Depends on:** AP-010, AP-019, AP-121.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §11, §11.1.

### E13 — Offline continuity and shared-device recovery

Preserve individual observations through network and device changes.

#### AP-130 — Preload authorized dated service references

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a team member, I need to consult necessary information where signal fails.

**Acceptance criteria**

- AC1: Prepare only authorized site/service menus/recipes/tasks and appropriate product references.
- AC2: Show last update and do not guarantee first-ever offline access or live global availability.
- AC3: Sensitive cached information follows user/site and local access expiry policy.

**Implementation work packages**

- AP-130.T1: Implement local reference store and preload status.
- AP-130.T2: Verify unavailable-cache and stale-reference behavior on supported devices.

**Depends on:** AP-007, AP-012, AP-024, AP-028.  
**Activation/readiness gates:** G-DEVICE.  
**Spec trace:** §13.1, UC-S30, F30, T12, DEC-010.

#### AP-131 — Persist local drafts and actual observations safely

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a team member, I need to avoid losing production, receipt, control or leftover observations.

**Acceptance criteria**

- AC1: Local records keep original user/site/operation ID and observed/local times.
- AC2: Display saved locally only after confirmed persistence; storage failure shows recoverable error.
- AC3: Receipt drafts do not fabricate OFF data/usable global stock and control capture does not grant remote release.

**Implementation work packages**

- AP-131.T1: Implement allowed offline command drafts and persistence confirmation.
- AP-131.T2: Test interrupted save, restart and permission-limited task capture.

**Depends on:** AP-014, AP-017, AP-028, AP-130.  
**Activation/readiness gates:** G-DEVICE.  
**Spec trace:** §13.1, UC-S30, F30.

#### AP-132 — Persist offline photos and pending attachment status

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a storekeeper, I need to keep label evidence linked during a signal interruption.

**Acceptance criteria**

- AC1: Local image is associated with original draft/product/batch/user and actual persistence state.
- AC2: Unreadable/missing/locally saved/upload pending/upload failed remain distinct.
- AC3: Storage limits, logout/device loss and retry do not silently discard unsent evidence or mark server dossier complete.

**Implementation work packages**

- AP-132.T1: Implement local attachment queue and capacity/error feedback.
- AP-132.T2: Test record-before-photo and photo-before-record recovery.

**Depends on:** AP-020, AP-131.  
**Activation/readiness gates:** G-DEVICE.  
**Spec trace:** RF-08.2, §13.1, UC-S30, F30, DEC-038.

#### AP-133 — Display pending, synced and review-needed operation states

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a team member, I need to understand what actually reached the server.

**Acceptance criteria**

- AC1: Expose saved-local/waiting/syncing/synced/review-or-error states per operation and attachment.
- AC2: Server acceptance is not chef validation/publication/notification delivery.
- AC3: Session bar shows site/user/connectivity/pending count and supports manual recovery actions.

**Implementation work packages**

- AP-133.T1: Implement queue/read-status model and session indicators.
- AP-133.T2: Verify uncertain timeout and partially uploaded evidence UI.

**Depends on:** AP-017, AP-028, AP-131, AP-132.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §13.1, T12, UC-S30, F30.

#### AP-134 — Isolate offline data through logout and user switching

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a team member, I need to share a device without inheriting another operator’s pending content.

**Acceptance criteria**

- AC1: Switching retains original ownership/author; unauthorized operator cannot view or submit as themselves.
- AC2: Local login/offline access follows selected policy, with no assumed PIN-based new identity.
- AC3: Logout/revoke/wipe recovery protects access while preserving unsent evidence through explicit recovery policy.

**Implementation work packages**

- AP-134.T1: Implement per-identity queue encryption/access controls per ADR.
- AP-134.T2: Test user switch, session expiry, device theft and pending-recovery cases.

**Depends on:** AP-010, AP-012, AP-028, AP-131, AP-132.  
**Activation/readiness gates:** G-PRIVACY, G-DEVICE.  
**Spec trace:** §13.0, UC-S31, F31, T12, DEC-030.

#### AP-135 — Revalidate pending operations on synchronization

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to apply only still-authorized valid commands while retaining captured facts.

**Acceptance criteria**

- AC1: Server verifies tenant/site/identity/permission/current versions and original operation IDs.
- AC2: Refusal/revocation/conflict preserves evidence and original author for review, not last-write-wins.
- AC3: No offline approval/publication/shared stock claim becomes accepted merely because connectivity returns.

**Implementation work packages**

- AP-135.T1: Implement sync endpoint and per-operation validation outcome.
- AP-135.T2: Test two devices with stale recipe/grant/stock versions.

**Depends on:** AP-017, AP-024, AP-131, AP-134.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §13.1, UC-S30, F30, T12, DEC-010.

#### AP-136 — Recover duplicate and partial sync without hidden effects

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to resume safely after connection or app interruption.

**Acceptance criteria**

- AC1: Same operation ID is retried after uncertain response and results are retrieved before new submission.
- AC2: Record/attachment processing recovers independently without duplicate movements/photos.
- AC3: Automatic sending only where technically supported; manual sync remains available and no universal background guarantee.

**Implementation work packages**

- AP-136.T1: Implement bounded retry/resume and reconciliation UI.
- AP-136.T2: Test commit-then-disconnect, duplicate send and close/reopen.

**Depends on:** AP-017, AP-132, AP-133, AP-135.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §13.1, RF-07.2, UC-S30, F30.

#### AP-137 — Resolve late offline observations and version conflicts

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a responsible operator, I need to review true observations without corrupting current balances.

**Acceptance criteria**

- AC1: Preserve original observation/recipe/batch/author times alongside server receipt time.
- AC2: Show intervening movements/versions and require authorized safe resolution when reconciliation is ambiguous.
- AC3: Resolution uses attributable difference/reversal and does not reassign or delete historical physical facts.

**Implementation work packages**

- AP-137.T1: Implement conflict review contracts and authorized resolution.
- AP-137.T2: Verify count-after-use ordering, revoked grant and changed recipe scenarios.

**Depends on:** AP-019, AP-043, AP-135, AP-136.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-03.4, §13.1, T11, T12, UC-S30, F30.

#### AP-138 — Enforce offline decision limits and contingency access

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a team member, I need to work within clear boundaries during outages.

**Acceptance criteria**

- AC1: Cached approved content is read-only reference; new forecast/external lookup/shared approval requires supported connection.
- AC2: Offline cannot announce menu publication, remote safety release, delivered alert or fresh global stock.
- AC3: Validated emergency/alternative-information guidance remains accessible where prepared; device-loss/low-storage fallback is explicit.

**Implementation work packages**

- AP-138.T1: Implement capability availability and warning states.
- AP-138.T2: Verify local emergency guidance and manual fallback on real devices.

**Depends on:** AP-006, AP-007, AP-130, AP-133, AP-135.  
**Activation/readiness gates:** G-DEVICE, G-PMS.  
**Spec trace:** §13.1, UC-S25, UC-S30, F25, F30, DEC-010, T12.

### E14 — Tasks, alerts, reporting and pilot economics

Make follow-up actionable and measure value with explicit coverage.

#### AP-139 — Manage daily tasks, owners and hygienic waste routines

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a team member, I need to see actionable work with responsible follow-up.

**Acceptance criteria**

- AC1: Tasks keep site/service/routine/due-time/owner/substitute/context and completion evidence.
- AC2: Hygienic waste area/removal tasks remain distinct from physical food-disposal ledger entries.
- AC3: Overdue/completed/missing and incident status differ; reassignment preserves original history.

**Implementation work packages**

- AP-139.T1: Implement routine/event task lists and delegation.
- AP-139.T2: Configure actual waste-handling routine and link disposal references.

**Depends on:** AP-025, AP-105, AP-110.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-09, UC-S29, F29, T01.

#### AP-140 — Create actionable expiry, stock and deviation alerts

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to notice a relevant problem and the action I can take.

**Acceptance criteria**

- AC1: Alert states fact/source/time/severity/owner and links to permitted batch/control/task.
- AC2: Expiry alerts distinguish DLC/DDM/unknown dates and never release food or invent missing stock.
- AC3: Deduplicate repeated signals while preserving material changes and escalation ownership.

**Implementation work packages**

- AP-140.T1: Implement deterministic alert rules and lifecycle.
- AP-140.T2: Connect expiry, shortage, missed-control and deviation triggers.

**Depends on:** AP-045, AP-047, AP-066, AP-099, AP-105.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-11, RF-03, RF-08, T01.

#### AP-141 — Track notification delivery separately from alert existence

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a team member, I need to know whether a responsible person was actually notified.

**Acceptance criteria**

- AC1: Created/queued/sent/delivered-or-unverified/failed states reflect actual channel evidence.
- AC2: Failed send keeps alert visible and retry does not duplicate operational commands.
- AC3: Scope content to recipient permissions and do not expose sensitive attachment/health data; no channel/provider selected silently.

**Implementation work packages**

- AP-141.T1: Implement notification port and delivery-attempt records.
- AP-141.T2: Test channel failure, retry and unauthorized recipient cases.

**Depends on:** AP-018, AP-021, AP-024, AP-140.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-11, §14, UC-S03, F03.

#### AP-142 — Provide scoped operational reports and exports

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S4 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a restaurant manager, I need to review work with comparable definitions and gaps.

**Acceptance criteria**

- AC1: Reports expose period/site/coverage/freshness/method and estimated-vs-measured/pending-vs-validated states.
- AC2: UI and exports enforce identical access and metric definitions.
- AC3: Unreconciled sales, unknown quantities, incomplete controls and baseline limits stay explicit.

**Implementation work packages**

- AP-142.T1: Implement reporting read models and authorized exports.
- AP-142.T2: Add source drilldown and missing-data states.

**Depends on:** AP-024, AP-047, AP-102, AP-106, AP-114.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-11, §15.

#### AP-143 — Measure pilot adoption, effort and forecast usefulness

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S5 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a product owner, I need to assess whether daily work becomes easier.

**Acceptance criteria**

- AC1: Use agreed baseline and comparable end-to-end task observations including new Apptit entry effort.
- AC2: Useful adoption measures services/tasks/help/chef feedback, not logins alone.
- AC3: Separate declared quantities, physical differences, forecast edits and comparable scope with no invented reduction percentage.

**Implementation work packages**

- AP-143.T1: Implement minimal measurement collection and review report.
- AP-143.T2: Record qualitative operator feedback and confidence limitations.

**Depends on:** AP-008, AP-049, AP-117, AP-142.  
**Activation/readiness gates:** G-PILOT.  
**Spec trace:** §15, §23.2, DEC-055, DEC-002, DEC-005.

#### AP-144 — Track losses and pilot economic outcomes responsibly

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S5 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a restaurant manager, I need to understand losses and economics without false savings claims.

**Acceptance criteria**

- AC1: Waste/meal uses comparable recorded mass and valid meal denominator; missing units/costs prevent definitive totals.
- AC2: Separate expiry loss, observed discarded leftovers, reference cleaning difference and retained surplus.
- AC3: No automatic CO2/saved-meal/causal savings claims; SaaS revenue, services, commissions, GMV and attributable costs remain distinct.

**Implementation work packages**

- AP-144.T1: Implement defined loss/economic indicators from available facts.
- AP-144.T2: Show baseline/period/coverage and unpriced/unmeasured categories.

**Depends on:** AP-008, AP-110, AP-111, AP-142.  
**Activation/readiness gates:** G-PILOT.  
**Spec trace:** RF-10, §5, §15, §12, DEC-002.

### E15 — Operational UX and screen integration

Deliver a usable phone/tablet journey with task-oriented navigation.

#### AP-145 — Integrate the 12 operational screen contracts

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a team member, I need to navigate from service task to the correct contextual action.

**Acceptance criteria**

- AC1: Service/planning/stock/monitoring routes filter by capability and show user/site/network/freshness/pending count.
- AC2: All T01–T12 contracts link to functioning use cases when built, not static-button claims.
- AC3: Empty/loading/unknown/permission/error/stale states preserve context and offer permitted recovery.

**Implementation work packages**

- AP-145.T1: Implement navigation shell and screen orchestration.
- AP-145.T2: Maintain design-to-use-case route/state checklist.

**Depends on:** AP-024, AP-028, AP-133.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §24, T01, T02, T03, T04, T05, T06, T07, T08, T09, T10, T11, T12.

#### AP-146 — Build accessible touch controls and consistent terminology

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a team member, I need to operate short forms on phones/tablets under kitchen conditions.

**Acceptance criteria**

- AC1: French UI remains proposal pending language decision; consistent terminology and design tokens do not make English backlog a UI-language change.
- AC2: Touch targets/contrast/labels/errors are legible, state not color-only and camera/OCR have manual alternative.
- AC3: Frequent fields reuse safe references only; no extensive table-only mobile workflow.

**Implementation work packages**

- AP-146.T1: Implement shared tokens, forms, confirmations and status components.
- AP-146.T2: Verify keyboard/screen-reader basics and real-device legibility.

**Depends on:** AP-007, AP-013, AP-145.  
**Activation/readiness gates:** G-DEVICE.  
**Spec trace:** §13, §24, DEC-029.

#### AP-147 — Design extended PMS, incident and traceability administration

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S3 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a food safety lead, I need to complete workflows that were not drawn in the first 12 wireframes.

**Acceptance criteria**

- AC1: Provide required profile/PMS review, recall/TIAC containment and archive interactions for applicable cases.
- AC2: Common forms vary fields/time/permissions/effects by procedure rather than treat every incident as generic note.
- AC3: Document untested assumptions and role sequence; static HTML is not presented as complete functional UX.

**Implementation work packages**

- AP-147.T1: Create contextual form/state designs and navigation links.
- AP-147.T2: Review with competent restaurant operator before corresponding live use.

**Depends on:** AP-005, AP-006, AP-079, AP-081.  
**Activation/readiness gates:** G-PMS.  
**Spec trace:** §24.3, §21.8, §22.6, T08.

#### AP-148 — Design recipe, authorization and AI-search screen extensions

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S2 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a chef, I need to use newer approved recipe decisions absent from old wireframes.

**Acceptance criteria**

- AC1: Cover generic-product mapping, gross/net/loss, to-taste references, draft review and intermediate recipes.
- AC2: Include cook product grants, exact-set confirmation and thematic AI search with provenance.
- AC3: Keep proposed UI detail distinguishable from founder-approved behavior and preserve server enforcement.

**Implementation work packages**

- AP-148.T1: Design/update recipe and permission/search interactions.
- AP-148.T2: Check flows against RF-04.5–RF-04.13 and assignment behavior.

**Depends on:** AP-003, AP-006, AP-012, AP-052.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-01, RF-04.4, RF-04.5, RF-04.6, RF-04.7, RF-04.8, RF-04.9, RF-04.10, RF-04.11, RF-04.12, RF-04.13, §24.

#### AP-149 — Review end-to-end workflows with actual operators

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S5 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a product owner, I need to identify effort and comprehension problems before claiming usability.

**Acceptance criteria**

- AC1: Review receiving/partial acceptance/bag transfer with storekeeper, preparation/changes/signal loss with cook and plan/AI/publication/leftovers with chef.
- AC2: Include director substitution and shared-device handoff under individual identities.
- AC3: Observe errors/total effort and update proposals; no existing browser/usability tests are presumed passed.

**Implementation work packages**

- AP-149.T1: Run scripted sessions using complete selected recipes and safe fixtures.
- AP-149.T2: Record findings, remediation and unverified scenarios.

**Depends on:** AP-002, AP-007, AP-145, AP-146, AP-147, AP-148.  
**Activation/readiness gates:** G-LIVE, G-DEVICE, G-PMS.  
**Spec trace:** §24.5, §18, §15.

### E16 — Verification, operations and live-pilot release

Demonstrate critical invariants, recovery and actual operator readiness.

#### AP-150 — Establish meaningful CI and change verification

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S1 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to check contracts/invariants without claiming tests already passed.

**Acceptance criteria**

- AC1: CI runs chosen formatting/type/build checks and meaningful rule/integration tests for changed behavior.
- AC2: Secrets/configuration and dependency handling follow selected architecture; failures block promotion.
- AC3: Test fixtures are synthetic or explicitly permitted and distinguish demonstration from production.

**Implementation work packages**

- AP-150.T1: Configure GitHub Actions and test/build commands.
- AP-150.T2: Document risk-based verification evidence and release artifact lineage.

**Depends on:** AP-013, AP-016, AP-021.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §14, §18, §10.

#### AP-151 — Verify stock, recipe and receiving invariants end to end

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S5 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the quality team, I need to demonstrate core arithmetic and transactional behavior.

**Acceptance criteria**

- AC1: Cover partial receipt, two batches/quarantine, transfer totals, concurrent last quantity and retry after commit.
- AC2: Verify raw/net/gross/ready conversions, shared rice allocation, intermediate prepared stock and no double consumption.
- AC3: Test missing/unknown data, historical versions and negative/discrepancy policy without replacing physical truth.

**Implementation work packages**

- AP-151.T1: Build focused domain/integration fixtures and walkthrough.
- AP-151.T2: Record actual outcomes and unresolved failures before release.

**Depends on:** AP-039, AP-040, AP-044, AP-046, AP-054, AP-063, AP-073, AP-075, AP-150.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §19, §21.10, RF-03, RF-04.1.

#### AP-152 — Verify offline evidence, authorship and recovery on devices

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S5 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the quality team, I need to avoid silent data loss or false confirmation in weak-signal areas.

**Acceptance criteria**

- AC1: Test local-save failure, close/reopen, duplicate retry, partial image upload and commit-timeout.
- AC2: Test user switch/revoked session/lost device/two-device stale versions and original author preservation.
- AC3: No false shared approval/publication/alert-delivery/compliance states; document unsupported browser behavior.

**Implementation work packages**

- AP-152.T1: Execute real-device offline/reconnection matrix.
- AP-152.T2: Record recovery evidence and limitations for pilot training.

**Depends on:** AP-007, AP-050, AP-132, AP-134, AP-136, AP-137, AP-138, AP-150.  
**Activation/readiness gates:** G-DEVICE.  
**Spec trace:** §13, §21.10, T12.

#### AP-153 — Verify permission, allergen and public-information controls

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S5 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the quality team, I need to prevent unauthorized or stale safety-sensitive information.

**Acceptance criteria**

- AC1: Test cross-tenant/site/file/search/AI access, denied product use and exact bulk-grant scope.
- AC2: Changed actual product requires chef pre-service review; rejection preserves fact and public fallback remains required.
- AC3: Test blocked-food restrictions, source gaps, prompt injection and AI tool failures without a safety bypass.

**Implementation work packages**

- AP-153.T1: Execute negative authorization and change/publication scenarios.
- AP-153.T2: Review evidence against procedure-specific acceptance conditions.

**Depends on:** AP-024, AP-027, AP-069, AP-077, AP-099, AP-127, AP-150.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §19, §21.10, RF-01, RF-04.

#### AP-154 — Rehearse backup, restore and evidence retrieval

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S5 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the operations team, I need to recover transactional history and private evidence before live data.

**Acceptance criteria**

- AC1: Backups cover authoritative databases, attachment links and necessary configuration with documented retention/access.
- AC2: Restore drill verifies usable balances, recipe/procedure versions, authorship and incident holds.
- AC3: Set/review recovery objectives without invented approved SLA; store drill outcome and unresolved gaps.

**Implementation work packages**

- AP-154.T1: Implement backup/restore runbook and rehearsal environment.
- AP-154.T2: Test representative receipt-to-preparation trace after restore.

**Depends on:** AP-010, AP-015, AP-020, AP-104, AP-150.  
**Activation/readiness gates:** G-OPS.  
**Spec trace:** §14, §18, §21.10.

#### AP-155 — Instrument operational health and define performance budgets

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S5 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the operations team, I need to detect failures and size the actual pilot.

**Acceptance criteria**

- AC1: Measure service health, denied access, event/job lag, sync errors, undelivered alerts and AI cost without sensitive payload leakage.
- AC2: Agree common-action latency/availability/load/recovery budgets using actual sites/users/concurrency, not 400 lunches as concurrent users.
- AC3: Alert/runbook covers integration outage and degraded manual modes without representing failure as success.

**Implementation work packages**

- AP-155.T1: Add logs/metrics/tracing and health endpoints.
- AP-155.T2: Run proportionate load/failure checks and record agreed budgets.

**Depends on:** AP-007, AP-008, AP-018, AP-021, AP-141, AP-150.  
**Activation/readiness gates:** G-OPS.  
**Spec trace:** §14, §15.

#### AP-156 — Review live-pilot readiness and operational coverage

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S5 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a restaurant manager, I need to start real use only with accountable validated prerequisites.

**Acceptance criteria**

- AC1: Review permission/data authority, selected coverage/opening inventory, actual imports/PMS, roles/contingencies and device support.
- AC2: Every applicable safety activity has tested digital path or explicit operator-accepted transitional coverage; no silent future deferral.
- AC3: Record outstanding hardware choices separately; no code/test result is treated as restaurant authorization or safety certification.

**Implementation work packages**

- AP-156.T1: Assemble concrete readiness evidence and unresolved-item report.
- AP-156.T2: Record authorized go-live or targeted remediation without inventing sign-off.

**Depends on:** AP-001, AP-002, AP-003, AP-004, AP-005, AP-006, AP-008, AP-009, AP-010, AP-042, AP-102, AP-109, AP-114, AP-149, AP-151, AP-152, AP-153, AP-154, AP-155, AP-158.  
**Activation/readiness gates:** G-LIVE, G-DATA, G-PMS, G-DEVICE, G-PRIVACY, G-STOCK, G-OPS, G-PILOT.  
**Spec trace:** §18, §21.11, §24.4, §23, DEC-036.

#### AP-157 — Run the pilot and review acceptance evidence

**Type:** Story · **Scope:** MVP · **Priority:** P0 · **Stage:** S5 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a product owner, I need to decide next investment from observed use and economic results.

**Acceptance criteria**

- AC1: Collect agreed baseline/comparable service data, operator feedback and all added recording effort.
- AC2: Review estimate/measurement quality, forecasting utility, losses/destinations and incident handling with coverage stated.
- AC3: Prioritize remediation or expansion from evidence without asserting predetermined savings, adoption or causality.

**Implementation work packages**

- AP-157.T1: Execute agreed pilot observation/review cadence.
- AP-157.T2: Produce accepted findings and next-scope decision record.

**Depends on:** AP-008, AP-118, AP-143, AP-144, AP-156.  
**Activation/readiness gates:** G-PILOT.  
**Spec trace:** §15, §18, §23.2.

#### AP-158 — Define suspension and disabled-capability continuity

**Type:** Enabler · **Scope:** MVP · **Priority:** P0 · **Stage:** S5 · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the operations team, I need to avoid losing critical history when commercial/service state changes.

**Acceptance criteria**

- AC1: Define disabled integration/AI/manual-fallback behavior without silently selecting alternate live provider.
- AC2: Commercial suspension/downgrade preserves history and explicitly handles critical in-progress records.
- AC3: No billing/payment provider or product price is selected by this story; access/data rights follow agreed contract.

**Implementation work packages**

- AP-158.T1: Document capability/suspension state transitions and recovery.
- AP-158.T2: Verify in-progress record and evidence export behavior.

**Depends on:** AP-001, AP-010, AP-021, AP-024.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §14, §5.

### E17 — Deferred product and integration evolution

Preserve the broader vision without making it an MVP dependency.

#### AP-159 — Evaluate supplier marketplace and commercial offers

**Type:** Story · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** FUTURE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a product owner, I need to preserve future supplier commerce with clear contractual boundaries.

**Acceptance criteria**

- AC1: Define supplier onboarding/offers/prices/tax/minimums/substitutions/returns and responsibility before activation.
- AC2: Clarify attributable commission and negotiated terms; recorded external purchases do not automatically earn commission.
- AC3: No supplier commitment, marketplace price or customer-to-customer sale is inferred.

**Implementation work packages**

- AP-159.T1: Conduct supplier and operator discovery.
- AP-159.T2: Draft commercial/domain contracts for a later release.

**Depends on:** No hard item dependency; baseline/DoR applies.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-12, §5, §23, DEC-009.

#### AP-160 — Define purchase-order creation, approval and sending

**Type:** Story · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** FUTURE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a purchasing lead, I need to evolve shortages into explicit commercial commitments later.

**Acceptance criteria**

- AC1: Needs list remains separate from sent orders and recipient contact.
- AC2: Specify approval budgets, exact price/version, reapproval and idempotent send.
- AC3: Do not send a supplier message or assume a selected supplier in MVP.

**Implementation work packages**

- AP-160.T1: Design order/approval lifecycle and adapter contract.
- AP-160.T2: Plan partial delivery/cancellation/reordering cases.

**Depends on:** AP-066, AP-159.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-05, §23.

#### AP-161 — Extend full order-to-delivery tracking

**Type:** Story · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** FUTURE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a logistics lead, I need to distinguish supplier/carrier facts through partial deliveries.

**Acceptance criteria**

- AC1: Separate commercial confirmation, dispatch, arrival and checked receipt with source/time.
- AC2: ETA/location/real-time states require actual available source, otherwise identified manual updates.
- AC3: Late events/partial delivery/cancellation preserve outstanding quantities and cannot falsely regress state.

**Implementation work packages**

- AP-161.T1: Design supplier/carrier event adapters and timeline.
- AP-161.T2: Evaluate access, responsibility and provider costs.

**Depends on:** AP-039, AP-160.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-06, DEC-019, §16, UC-S28, F28.

#### AP-162 — Evaluate invoice matching and financial processes

**Type:** Story · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** FUTURE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a finance lead, I need to reconcile documents without rewriting physical receipts.

**Acceptance criteria**

- AC1: Compare ordered/received/invoiced quantities/prices and route differences to reviewed exception.
- AC2: OCR is draft extraction; price difference never silently approves payment.
- AC3: Inventory acceptance does not wait for invoice/payment and Apptit payment role is explicitly agreed.

**Implementation work packages**

- AP-162.T1: Model invoice/exception lifecycle and financial boundaries.
- AP-162.T2: Evaluate document extraction/contractual integration.

**Depends on:** AP-039, AP-160.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-12, §6.5.

#### AP-163 — Evaluate inter-site redistribution as a separate flow

**Type:** Story · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** FUTURE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a product owner, I need to avoid conflating surplus redistribution with supplier commerce.

**Acceptance criteria**

- AC1: Assess eligibility/ownership/transport/recipient responsibility and traceability for each proposed flow.
- AC2: Do not turn a catalogue page into cross-customer sales authority.
- AC3: Donation/dispatch profile does not automatically enable marketplace transactions.

**Implementation work packages**

- AP-163.T1: Conduct specific operator/legal/process discovery.
- AP-163.T2: Draft redistribution contracts and loss/return scenarios.

**Depends on:** AP-098, AP-159.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-12, §16.

#### AP-164 — Evaluate connected instruments and IoT supervision

**Type:** Enabler · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** FUTURE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to automate supported observations only after hardware qualification.

**Acceptance criteria**

- AC1: Identify actual sensors/probes, calibration/method/network and observed parameter semantics.
- AC2: Air/device readings never silently substitute food-core temperature.
- AC3: Define offline buffers/source integrity/maintenance/alert delivery without assuming infrared integration.

**Implementation work packages**

- AP-164.T1: Assess installation/support/cost and device adapters.
- AP-164.T2: Compare validated manual control coverage to proposed automation.

**Depends on:** AP-007, AP-083, AP-094.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §11, RF-08, §7.2.

#### AP-165 — Evaluate automatic Innovorder API synchronization

**Type:** Enabler · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** FUTURE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to replace file work only with confirmed access and reconciliation.

**Acceptance criteria**

- AC1: Verify authorized service account/scopes/cost/contracts/rate limits with actual operator/vendor.
- AC2: Support pagination/update checkpoints/cancellation-counterentries and file/manual overlap.
- AC3: Import only necessary aggregated data and preserve idempotency/history; public docs are not enabled access.

**Implementation work packages**

- AP-165.T1: Prototype read-only adapter using permitted environment.
- AP-165.T2: Specify migration and reconciliation from file imports.

**Depends on:** AP-004, AP-114.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-13.1, DEC-027.

#### AP-166 — Evaluate more advanced forecasting and additional signals

**Type:** Enabler · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** FUTURE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the quality team, I need to add complexity only with measured gain and usable inputs.

**Acceptance criteria**

- AC1: Compare candidate ML, attendance/weather or other signals with current chronological baselines.
- AC2: Verify source access/license/availability at prediction time and avoid duplicate attendance adjustments.
- AC3: Record benefit/cost/bias and rollback; no specific weather source, deep model or guaranteed uplift assumed.

**Implementation work packages**

- AP-166.T1: Create data-readiness and candidate experiment plan.
- AP-166.T2: Review promotion criteria against pilot evidence.

**Depends on:** AP-118, AP-157.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §11.2, RF-13.

#### AP-167 — Evaluate tray vision, advanced OCR, SLM and fine-tuning selectively

**Type:** Enabler · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** FUTURE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the quality team, I need to avoid building advanced AI before task evidence justifies it.

**Acceptance criteria**

- AC1: Treat tray-food estimation and automatic discrepancy detection as separate experiments, not MVP collection obligations.
- AC2: Use permitted datasets and compare accuracy/cost/latency/privacy with deterministic/manual alternatives.
- AC3: No missing measurement is filled as fact and no fine-tuning/shared training is assumed authorized.

**Implementation work packages**

- AP-167.T1: Define bounded task datasets/evaluation and consent/data-use needs.
- AP-167.T2: Propose only demonstrated useful model/agent enhancements.

**Depends on:** AP-127, AP-128, AP-157.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §11, §21.9, RF-08.2.

#### AP-168 — Evaluate licensed external recipes and nutritional datasets

**Type:** Story · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** FUTURE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a product owner, I need to enrich discovery without creating unlawful permanent recipe copies.

**Acceptance criteria**

- AC1: Verify provider availability/language/license/cache/storage/attribution and actual recipe yield/nutrition suitability.
- AC2: Distinguish own validated recipe, licensed external reference and AI idea.
- AC3: No provider/dataset, including previously discussed recipe APIs or nutrition references, is selected by mention.

**Implementation work packages**

- AP-168.T1: Compare a bounded set of primary-source terms and data examples.
- AP-168.T2: Draft adapter/import license constraints for review.

**Depends on:** AP-033, AP-059, AP-123.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.4, RF-04.9, §11.

#### AP-169 — Evaluate NOVYU advertising and public impact communication

**Type:** Story · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** FUTURE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a product owner, I need to extend screens without importing another business model by default.

**Acceptance criteria**

- AC1: Separate approved meal information from advertising/advertiser contracts and unbiased recommendations.
- AC2: Validate collective-catering suitability, programming and commercial terms rather than inherit NOVYU pricing.
- AC3: Public environmental metrics require scope/method/period; no automatic waste-toCO2 or saved-meal claims.

**Implementation work packages**

- AP-169.T1: Assess integration/business boundaries and stakeholder interest.
- AP-169.T2: Design separate campaign and publication contracts if later approved.

**Depends on:** AP-068, AP-144, AP-157.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §12, RF-04.3, DEC-008.

#### AP-170 — Select and qualify the display player later

**Type:** Enabler · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** HARDWARE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to complete physical display integration after the deferred hardware decision.

**Acceptance criteria**

- AC1: Record full budget/device/RAM/storage/power/cables/adapters/shipping and real network/screen compatibility.
- AC2: Yodeck remains rejected; no obsolete listing is treated as current complete offer.
- AC3: Validate restart/time/offline/expiry/revocation and actual visibility without third-party signage lock-in.

**Implementation work packages**

- AP-170.T1: Identify existing installation and current complete options when selection is reopened.
- AP-170.T2: Run actual hardware acceptance against browser display contract.

**Depends on:** AP-007, AP-068, AP-069.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-04.2, RF-04.3, DEC-013, DEC-014, DEC-015.

#### AP-171 — Select and qualify the small adhesive-label printer later

**Type:** Enabler · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** HARDWARE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As the engineering team, I need to complete printing with readable labels suited to real bacs.

**Acceptance criteria**

- AC1: Printer/type/dimensions/adhesive are selected only when the deferred decision is reopened.
- AC2: Test legibility/storage conditions/name/dates and any optional code without assuming equipment already available.
- AC3: Reprints never renew date/create stock; offline print/release behavior needs explicit qualification.

**Implementation work packages**

- AP-171.T1: Identify actual equipment and compatible print workflow.
- AP-171.T2: Run physical label/readability and retry tests.

**Depends on:** AP-109.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** RF-13, UC-S16, F16, §24.4.

#### AP-172 — Qualify additional catering segments and enterprise needs

**Type:** Story · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** FUTURE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a product owner, I need to extend proven core without assuming generic restaurant suitability.

**Acceptance criteria**

- AC1: Assess schools/hospitals/EHPAD/central-satellite/traditional service, clinical diets and their own processes.
- AC2: Evaluate multi-site enterprise/SSO/BI needs and contractual roles from evidence.
- AC3: Do not infer personal health collection, children’s portion rules or existing customer adoption from pilot scope.

**Implementation work packages**

- AP-172.T1: Conduct segment-specific discovery and pricing/support analysis.
- AP-172.T2: Define separate profile/integration stories only after decisions.

**Depends on:** AP-157.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §4, §5, §7.2.

#### AP-173 — Validate commercial packaging and billing needs

**Type:** Story · **Scope:** DEFERRED · **Priority:** P2 · **Stage:** FUTURE · **Status:** Proposed · **Estimate:** Unestimated

**Outcome:** As a product owner, I need to price a sustainable product from costs and willingness to pay.

**Acceptance criteria**

- AC1: Historic 199/499 euro plans and commission examples remain hypotheses.
- AC2: Separate SaaS/service/marketplace/GMV and deployment/support/AI costs.
- AC3: Define trial/suspension/export terms before enabling billing; no payment provider or subscription amount assumed approved.

**Implementation work packages**

- AP-173.T1: Conduct pilot willingness-to-pay and cost review.
- AP-173.T2: Draft plan/entitlement/billing requirements for later agreement.

**Depends on:** AP-144, AP-157, AP-158.  
**Activation/readiness gates:** Applicable release gates and definition of done.  
**Spec trace:** §5, §15, RF-12, DEC-009.

## 8. Requirement coverage matrix

Exact requirement IDs from the v0.80 English baseline are retained. Parent and child rows may reference complementary items. A mapped item is planned coverage, not delivery evidence.

| Requirement | Backlog items |
| --- | --- |
| RF-01 | AP-006, AP-019, AP-022, AP-023, AP-024, AP-025, AP-026, AP-027, AP-070, AP-148, AP-153 |
| RF-02 | AP-029, AP-031 |
| RF-02.1 | AP-012, AP-029, AP-030, AP-031, AP-032, AP-033 |
| RF-03 | AP-009, AP-017, AP-039, AP-043, AP-045, AP-046, AP-140, AP-151 |
| RF-03.1 | AP-002, AP-009, AP-042, AP-047, AP-120 |
| RF-03.2 | AP-041, AP-044 |
| RF-03.3 | AP-009, AP-049, AP-050, AP-073, AP-074 |
| RF-03.4 | AP-009, AP-047, AP-048, AP-049, AP-050, AP-137 |
| RF-03.5 | AP-026, AP-070, AP-071, AP-076 |
| RF-04 | AP-006, AP-052, AP-058, AP-062, AP-064, AP-065, AP-067, AP-072, AP-073, AP-074, AP-076, AP-077, AP-153 |
| RF-04.1 | AP-046, AP-053, AP-062, AP-063, AP-065, AP-151 |
| RF-04.2 | AP-067, AP-068, AP-069, AP-170 |
| RF-04.3 | AP-068, AP-069, AP-169, AP-170 |
| RF-04.4 | AP-033, AP-122, AP-123, AP-124, AP-125, AP-148, AP-168 |
| RF-04.5 | AP-014, AP-019, AP-054, AP-062, AP-111, AP-148 |
| RF-04.6 | AP-027, AP-029, AP-032, AP-052, AP-053, AP-063, AP-148 |
| RF-04.7 | AP-057, AP-063, AP-075, AP-108, AP-148 |
| RF-04.8 | AP-019, AP-052, AP-056, AP-124, AP-148 |
| RF-04.9 | AP-014, AP-033, AP-058, AP-059, AP-060, AP-148, AP-168 |
| RF-04.10 | AP-060, AP-061, AP-126, AP-148 |
| RF-04.11 | AP-061, AP-078, AP-113, AP-115, AP-148 |
| RF-04.12 | AP-055, AP-148 |
| RF-04.13 | AP-003, AP-051, AP-148 |
| RF-05 | AP-066, AP-160 |
| RF-06 | AP-098, AP-161 |
| RF-07 | AP-037, AP-038, AP-040, AP-099 |
| RF-07.1 | AP-032, AP-034, AP-035, AP-036, AP-039, AP-128 |
| RF-07.2 | AP-017, AP-034, AP-037, AP-039, AP-040, AP-136 |
| RF-08 | AP-083, AP-086, AP-099, AP-140, AP-164 |
| RF-08.1 | AP-005, AP-036, AP-080 |
| RF-08.2 | AP-010, AP-020, AP-031, AP-035, AP-058, AP-072, AP-128, AP-132, AP-167 |
| RF-08.3 | AP-005, AP-079 |
| RF-09 | AP-105, AP-139 |
| RF-10 | AP-106, AP-110, AP-111, AP-144 |
| RF-11 | AP-102, AP-140, AP-141, AP-142 |
| RF-12 | AP-159, AP-162, AP-163, AP-173 |
| RF-13 | AP-006, AP-106, AP-107, AP-108, AP-109, AP-113, AP-115, AP-116, AP-117, AP-118, AP-119, AP-120, AP-166, AP-171 |
| RF-13.1 | AP-004, AP-112, AP-113, AP-114, AP-165 |

## 9. Safety use-case and workflow coverage

Each row maps both the use case and its matching in-product flow. Applicability and shared infrastructure are defined above; a deferred physical printer is not permission to omit applicable identification/labeling.

| Use case | Workflow | Backlog items |
| --- | --- | --- |
| UC-S01 | F01 | AP-005, AP-079 |
| UC-S02 | F02 | AP-080, AP-082 |
| UC-S03 | F03 | AP-086, AP-105 |
| UC-S04 | F04 | AP-034, AP-036, AP-037, AP-039 |
| UC-S05 | F05 | AP-036, AP-083 |
| UC-S06 | F06 | AP-042, AP-045 |
| UC-S07 | F07 | AP-035, AP-072 |
| UC-S08 | F08 | AP-058, AP-067, AP-076, AP-077 |
| UC-S09 | F09 | AP-084 |
| UC-S10 | F10 | AP-085 |
| UC-S11 | F11 | AP-087 |
| UC-S12 | F12 | AP-088 |
| UC-S13 | F13 | AP-069, AP-089 |
| UC-S14 | F14 | AP-090, AP-104 |
| UC-S15 | F15 | AP-107, AP-108 |
| UC-S16 | F16 | AP-109, AP-171 |
| UC-S17 | F17 | AP-091 |
| UC-S18 | F18 | AP-092 |
| UC-S19 | F19 | AP-093 |
| UC-S20 | F20 | AP-094 |
| UC-S21 | F21 | AP-095 |
| UC-S22 | F22 | AP-096 |
| UC-S23 | F23 | AP-038, AP-099 |
| UC-S24 | F24 | AP-100 |
| UC-S25 | F25 | AP-101 |
| UC-S26 | F26 | AP-102, AP-104 |
| UC-S27 | F27 | AP-097 |
| UC-S28 | F28 | AP-098, AP-161 |
| UC-S29 | F29 | AP-110, AP-139 |
| UC-S30 | F30 | AP-130, AP-131, AP-132, AP-135, AP-136, AP-137, AP-138 |
| UC-S31 | F31 | AP-024, AP-025, AP-028, AP-134 |
| UC-S32 | F32 | AP-082, AP-103 |

## 10. Screen coverage

These map behavior contracts, not proof the old HTML has been updated or that the application exists.

| Screen | Backlog items |
| --- | --- |
| T01 | AP-105, AP-139, AP-145 |
| T02 | AP-034, AP-035, AP-036, AP-037, AP-039 |
| T03 | AP-044, AP-045, AP-047 |
| T04 | AP-063, AP-064, AP-065, AP-066, AP-117 |
| T05 | AP-123, AP-124, AP-125 |
| T06 | AP-056, AP-067, AP-069, AP-077 |
| T07 | AP-071, AP-072, AP-073, AP-074, AP-075 |
| T08 | AP-081, AP-086, AP-099, AP-147 |
| T09 | AP-106, AP-107, AP-108, AP-109, AP-110 |
| T10 | AP-112, AP-113, AP-114 |
| T11 | AP-048, AP-049, AP-050 |
| T12 | AP-028, AP-130, AP-133, AP-134, AP-135, AP-137, AP-138 |

## 11. Founder-decision traceability

Decision status/wording is authoritative in specification section17. This matrix points to implementation or explicitly deferred treatment; it does not reopen decisions.

| Decision | Backlog items |
| --- | --- |
| DEC-001 | AP-011, AP-013 |
| DEC-002 | AP-008, AP-143, AP-144 |
| DEC-003 | AP-001, AP-005 |
| DEC-004 | AP-001, AP-022 |
| DEC-005 | AP-008, AP-143 |
| DEC-006 | AP-011, AP-015 |
| DEC-007 | AP-117, AP-125 |
| DEC-008 | AP-169 |
| DEC-009 | AP-066, AP-159, AP-173 |
| DEC-010 | AP-007, AP-130, AP-135, AP-138 |
| DEC-011 | AP-051, AP-064, AP-067 |
| DEC-012 | AP-062, AP-063 |
| DEC-013 | AP-007, AP-170 |
| DEC-014 | AP-170 |
| DEC-015 | AP-068, AP-170 |
| DEC-016 | AP-002, AP-042, AP-047 |
| DEC-017 | AP-030, AP-034, AP-039 |
| DEC-018 | AP-005, AP-080, AP-086 |
| DEC-019 | AP-034, AP-037, AP-038 |
| DEC-020 | AP-041, AP-044 |
| DEC-021 | AP-009, AP-049, AP-073 |
| DEC-022 | AP-052, AP-054, AP-062 |
| DEC-023 | AP-022, AP-064 |
| DEC-024 | AP-002, AP-064 |
| DEC-025 | AP-064, AP-116 |
| DEC-026 | AP-113, AP-115, AP-116 |
| DEC-027 | AP-004, AP-112, AP-114, AP-165 |
| DEC-028 | AP-116, AP-117, AP-118, AP-119 |
| DEC-029 | AP-007, AP-146 |
| DEC-030 | AP-012, AP-028, AP-134 |
| DEC-031 | AP-048, AP-049, AP-050 |
| DEC-032 | AP-006, AP-025, AP-107 |
| DEC-033 | AP-067, AP-076, AP-077 |
| DEC-034 | AP-035, AP-072 |
| DEC-035 | AP-005, AP-080, AP-086 |
| DEC-036 | AP-005, AP-079, AP-081, AP-156 |
| DEC-037 | AP-034, AP-037 |
| DEC-038 | AP-035, AP-128, AP-132 |
| DEC-039 | AP-007, AP-036 |
| DEC-040 | AP-045, AP-072 |
| DEC-041 | AP-072, AP-073 |
| DEC-042 | AP-045, AP-071 |
| DEC-043 | AP-074 |
| DEC-044 | AP-106 |
| DEC-045 | AP-054, AP-111 |
| DEC-046 | AP-054 |
| DEC-047 | AP-019, AP-056 |
| DEC-048 | AP-029, AP-052, AP-053 |
| DEC-049 | AP-026, AP-071, AP-076 |
| DEC-050 | AP-027, AP-070 |
| DEC-051 | AP-057, AP-063, AP-075, AP-108 |
| DEC-052 | AP-052, AP-056 |
| DEC-053 | AP-003, AP-058, AP-059, AP-060 |
| DEC-054 | AP-061, AP-126 |
| DEC-055 | AP-123, AP-124 |
| DEC-056 | AP-078, AP-106, AP-115 |
| DEC-057 | AP-055 |
| DEC-058 | AP-003, AP-051 |

## 12. Risk register and refinement triggers

| Risk / unresolved issue | Backlog treatment | Review trigger |
| --- | --- | --- |
| Permission/data ownership not established | AP-001; G-LIVE/G-PRIVACY | Before using real restaurant data |
| Missing actual recipe/export examples | AP-003/AP-004/AP-051/AP-112 | Before marking source-specific import mapping validated |
| Partial stock plus shared use outside subset | AP-002/AP-047/AP-078/AP-120 | Every coverage expansion or unexplained discrepancy |
| Unknown or negative balance / missing factor | AP-009/AP-014/AP-046/AP-062 | Before claiming feasibility or committing a new operation |
| Local PMS and legal consolidation not fully checked | AP-005/AP-079/AP-080 | Before activating actual safety limits/processes |
| Unsafe expectation from reuse approval | AP-107/AP-108/AP-099 | Every changed profile/exposure/thermal history |
| Display delivery mistaken for actual information | AP-067/AP-069/AP-170 | Composition change, offline display or channel failure |
| Unselected hardware | AP-109/AP-170/AP-171 | Before relying on real printing/display in service |
| Shared devices/offline evidence loss | AP-007/AP-134/AP-137/AP-152 | Supported-device change, storage failure or revocation |
| AI/forecast precision exceeds available evidence | AP-116/AP-118/AP-127 | New data source/method or unsupported recommendation |
| Complex infrastructure delays useful delivery | AP-011/AP-013/AP-018 | Initial ADR review and measured operational need |
| Additional recording burden undermines adoption | AP-008/AP-149/AP-143 | Operator review and pilot measurement |
| Hidden safety branch omitted as “future” | AP-005/AP-079/AP-156 | Applicability review or activity change |
| Legacy proposals treated as commitments | Section2; AP-159–AP-173 | Any scope or commercial expansion request |

## 13. Export and tracker use

The companion CSV and JSON contain the same 173 work items and stable identifiers, not an integration with a particular issue tracker. CSV uses UTF-8 with BOM and quoted multiline fields for acceptance criteria/work packages. Map the columns explicitly when importing into Jira, GitHub, Linear, Trello or another tracker; this is a generic structured export, not a vendor-specific guaranteed importer.

The JSON is the structured backlog snapshot with epics, gates, traceability and a valid prerequisite-first ordering. Story IDs remain stable; subordinate work packages are identified as AP-nnn.T1/T2 in the document and exported text. Do not create duplicate independent issues for the same safety flow already mapped to another story. Revisit estimates/assignees only with actual team capacity, chosen architecture and real examples.

## 14. Baseline and change control

This backlog derives from specification v0.80. It does not modify either language edition of the spec. Subsequent scope decisions require a traceable spec/backlog change and impact review of acceptance, permissions, data/version history and dependencies. Preserve previous identifiers rather than renumbering completed work.

No external tracker writes, supplier communication, code implementation, production deployment or restaurant go-live occurred while generating this backlog.
