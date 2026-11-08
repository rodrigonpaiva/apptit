# SP2-01 — Receiving, future stock operations and evidence contracts

Date: 2026-11-05. Runtime types: `packages/contracts/src/receiving.ts` and `evidence.ts`. Pure parsers: `packages/domain-values/src/receiving.ts`. No receipt table/route, file handler, stock operation or new capability grant is enabled by this package.

## Identity and draft boundary

A receipt header (`receiptId`) contains line identities (`line.id`). Each line explicitly references commercial `productId`, a distinct `presentationId` plus presentation version, and a received `batch.id`. Actual batch code and expiry are independently known/unknown data from the label; they are never derived from a barcode. The receipt's observed receivedAt is a UTC instant, while the batch expiry is a calendar date plus kind/source. The same product can have two actual batches with separate line/batch IDs and dates.

The current SP1 catalogue combines reference name and descriptive presentation text. It is not silently reinterpreted as the complete product/presentation master: the future adapter must resolve the new identities and reviewed versions within the authorized site. Parsing UUID shape alone does not establish that a referenced entity exists or belongs to that site.

`SaveReceiptDraft` accepts schemaVersion 1, operationId, scope, receiptId, expectedVersion and payload. The payload contains supplierReference/receivedAt data and 1–50 lines. A line has product/batch identities, received quantity, disposition, destination location and up to 20 evidence IDs. Line/batch IDs must be unique within this narrow draft; evidence IDs cannot repeat within a line. These are explicit engineering bounds, not approved restaurant limits. A later multi-location/same-batch contract must deliberately revise this restriction.

Unknown data needs a reason. Measured zero is not unknown; estimated/imported quality remains intact. An unknown received quantity or disposition yields incomplete reconciliation, not fabricated zero or successful posting. Both known values must reconcile. Destination can remain unknown in a draft. No parser supplies an actor, recording time, saved version, available stock or inferred date.

The future ReceiptDraftPort must validate actual online receipt.draft.read/write capabilities, load references/evidence under the same scope and atomically save the aggregate plus attributable revision. expectedVersion 0 creates a new draft; existing drafts require the exact persisted version. A stale write returns VERSION_CONFLICT. These are port requirements, not a delivered receiving repository. Existing QuantityDraft is not renamed into a receipt.

## Exact checked pack preview and reconciliation

`previewPackConversion` requires an explicit whole nonnegative packCount and a checked conversion snapshot bound to product/presentation/version. It includes its own ID/version, positive base-unit factor, sourceRef, reviewer identity/name and reviewedAt. Supported targets are g/ml/each on as_received basis; each factors must be integral. Fractional packs, invalid/noncanonical decimals, missing review, changed presentation/version, unsupported units and overflow are rejected. There is no mass/volume, density, cooking-yield or nested-case inference.

Count is multiplied using BigInt/scaled canonical decimals without passing through JS Number or silently rounding. Output resolution is the declared one-pack increment expressed in the target unit. The output is explicitly **preview**, preserves the full parsed conversion snapshot and pack count, and is not a measured receipt, ledger entry or stock availability. The future server must load the authoritative reviewed snapshot rather than trust a client's review metadata.

Example: 10 checked packs × 5000 g/pack = 50000 g (50 kg), not 5 kg. A future operator still records/verifies what was actually delivered. A newer presentation/factor produces a new preview and cannot mutate an earlier parsed snapshot.

`reconcileReceiptQuantities` checks:

```text
actual received = accepted + rejected + quarantined + pending
```

All four buckets are explicit nonnegative quantities in the same base unit and as_received basis. Known measured amounts align with their resolutions. The equality is exact, not a floating-point tolerance. Mixed g/ml, different bases, over/under-allocation and invalid precision fail with field-specific issues. Unknown values produce incomplete with the missing fields. Balanced is arithmetic only: it does not establish safety eligibility, evidence completeness or authority to accept food.

## Future operation identity and uncertain outcome

