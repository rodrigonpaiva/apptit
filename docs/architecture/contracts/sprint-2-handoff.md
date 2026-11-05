# Sprint 1 → SP2-01 — Implementation handoff

Date: 2026-11-05. Review against the implemented Sprint 1 slice; this is not an implementation or approval of Sprint 2 contracts.

## What SP2-01 can rely on

| Area | Implemented evidence | Receiving-contract implication |
| --- | --- | --- |
| Actual individual and scope | Identity opaque sessions, fresh active membership and capability checks; Gateway and Kitchen independently authorize protected catalogue reads | A receiving adapter must request a specific capability and build actor/site context on the server. A client-supplied TypeScript-shaped context is never authentication. |
| Units and provenance | Canonical decimal strings, g/ml/each, explicit basis/resolution and known/unknown quality/source; exact kg→g/l→ml helpers | Reuse these primitives. Nominal package size is not actual receipt quantity; add explicit checked pack conversion, preserving originals and provenance. No density/yield inference. |
| Dates and times | Date-only expiry with explicit kind; UTC observation/recording instants and site IANA timezone | Keep product reference dates separate from actual batch/label dates. Do not derive expiry or safety acceptance from a barcode. |
| Versioned persistence | Kitchen QuantityDraft transactions, expectedVersion, scope filters, immutable revision history, author/session/correlation snapshots | Pattern and tests are reusable, but QuantityDraft is not a receipt aggregate. Receipt headers/lines/batches need separate identities and schema. |
| Product reference | Scoped name/presentation/text barcode; nullable codes for bulk; no stock or lot fields | CatalogueProduct cannot stand for a received batch. Current presentation is descriptive text, not a validated machine-readable pack factor. |
| Failure behavior | Typed safe errors, explicit dependency failure, no success on uncertain writes; no public persistence mutation | Specify recovery and expectedVersion conflicts before exposing receipt saves. The future operation registry is not implemented by draft versioning. |

## SP2-01 decisions still to implement and verify

1. Separate generic/commercial product/presentation, received batch/date, receipt line and receipt header identities. Current catalogue reference is the narrow Sprint 1 read model; do not silently rename it into a full product master.
2. Define receipt and immutable future ledger-entry states/ports with examples. A saved receipt draft cannot create usable stock, reserve, consume, transfer or approve safety.
3. Define operation ID, canonical payload comparison/mismatch, version conflict and uncertain-outcome lookup before any future stock posting. Current optimistic versioning is not durable operation deduplication, an outbox or exactly-once processing.
4. Validate actual received quantity against accepted/rejected/quarantined/pending amounts in one compatible unit and basis. Handle unknown/partial quantities explicitly. Ten checked 5 kg bags may yield a 50 kg conversion preview only with a reviewed pack factor; a printed nominal size alone does not establish delivery.
5. Define evidence metadata ownership and states, generated storage keys, author/time/digest/media size, scope and receipt/batch references. ADR-0004 selects a private filesystem boundary for future synthetic work; upload, authorized streaming, orphan recovery and lifecycle are not implemented. `EVIDENCE_MODE` stays disabled until then.
6. Define receiving capabilities rather than treating catalogue.read as write authority. Current minimal role map is not complete per-product permission or organization administration.

## Continuing boundaries

OFF/AI/OCR/offline/evidence remain disabled in the runtime. No received batch, stock ledger, supplier offer, provider lookup, camera integration, food eligibility decision, director workflow, restore drill or live restaurant onboarding exists. The foundation's named volume is not a backup. Production HTTPS/session settings and deployment/recovery policies remain unresolved for live use.

SP1-06 can establish reproducibility and enabled-path checks; it cannot mark AP-150/AP-024/AP-019 globally Done or close later parent dependencies. SP2-01 is the next package after integration/review of SP1-06.

Sources: [quantity contract](quantity-draft.md), [individual access](individual-access.md), [catalogue contract](catalogue.md), [adapter/evidence ADR](../adr/0004-adapters-evidence-and-recovery.md), [SP2-01 acceptance](../../../plans/sprints/APPTIT_SPRINTS_01-04_v1.0_EN.md).
