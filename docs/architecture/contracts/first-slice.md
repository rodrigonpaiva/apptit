# First-slice contract v1

Status: SP1-01 design baseline, 2026-11-04. [Type definitions](first-slice.ts) have no framework dependency. They deliberately require later runtime validators: TypeScript string aliases cannot validate decimal/date/UUID content. Nothing here enables receipt/stock/file operations before their sprint acceptance.

The subsequent [SP2-01 receiving contract](receiving.md) refines receipt/presentation/batch identities and supplies runtime parsers for drafts, conversion/reconciliation and evidence declarations. Future stock/evidence ports remain disabled.

## Public and internal API

| Interface | Contract | Authorization / effect |
| --- | --- | --- |
| Same-origin HTTP session endpoints | POST login/logout; GET current session / CSRF bootstrap | Login is rate-limited; mutation Origin/CSRF protected. Current session returns identity/authorized sites, never secret/hash |
| GraphQL `products(input)` | tenantId, siteId, first, after → ProductPage | `catalogue.read`, fresh server authorization; SP1 first implemented business query |
| GraphQL later `saveReceiptDraft` | Command with draft payload | `receipt.draft.write`; expectedVersion required; no stock effect |
| GraphQL later `confirmReceipt` | Command<ConfirmReceipt> | `receipt.confirm`; procedure eligibility and separate disposition capability where required; one Kitchen transaction |
| GraphQL later `transferStock` | Command<TransferStock> | `inventory.transfer`; same site, distinct locations, same batch/unit/basis; no production consumption |
| GraphQL later `operationOutcome` | scope, action, operationId → OperationOutcome | Original actor + action capability; separate audited recovery permission is future work |
| HTTP later evidence upload/read | generated evidence ID + scope, streamed bytes | Current evidence capability AND access to linked receipt/object; no public storage path |
| Internal HTTP `/internal/v1/authorize` | AuthorizeRequest → Result<AuthorizationContext> | Authenticated caller service AND valid end-user session; no client-declared actor |
| Internal HTTP `/internal/v1/products` | ProductListQuery → Result<ProductPage> | Kitchen reauthorizes end-user session through Identity; never accepts external auth context as proof |

Internal transport includes the session secret in a protected redacted header, per-caller service credential and correlation ID; the listed ProductListQuery is only the business body. Login credentials go only to Identity through the gateway. No unauthenticated forwarding proxy. Gateway has no repository for service data.

Use GraphQL decimal/date scalar runtime parsing and explicit input validation; IDs are UUID strings, not capabilities. Schema version 1 is the internal envelope/event version, not a GraphQL endpoint version. Additive compatible fields may be introduced; semantic/breaking changes require a new explicit contract and compatibility/migration plan. Domain result errors remain typed; gateway encodes public codes in GraphQL error extensions with correlation/retry/field. HTTP adapters map authentication→401, forbidden→403, not found→404, invalid input→400, version/idempotency conflict→409 and dependency failure→503. Sanitize unexpected failures as INTERNAL_ERROR. Clients inspect codes, not localized text.

Pagination: `first` is integer 1–100 (fixture engineering limit); initial order `(name, id)` is deterministic. Cursors are opaque, validated and bound to tenant/site/filter/order; changing scope with a cursor is INVALID_INPUT. Reauthorize every page. Do not leak other-site totals. List visibility is separate from permission to withdraw products.

## Validation and operation rules

- Decimal/unit/basis/resolution/date rules follow ADR-0002. Quantities are nonnegative; transfer/stock entry amounts must be positive, while explicit accepted/rejected allocation zero is meaningful. Unknown measurement is Datum<unknown>, not numeric zero. Resolution is positive; submitted measured values must align with declared resolution. Imported/estimated resolution is declared, not inferred measurement accuracy.
- Scope cannot be omitted from site business requests. expectedVersion is nonnegative integer; 0 means create, update uses exact current version. Client role, name or author fields never establish authority.
- Confirmation allocations cover each receipt line once, contain no foreign lines, have compatible units/bases and reconcile exactly: delivered = accepted + rejected + quarantined + pending. Only eligible accepted amount increases usable balance. Required observation/label gaps block affected release. Preserve all other quantities as their actual distinct states.
- The server derives original action actor/name/audit time. Client observedAt is preserved as reported with provenance; missing remains unknown. Approval records the reviewer separately. Version conflict forces renewed review; never last-write-wins.
- Validate syntax and authorization before resource-specific output. Look up object within tenant/site. Recheck current permissions/versions before effect. At the transaction boundary, check an existing operation result before rejecting its previously consumed expectedVersion, so exact replay works.
- Server canonicalizes parsed input and defaults before hashing. Stable object keys; preserve semantically ordered arrays, sort ID-keyed sets, reject duplicate IDs. Include schema/action/actor/scope/version; exclude session, correlation and transport time. Decimal canonicalization follows ADR-0002. Canonicalizer itself is later implementation with compatibility cases.
- New action ID means new intent; UI must retain the ID through timeout/reopen. Same key+payload returns the original result. Mismatch is not a retry. `processing` requires a durable recoverable claim. A missing outcome can still be in flight; retry only the same ID. Domain rejection and uncertain transport outcome are different.
- Event aggregates have strictly increasing committed versions. An event is a fact, not a command that automatically grants access. Inbox duplicate protection and gap handling are required before event effects. Event payloads contain minimal data, no credential/evidence bytes.

