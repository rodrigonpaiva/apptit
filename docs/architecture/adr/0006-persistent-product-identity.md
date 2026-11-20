# ADR-0006 — Persistent receiving product and presentation identity

Status: adopted for the synthetic receiving identity correction, 2026-11-19. Scope: finding 1 before SP3-01/SP3-02, not full AP-029/AP-031 completion or stock activation.

Use existing scoped catalogue IDs as commercial product IDs and add separate persistent presentation IDs/version/activity with composite scope FK. Backfill each old reference independently; do not infer generic ingredients, suppliers or merge names/barcodes. Keep the legacy presentation columns as backward-compatible descriptive fields. New master IDs are generated only by the backend and cannot be deleted/reassigned through the database.

Recording an unknown product is an unreviewed reference capture under the existing receipt-write capability, not chef catalogue approval. Default OFF enrichment remains a suggestion and missing composition is unknown. Exact/ambiguous barcode handling and explicit no-GTIN selection prevent silent similarity-based merging. An immutable resolution operation supports replay and actor attribution independently from receipt-save outcome.

Validate new receipt canonical references server-side under the receipt transaction, with shared row locks, active scope/pairing/version/barcode checks and deterministic multi-reference lock ordering. A valid ID shape or client physical-match checkbox is not reference authority or safety approval.

Preserve old receipt aliases and photo/observation histories. Read them as unresolved unless explicitly associated; do not backfill from their names or barcodes. Record first association in a new receipt revision without changing old private IDs. Require a new line to replace an already recorded canonical link. Future ledger commands must use the canonical reference and revalidate it; this ADR enables no stock command.

Tradeoffs: full master review/edit/search, ingredient/supplier relationships and lifecycle rules remain later work. Unreviewed reference capture can commit before a failed draft save, so UI labels the two outcomes separately. Bounded catalogue choices report truncation. Independent review and real operational evaluation remain unrecorded.