Identity key: `(tenantId, siteId, actorId, action, operationId)`, where action is receipt.draft.save or receipt.confirm. The authenticated adapter derives stable actor identity from Identity; it never accepts caller JSON author/session fields as proof.

`receiptOperationIdentity` parses/normalizes the action's entire command before deterministic JSON serialization. Object keys sort by code-unit order; arrays retain order as part of the reviewed intent. Schema, action, scope, actorId, receiptId, expectedVersion and normalized payload participate. The operation ID belongs to the key, not the fingerprint. Display name, session secret and transport correlation do not participate. The future registry hashes the UTF-8 canonical intent with SHA-256; this package creates no registry or cryptographic persistence adapter.

`compareReceiptOperation` only classifies an absent row, same intent or payload mismatch for the **same** scoped key; a foreign key is rejected. It is not authorization, result replay or a concurrency lock.

| Future condition | Required behavior before effectful posting |
| --- | --- |
| Same key and fingerprint, completed | Authorize current actor/scope/action, return original committed result; do not apply effects again. |
| Same key, incompatible payload/version | IDEMPOTENCY_MISMATCH; no overwrite, execution or silent reuse. |
| Different operation ID | New command; revalidate expectedVersion and current authority. |
| Stale expectedVersion | VERSION_CONFLICT; reload/review; a corrected command uses a new operation ID. |
| processing | Must represent a durable claimed operation with recovery/lease semantics, never an in-memory promise. |
| rejected | A durable terminal rejection with recorded safe error/time; corrected commands use a new ID. |
| not_found | Not proof of rollback: an in-flight transaction may still commit. Retry/query the same ID under the defined recovery protocol; never assume a fresh replacement ID is safe. |
| Timeout/uncertain response | OUTCOME_UNCERTAIN / same_operation retry guidance; query outcome, never claim saved/failed solely from the timeout. |
| Lookup dependency unavailable | Explicit dependency error, not not_found or fabricated rejection. |

Future receipt confirmation must load the authoritative receipt and reconcile all dispositions, linked line/batch IDs, versions, eligibility and evidence under fresh rights. The confirmation parser here checks **syntax only**, not receipt existence, authoritative quantities or permission. Receipt confirm/disposition grants remain inactive. The Kitchen transaction must commit receipt version/state, applicable credits, audit, durable operation result and any outbox together. Key uniqueness, concurrent duplicate handling, timeout-after-commit recovery and registry durability still require implementation/tests in later packages.

`ReceiptLedgerEntry` declares readonly scope, operation/receipt/line/batch/product/presentation/location references, exact quantity, original actor and server time. Only accepted/quarantined receipt credit kinds are declared. Rejected/pending amounts do not create usable credits; quarantine must remain unavailable until its separately authorized release. These immutable **future shapes** do not implement a ledger or physical availability; corrections must later append compensating entries, not edit historical facts. Compile-only negative checks protect readonly attribution/quantities and pending-evidence state separation.

## Evidence ownership and lifecycle boundary

`EvidenceUploadIntent` has a stable uploadId, scope, receipt/line/product/presentation/batch links, display filename, declared media type/size/SHA-256 and independently known/unknown capturedAt. The pure parser requires an explicitly supplied byte/type policy, valid IDs/digest and bounded basename without paths/control characters. It rejects supplied author, storage key, available state, server time and hold. No bytes are read or uploaded by this validation; claimed JPEG/size/digest are not verified file content.

The future authenticated handler owns generated evidence ID/storageKey, original actor/name and server recordedAt. Its private storage adapter verifies actual bytes/type/size/digest, writes immutable keys outside public/static roots and exposes bytes only through authenticated scope/link-checked streaming. No storage path/URL becomes a browser capability. Metadata separates:

- upload_pending: upload identity and **declared** content, not durable bytes;
- available: observed/verified stored-object metadata and availability time;
- failed: upload identity and explicit failure, with no successful object claim.

