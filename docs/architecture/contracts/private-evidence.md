# SP2-04 — Private receipt-label evidence

Sources: spec v0.80 RF-07.1/RF-08.2, DEC-034/038 and T02; SP2-04 AC1–AC3; ADR-0004. This is a synthetic local implementation of part of AP-020/AP-035. It does not complete AP-128 OCR, full retention/recovery or live operational readiness.

## Scope and authority

Kitchen owns private original bytes and scoped metadata. Gateway and Kitchen each obtain current Identity authorization; request fields and headers only select requested scope/resources. Chef/storekeeper have `evidence.read/write`; cook has neither. Service identity alone is insufficient. Author/name, server recording time, generated evidence ID and private key come from the authenticated server. Captured time is separately known/unknown; selecting a file does not prove its capture time or photographer. The original uploader is retained when a colleague reads/reviews it.

An upload must reference an existing saved receipt and actual line/product/presentation/batch under the same tenant/site. Receipt edits and evidence linking share a transaction-scoped receipt lock. Once linked, line identity cannot be deleted/reassigned silently. Batch code/date fields may still be corrected through versioned draft save. A dedicated future correction/lifecycle workflow is required for removing an original evidence link.

Evidence membership is persisted in its own scoped receipt/line index and loaded alongside the draft; the receipt snapshot's reserved `evidenceIds` is not automatically rewritten during upload. Consumers must query authoritative evidence metadata, not infer availability from client IDs. Retakes append another upload/evidence identity and retain original images/review history.

## HTTP contract

Same-origin `POST /api/evidence/*` rewrites to gateway `/evidence/*`. All calls require current individual session, session-bound CSRF and exact web Origin. JSON endpoints retain the existing 32 KiB parser bound; binary upload does not enlarge it.

| Action | Input | Result |
| --- | --- | --- |
| begin | SP2-01 EvidenceUploadIntent | Pending metadata; same scoped actor/uploadId + identical normalized intent returns original ID; mismatch is 409 |
| upload | Raw JPEG/PNG bytes; x-tenant-id, x-site-id, x-evidence-id | Verified available or explicit failed metadata; only original uploading actor may retry this upload |
| list | scope, receiptId | Mode/policy and scoped evidence DTOs, without storage keys/paths/public URLs |
| read | scope, id | Authorized image bytes with exact media type, no-store, nosniff and restrictive CSP; unavailable/foreign objects return safe errors |
| review | scope, id, readability=readable/unreadable | Attributable readability assessment; never safety or extraction approval |

Internal equivalents are `/internal/v1/evidence/*`, additionally protected by Kitchen's service credential and independently verified individual session. Binary uploads require a bounded explicit Content-Length and are counted while reading. Both services reject over-limit data before storage. Scope headers never confer authority.

## States, consistency and bytes

- No photo: no associated metadata exists; manual batch/date do not manufacture an image.
- upload_pending: a durable declaration exists; bytes/availability are not yet confirmed.
- failed: actual write/type/size/digest/incomplete failure is recorded. Same-upload retry may recover.
- available: complete bytes passed size, image-signature and SHA-256 verification and were durably published before the database marked availability. Readability initially remains unreviewed.
- unreadable: a separate operator assessment of an available original; preserve it and use retake/manual entry. Extraction stays explicitly disabled, including for readable photos.

The synthetic policy accepts JPEG/PNG, at most 2,097,152 bytes (a lower explicit bound is allowed), at most 20 uploads per line and 1,000 per receipt. These are engineering limits, not legal/provider claims. PNG dimensions are bounded; signature/type validation is not a full decoder, antivirus, legibility or safety assessment. Caller filename is display-only; never a path or serving header.

Private directories require owner-only permissions and must resolve outside public/static/build/dependency roots. Symlink objects/directories and aliases resolving into public roots are rejected. Bytes are staged privately, fsynced, linked exclusively to a server-generated immutable key and directory-synced. Existing originals are verified rather than overwritten. Metadata transitions and append-only attributable events commit together. If the DB fails after file durability, metadata stays pending; same-upload retry verifies/reuses the existing complete bytes and completes the transition.

A crash may leave a private staging/orphan file. No public path exposes it, and it never becomes available solely because a filename exists. Automated orphan purge, retention/holds/export, coordinated DB/file backups and restore are not delivered. No deletion API is exposed. Missing/corrupted bytes produce an explicit read failure, never fabricated content. A local filesystem is not a backup or an OS sandbox.

## UI and configuration

Save the receipt before attaching a photo. File capture/retake is optional; no permission or upload happens automatically. The form distinguishes local preview (not saved), pending/unconfirmed, failed, available and unreadable. Network uncertainty retains the same upload identity/file for explicit retry; reloading lists authoritative metadata without resubmission. Lock/navigation removes local files and blob URLs; offline capture remains disabled. Metadata/errors stay separate from manually entered batch/date.

`EVIDENCE_MODE=disabled` remains the checked-in default and existing local settings are preserved. To exercise synthetic private photos, supply `EVIDENCE_MODE=fixture`, `EVIDENCE_MAX_BYTES=2097152` and an absolute `EVIDENCE_ROOT` outside all public/static roots. Kitchen creates a missing owner-only directory; a preexisting shared/unsafe directory fails visibly. `live` is unsupported. OCR/AI remain disabled. For example, in a local shell:

```sh
EVIDENCE_MODE=fixture EVIDENCE_ROOT="$PWD/.local/private-evidence" EVIDENCE_MAX_BYTES=2097152 npm run dev
```

`npm run smoke` enables fixture images only in its own child processes with a task-owned temporary directory. It deletes only that synthetic test directory after stopping them; default app settings are untouched. Synthetic test metadata is not a reusable business record. For manual environment resets, `infra:reset` still resets databases only; it is not evidence retention/purge. Preserve referenced private files unless deliberately resetting the entire disposable fixture environment.

[Delivery and actual verification](../../delivery/SP2-04.md).