## Concrete synthetic examples

| Input / event | Required result |
| --- | --- |
| Product barcode `"0012345678905"` | Leading zeros preserved as text; reference is not a delivered batch |
| Quantity `"5000"` g as_received, resolution `"1"` | Valid quantity; 5 kg exact conversion retains source input |
| Quantity `"1e3"`, `"NaN"`, over-precision, count `"0.5"` each | INVALID_INPUT; never silent SQL rounding |
| Unknown batch expiry | Explicit unknown; does not count as guaranteed usable in eligibility calculations |
| Label `2026-11-04` use_by, site Europe/Paris | Calendar date preserved; no midnight-UTC substitution or invented cutoff |
| User A/site A requests site B without membership | FORBIDDEN; direct IDs/file links do not bypass policy |
| Session revoked, next protected query | SESSION_REVOKED; Identity outage returns DEPENDENCY_UNAVAILABLE |
| Save receipt draft with 10 units | Draft version saved, no ledger/balance mutation |
| Delivered 10 each; accepted 8/rejected 2/quarantined 0/pending 0 | Reconciles; confirm adds 8 usable once |
| Same confirm ID/hash after response lost | Same movement IDs/result; stock still 8 |
| Same confirm ID with accepted 9 instead | IDEMPOTENCY_MISMATCH; no effect |
| Two concurrent transfers of final 5000 g | At most one succeeds; other conflict/insufficient stock, no partial credit |
| Reserve 5000 g → kitchen 5000 g | Site total unchanged; batch identity retained |
| User switch while original user's unsent draft exists | New user sees/submits none of it; original ownership retained |
| OFF unavailable / missing allergen data | Manual reviewed/label path; unknown remains unknown, no inferred allergen-free claim |

These are acceptance vectors for SP1-03 onward, not passed runtime tests.

## Evidence and draft lifecycles

Original file bytes, capture and recording times, uploader and domain references stay associated. EvidenceMetadata has a private server-generated storage key in persistence, deliberately excluded from public DTOs. A metadata row does not establish upload success; available requires durable matching bytes/digest. Failed upload is not a photograph. Retrying upload uses its original ID and verifies digest; same ID with different bytes conflicts. Retention/holds and orphan reconciliation follow ADR-0004.

Draft states expose unsaved, saved locally, server pending, server saved and review required. saved_locally is legal only after actual durable write, and server_saved only after server acknowledgement. LocalDraftEnvelope reserves original identity; it is not permission to submit as another user. Draft storage/offline capture remains disabled until its lifecycle and isolation are implemented. A lost response is pending/uncertain, never false saved. Saving a receipt or planning simulation cannot approve, reserve, transfer or consume inventory.

## Minimal configuration contract for SP1-02

Required: synthetic runtime mode, per-service DB URL, internal caller credentials/origins, cookie/CSRF secret settings, positive session idle/absolute limits, internal-call deadlines, explicit seed mode and port bindings. Validate relationships (idle≤absolute, no wildcard credentialed origin, no real fixture identity) and redact secrets. Nonlocal live mode is unsupported until deployment/security/recovery decisions are recorded. No bypass-auth flag.

Optional adapter mode defaults disabled; fixture is explicit. OFF live needs reviewed endpoint/license/User-Agent/time budget/rate behavior; file capture needs private storage root and byte/type limits. Disabled feature returns CAPABILITY_DISABLED, not a fake success. Seed catalogue and manual fallback do not require external network. No .env file with real secrets is created by this package.