CapturedAt never substitutes for server recordedAt. Hold and synthetic classification belong to server policy. Receipt/evidence links require current scope authorization and actual resource lookup. The future ports separate metadata and bytes, with no delete operation exposed here. Cross-filesystem/DB atomicity is not assumed: publish available only after durability; retries use upload identity and matching digest; reconcile orphan/pending/failed uploads without overwriting original bytes. Retention, hold release, purge/export, file sniffing/limits and recovery remain future implementation, not complete AP-020. EVIDENCE_MODE stays disabled.

## Executable examples and evidence

- [Receipt draft](examples/receipt-draft.json): 50000 g received, split 40000/2000/3000/5000 g.
- [Pack preview](examples/pack-preview.json): ten checked 5 kg packs, separate from actual observation.
- [Confirmation intent](examples/receipt-confirm-intent.json): future syntax only, expected persisted version 1.
- [Evidence upload declaration](examples/evidence-upload-intent.json): synthetic declaration, not a stored image.
- [Compile-only outcomes/immutability examples](receiving-contracts.ts).

The nine receiving test groups exercise these exact JSON examples, identity separation, unknown/zero/quality, exact allocations, bounds, conversion provenance/failures, canonical operation comparison, confirmation syntax and evidence declarations. No test claims that stock or private file lifecycle exists. The SP1-01 design document remains historical; these narrow runtime types/parsers are the SP2-01 receiving contract.


## SP2-03 implementation boundary

SP2-03 now implements receipt-private drafts through same-origin `POST /api/receipts/{save,read,list,locations}` (gateway `/receipts/*`). All four routes require the session-bound CSRF token, exact web Origin and JSON; both gateway and Kitchen obtain current scoped Identity authorization. Chef/storekeeper receive draft read/write only; cook has neither. No confirmation, disposition, evidence or stock authority is granted.

`SaveReceiptWorkspace` adds one private name/presentation/barcode/physical-match snapshot per line to the versioned SP2-01 command. These identities are not approved catalogue references. Pack count/factor are explicit operator-checked draft estimates, independently validated against the base-unit quantity; they do not activate the future reviewed-conversion/stock port. Destination IDs must exist in the same tenant/site. Disposition remains unknown and evidence IDs must be empty in this slice.

Kitchen saves aggregate, append-only attributable revision and durable save outcome in one transaction. The operation key is tenant/site/actor/operationId in a draft-save-only table. Identical retries return the original snapshot; changed intent returns IDEMPOTENCY_MISMATCH. Fresh updates need exact expectedVersion; competing writes produce one winner. Other-scope IDs disclose no content. Listing is bounded to the latest 30 drafts; locations to 50. Both are explicit engineering limits.

The interface never increments quantity on scan. Same-code batches require an explicit new line. Empty dates, quantity, batch and destination remain pending. A lost response keeps the original operation and disables edits until retry or authoritative reload; it never reports saved without an acknowledged result. Unsaved fields are memory-only and visibly discarded on workspace lock/navigation. Offline capture, photos, safety review, stock posting and real-site readiness remain unavailable. See [delivery/review](../../delivery/SP2-03.md).


## SP2-04 implementation update

The evidence section above records the SP2-01 contract boundary. SP2-04 now implements the synthetic private-byte/metadata path described in [private evidence](private-evidence.md), retaining explicit pending/failed/available/readability states and server-owned attribution. Default evidence mode remains disabled; fixture mode is explicitly configured. OCR, full lifecycle/retention/restore and stock confirmation remain future work. Receipt evidence membership is queried from its scoped association index rather than automatically rewriting the receipt snapshot.


## SP2-05 implementation update

Procedure-bound actual temperature/condition observations and immutable correction history are implemented separately from receipt disposition in [receiving observations](receiving-observations.md). Explicit synthetic profile selection, missing/stale/estimated context and original rule snapshots do not establish goods eligibility. Default capture remains disabled; real PMS/chef disposition/stock activation is outside this slice.
