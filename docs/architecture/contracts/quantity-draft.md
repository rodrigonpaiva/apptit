# SP1-03 — Quantity values and versioned reference drafts

Date: 2026-11-05 (Europe/Paris). Implements the bounded SP1-03 baseline from ADR-0002. Runtime contracts live in `packages/contracts`; pure parsers/arithmetic in `packages/domain-values`; application/repository ports and Prisma persistence belong to Kitchen.

## Values and provenance

Quantities serialize decimals as canonical strings and store them as PostgreSQL `NUMERIC(24,9)`: up to 15 integer and 9 fractional digits. Exponents, JS numeric input, nonfinite values, insignificant trailing fractional zeros, excess precision and overflow are rejected before database rounding. Exact arithmetic uses scaled BigInt. Prisma Decimal values map back with `toFixed()` without a rounding precision argument, preserving normal decimal notation even for `0.000000001`.

A quantity includes base unit (`g`, `ml`, `each`), basis (`as_received`, `raw_net`, `prepared`) and declared resolution. Resolution is positive; quantities are nonnegative; counts/resolution in `each` are integral. Measured values must align with their resolution. Estimated/imported values retain their declared quality and do not become weighed observations. Exact kg→g and l→ml helpers return original input and conversion provenance; no pack, density, preparation yield or cross-basis conversion is inferred. Persisting a complete conversion-reference catalogue remains later work.

`Datum<T>` requires either known value/quality/source reference or an explicit unknown reason. Unknown cannot carry a fabricated value or quality. Known measured zero survives storage as zero; unknown persists with null numeric fields and its reason. All three known quality states remain distinct.

Expiry uses a Gregorian `YYYY-MM-DD` date and explicit use-by/best-before/after-opening kind. It is a PostgreSQL `DATE`, not a UTC deadline. Prisma requires an artificial Date transport container; the mapper discards that container's time and exposes only the original calendar date. `observedAt` and server recording times are separate UTC instants with millisecond precision. The site IANA timezone is stored as context; instant→site calendar conversion respects timezone/DST. No food eligibility, expiry cutoff, legal threshold or secondary-life rule is selected here.

## Minimal aggregate and ownership

`QuantityDraft` is a reference draft, not stock, a received batch, reservation or approved safety record. It owns a label, quantity/expiry/observation data, tenant/site/timezone, positive version, creator/updater IDs and names at action time, and recording times. Kitchen is the sole database writer. Identity database/schema remain independent.

The application accepts a strict `{id, scope, expectedVersion, data}` command and a separate **trusted server actor context**. Input cannot set actor, recording times or stored versions. Capabilities `quantity-draft.read` and `quantity-draft.write` are internal narrow contract capabilities; no user-role grants are activated by this package. Missing context fails with UNAUTHENTICATED; wrong capability/scope is denied. Reads/history/updates filter by resource ID, tenant and site. Foreign resource IDs return NOT_FOUND without their content or version.

**Trust boundary:** SP1-04 supplies a real online Identity/session authorization adapter. The TypeScript context is not proof of authentication, and its shape validator does not verify a session. Integration tests construct explicitly synthetic server contexts. There is no public persistence endpoint, client-author header, fixture login bypass or default actor. Do not expose these application methods until the actual authenticated adapter exists.

## Version and transaction protocol

- `expectedVersion=0` creates version 1. Existing drafts require their exact current version.
- One PostgreSQL transaction writes the aggregate and appends its revision, including actor/name, session reference, tenant/site, correlation, recording time and before/after snapshots.
- Updates condition on ID/scope/version and increment once; zero affected rows means VERSION_CONFLICT. Two writers of the same version produce one successful update and one conflict.
- A duplicate create cannot overwrite an existing ID. A failure while appending audit history rolls back the aggregate write as well.
- Creator name snapshots and earlier revisions survive later actor renaming. Row-level update/delete triggers reject revision mutation; the normal adapter only appends. This does not defend against a database owner deliberately dropping the trigger.
- This is optimistic version protection, not the future durable operation registry/outbox. A lost acknowledgement requires reading/reviewing the draft; no automatic command replay success or global stock idempotence is claimed.

Migration `202611040002_quantity_draft` adds both tables, scope indexes, composite FK, state constraints and append-only trigger inside an explicit transaction. Existing runtime fixtures are preserved. Schema evolution is forward-only here; no destructive down migration or production restore guarantee is offered. Tests exercise both upgrade of the existing synthetic database and the full migration chain in a unique disposable schema. Integration records use random synthetic tenant/site IDs and append-only history; they are not silently deleted after each run. Only the temporary schema created by the migration test is dropped.

## API validation and failure contract

The gateway adds **read-only** `validateQuantityDraft(input)` returning `{ok, issues:[{field, code, message}]}` for submitted values. It queries no stored draft or identity and performs no mutation. This makes invalid unit/date/precision/state errors recoverable at the API boundary while authenticated writes remain unavailable. The query does not validate food safety or approve an observation.

Example:

```graphql
query Validate($input: QuantityDraftValidationInput!) {
  validateQuantityDraft(input: $input) {
    ok
    issues { field code message }
  }
}
```

Example variables:

```json
{
  "input": {
    "label": "Synthetic rice reference",
    "quantity": {
      "state": "known",
      "quality": "measured",
      "sourceRef": "synthetic/manual",
      "value": { "amount": "5000", "unit": "g", "basis": "raw_net", "resolution": "1" }
    },
    "expiry": { "state": "unknown", "reason": "Not observed" },
    "observedAt": { "state": "unknown", "reason": "Not observed" }
  }
}
```

Changing unit to `litre` yields `ok:false`, `field:quantity.value.unit`, `code:INVALID_UNIT`. Explicit null/irrelevant fields do not turn unknown into known. Typed GraphQL input errors are rejected by GraphQL before domain parsing. Application methods return typed INVALID_INPUT, NOT_FOUND, VERSION_CONFLICT or safe dependency errors; SQL, stack and connection credentials are not returned. Unknown commit/dependency outcome directs the caller to review before retrying.

## Primary implementation references

- [Prisma 7 transactions](https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions), matching the pinned installed major; newer Prisma APIs are not used.
- [PostgreSQL dates and timestamps](https://www.postgresql.org/docs/current/datatype-datetime.html).
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html).
