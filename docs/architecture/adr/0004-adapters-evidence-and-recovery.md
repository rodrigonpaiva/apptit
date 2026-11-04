# ADR-0004 — Adapter modes, evidence and recovery boundaries

- Date: 2026-11-04
- Status: local engineering baseline selected; live data/policies unresolved
- Sources: §§10–14, RF-02.1/RF-08.2; AP-010/AP-011/AP-012; SP1-01 AC3.

## Modes and failure

Each capability declares `disabled`, `fixture` or `live`; optional integrations default disabled, never auto-detect a credential and turn live. Fixture responses are labelled synthetic in data and UI. Required runtime settings validate at startup with redacted errors. A selected optional live adapter with missing settings fails that capability visibly; other manual paths remain usable. The process must never claim ready for a configured required adapter that failed initialization. Secrets remain outside version control.

| Adapter / responsibility | Classification | First-slice behavior / fallback |
| --- | --- | --- |
| PostgreSQL + Prisma | Selected local | Required for persisted paths; missing DB config blocks that service |
| Identity sessions | Selected local | Required for private paths; outage denies access, preserves error state |
| Catalogue reference source | Selected fixture | Explicit synthetic seed; no automatic remote enrichment |
| Open Food Facts | Fixture selected; live read-only evaluation | Found/absent/incomplete/unavailable are distinct; reviewed local/label input remains available |
| Evidence storage | Selected private filesystem for synthetic Sprint 2 | Outside public/web roots, inaccessible by static URL; upload/read through authenticated scope-checked handler |
| Cloud object storage | Evaluation-only | No provider/account selected; storage port preserves later replaceability |
| Redis | Evaluation-only cache/rate-limiter candidate | No initial process/dependency; never session, safety or stock authority |
| Kafka | Evaluation-only durable event transport | No initial broker; eventual transport consumes outbox contract, not dual DB/broker writes |
| AI / OCR / forecast model | Disabled, provider evaluation pending | No invented extraction/prediction; manual capture/planning and explicit unknowns |
| Email/SMS/notifications | Disabled | No delivery claim; local status is not external notification |
| Innovorder | File-contract evaluation, no live API | Authorized sample pending; synthetic import later, no account connection |
| Cloud, SSO, IoT, player/printer | Disabled / deferred choice | No infrastructure, purchase or remote activation |

For eventual OFF live reads, review API license/attribution/cache and image-specific terms, current endpoint/limits, identifiable User-Agent, bounded timeouts, 429/Retry-After behavior and capped read retries. Record source ID/URL/retrieval time/version, field freshness and review status. A missing allergen field remains unknown. Send only necessary public product lookup data, never tenant stock or evidence. No write/contribution calls. Do not treat API availability as label/batch verification. Numeric timeout/cache/retry settings are explicit adapter configuration checked when enabled, not frozen provider limits here.

For AI/OCR evaluation record data categories, purpose, provider retention/training/region terms, cost/time limits, output schema, provenance and human review. No private-data transfer or cross-customer training by default. Selection requires a separate concrete adapter decision; no vendor chosen by this package.

## Evidence contract and provisional retention matrix

File handling creates scoped metadata with generated storage key, pending/available/failed states, byte size, media type, digest, original author, recorded/captured times and receipt/product/batch references where known. Validate byte limits and content type, prevent traversal and executable public serving. Limits are required configuration before enabling upload. Stream bytes through authorized endpoints; do not trust filename/path or caller-supplied author. Original bytes are immutable; derived images carry their own provenance. Publish available metadata only after durable bytes; failed/orphan uploads remain explicit and reconcile by upload ID. Cross-filesystem/DB atomicity is not assumed. Receipt stock confirmation may only reference evidence in an allowed verified state under its procedure contract.

| Category | Purpose / access | Synthetic baseline | Live unresolved authority |
| --- | --- | --- | --- |
| Business/audit/operation records | Scoped history and retry recovery | Keep until explicit full fixture reset | Retention, export, operator transfer, correction/deletion obligations |
| Original photos/import files | Private source evidence | Keep while referenced; no automatic purge | Category-specific duration, storage region, incident/legal holds |
| Session data/credential hashes | Identity and revocation | Access restricted to Identity; configured expiry | Security retention and account closure policy |
| Local unsent drafts | Original operator capture | Disabled initially | Ownership, device loss, recovery/export, consent and purge rules |
| Diagnostic logs | Operational failure analysis | Redacted; no evidence/token payloads | Approved duration/access and incident use |

No universal retention duration is selected. A hold prevents relevant evidence deletion until an authorized documented release. Later purge/export jobs must enforce category/scope/holds and reference integrity; no such job is enabled here. Synthetic reset is a clearly named destructive developer action covering DBs/files together, never an inferred production retention policy. Employee diagnosis/health capture is outside these contracts.

## Recovery and observability

Local named volumes persist restart data; volumes are not backups. SP1-02 documents repeatable seed/start/reset and later schema migration. Before live use choose deployment region/provider, key management, backup frequency/location, RPO/RTO, accountable restore operator and rehearse database + evidence recovery. Preserve operation IDs and outbox/inbox across restore; reconcile before reopening effectful endpoints. Do not promise availability or restore times without evidence.

Log correlation, operation, action, safe error code and scoped resource references with restricted access. Track dependency readiness, auth denial, conflicts, uncertain operations, pending uploads and eventual outbox lag. Do not log session secrets, passwords, original photos or whole provider payloads. Private errors disclose no stack, SQL or cross-site resource.

## References

[OFF official API documentation](https://openfoodfacts.github.io/openfoodfacts-server/api/) consulted for integration requirements. Provider-specific license and rate-limit validation remains a live-adapter prerequisite; this document does not claim legal verification. No medical/legal operational rule is selected here.
