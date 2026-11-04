# ADR-0002 — Data authority, exact quantities and atomic operations

- Date: 2026-11-04
- Status: selected first-slice engineering baseline
- Sources: specification §§9/10/14, RF-03, DEC-021/045/046/047; AP-009/AP-011; SP1-01 AC1/2.

## Decision and alternatives

Select **PostgreSQL** as the sole authoritative transactional database technology for the first slice, accessed through service-specific Prisma adapters. Exact decimals, constraints and multi-record transactions match receiving/ledger/version requirements. MongoDB is an evaluated alternative, not selected for this slice: document flexibility does not outweigh introducing a second authority and consistency model now. No relational/document dual writes for the same fact.

Use separate logical databases and restricted credentials for Identity and Kitchen; one local PostgreSQL instance may host both. Each service owns its schema, migration history, seeds and **custom Prisma client output/import path**. Another service never imports that generated client. Shared packages contain value contracts, not a universal PrismaClient. Local empty DB reset is allowed only as an explicit synthetic reset; production schema transitions require reviewed forward migrations and recovery.

| Authority | Owned data |
| --- | --- |
| Identity | Users, credentials, sessions, tenant/site registry, membership/capability versions |
| Kitchen catalogue | Site product references, presentations, reviewed external-source snapshots |
| Kitchen receiving/safety | Receipt drafts/lines, original observation, procedure snapshot, disposition and evidence links |
| Kitchen inventory | Batch identity, location balances, immutable movements, operation outcomes and domain outbox |
| Kitchen evidence | Private object metadata, upload status and references; file bytes remain behind storage port |

A site-scoped catalogue is selected for the initial query. A future tenant-wide master catalogue needs an explicit sharing/access contract. No implicit catalogue sharing across sites.

## Quantities and dates

Wire decimals are strings; persistence uses `NUMERIC(24,9)`. Canonical values have at most 15 integer and 9 fractional digits, no exponent, NaN, Infinity, leading plus, negative zero or insignificant trailing fractional zeros. Overflow and excess input precision fail validation; never silently round an input to fit SQL. Count unit `each` is integral in this slice. Persist unit, basis, declared observation resolution and quality independently; storage precision is not measurement accuracy.

Selected base units: `g`, `ml`, `each`; bases: `as_received`, `raw_net`, `prepared`. Convert kg→g and litre→ml exactly at the boundary and retain original input/provenance. Cross-dimension conversions require a positive reviewed factor with source/version and exact source/target units and bases. A pack is a versioned presentation conversion, never an inferred quantity. Transfer stays in the same compatible stock basis.

Arithmetic uses an exact decimal implementation, not JS Number. For division keep exact numerator/denominator through allocation; when a persisted result is unavoidable, calculate to at least 18 fractional places and explicitly quantize to 9. Requirements round upward and available capacity downward at the selected calculation resolution, with method and residual recorded; no rounding can create stock. Display rounding is separate. Loss percentage satisfies 0≤p<100; gross = net/(1-p/100), and cooking yield is distinct. Money uses decimal amount + currency; currency rounding rules remain a later contract.

Expiry is a calendar `YYYY-MM-DD` plus type (`use_by`, `best_before`, `after_opening`) and source; UTC instants are RFC3339 strings ending in Z. Site uses IANA timezone, synthetic default `Europe/Paris`. Never convert a date-only label into midnight UTC or equate DDM with DLC. Exact eligibility/cutoff and secondary-life rules remain procedure-dependent and provisional. Unknown dates/quality are not zero or guaranteed eligible. Date parsers reject invalid calendar dates and handle DST through the site's timezone.

## Transactions, retry and events

For accepted receipt or transfer, **one Kitchen DB transaction** commits validated disposition/version, ledger entries, balance changes, audit, durable operation result and any required outbox rows. Receipt draft save creates no stock. Transfer debits and credits the same batch/site in one commit, preserving total. Query eligibility, aggregate version and sufficient balance are rechecked inside that boundary using locked rows or conditional updates. Lock multiple balances in deterministic order. Check affected row count; reject stale versions. Bounded deadlock/serialization retries reuse the same operation ID and re-run validation.

Operation uniqueness is `(tenantId, siteId, actorId, action, operationId)`. Store a hash of canonical validated schema/action/payload/expectedVersion/scope/actor; exclude transport correlation and session token. Same key/hash returns stored result, even if version has advanced; authorize before reading that result. Different hash is `IDEMPOTENCY_MISMATCH`. Concurrent inserts contend on a DB uniqueness constraint. Every stock command requires an ID; no server-generated replacement on retry. Terminal rejection consumes the key; corrected commands use a new ID. Do not expire critical operation deduplication while its effects remain replayable.

Transaction commit gives atomic result/effect visibility. `processing` is returned only for a durable claimed operation, not an in-memory promise; a lease/recovery worker must reconcile claimed work. If a transaction rolls back without a claim, result is `not_found` and the same command can be retried. `not_found` is not proof of rejection: an in-flight transaction may still commit. A timeout returns uncertain outcome, never fabricated success/failure.

When events leave the transaction boundary, use transactional outbox + durable consumer inbox keyed by consumer/eventId. Delivery is at least once. Per-aggregate versions detect duplicates/gaps; out-of-order updates park/retry or rebuild from authority, never blindly overwrite. Failed delivery and lag are observable; replay retains IDs. Broker ack does not prove consumer effect. No broker is needed for SP1's private query. Redis is not stock/session authority or durable critical queue.

## Discrepancy and recovery boundaries

Normal synthetic transfer/consumption cannot create a negative usable balance. An already-occurred physical use must later be recordable as an incident/observation even when normal stock command is denied; do not hide the fact or clamp a deficit to zero. Physical-use incident capture is not enabled by SP1. Unknown opening inventory, count coverage/frequency, deficit reconciliation and actual eligibility await AP-009/G-STOCK/G-PMS. Corrections append compensating/versioned facts; they do not rewrite original movements.

Backup scope must include databases, evidence metadata/bytes, migration version and configuration necessary for recovery. Restore must reconcile references, operations and undelivered outbox before writes resume. RPO/RTO, frequency, off-site location, encryption/key recovery and tested recovery objectives require a later operations decision before live data (ADR-0004).

## References consulted

- [PostgreSQL exact numeric](https://www.postgresql.org/docs/current/datatype-numeric.html).
- [PostgreSQL isolation](https://www.postgresql.org/docs/current/transaction-iso.html); transactions can still need retries, and isolation is not idempotency.
- [Prisma client generation](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/generating-prisma-client); exact version/adapter choice remains SP1-02.
