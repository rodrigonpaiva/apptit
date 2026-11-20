# Sprint and release checkpoint

Verified: 2026-11-20 (Europe/Paris). This checkpoint reconciles integrated code and remote evidence; it does not rerun or replace historical acceptance tests.

## Where development stopped

| Sprint | Delivered scope | Status |
| --- | --- | --- |
| 1 | Executable foundation, individual scoped access, private catalogue, quantity/version primitives | SP1-01–SP1-06 integrated; bounded synthetic acceptance recorded |
| 2 | Product identification, persisted receipt drafts, private label evidence, procedure-bound observations, committed-save recovery | SP2-01–SP2-06 integrated; online synthetic acceptance passed |
| 3 | Transactional stock ledger, partial acceptance, restrictions, opening balances and transfers | SP3-01–SP3-06 planned |
| 4 | Recipe drafts, Excel import and stock-based planning simulation | SP4-01–SP4-06 planned |

The [execution matrix](DELIVERY-STATUS.md) maps all 24 packages and 173 parent stories. Twelve packages are integrated; no full AP parent is asserted Done. [Sprint 2 acceptance](../delivery/SPRINT-2-ACCEPTANCE.md) records 54 unit/configuration tests, 41 PostgreSQL integration tests with zero skips, HTTP smoke and 12 browser scenarios on its exact historical source. Later extensions have separate evidence.

Code retains receipt draft operations, evidence and immutable observation history. `ReceiptLedgerEntry` and `ReceiptStockPort` remain future contracts; Kitchen has no persisted stock ledger or balance model. Physical storage destinations do not constitute inventory. Saving or reviewing a receipt creates no usable stock.

## Integrated extensions and published release

After Sprint 2, integration added local Compose, explicit live read-only OFF lookup, optional local OCR with human review, reference photos, named physical destinations and logical removal, plus persistent site-scoped product/presentation identity. See the [extension evidence](DELIVERY-STATUS.md#post-sprint-2-extensions) and [alpha.3 acceptance](../delivery/RELEASE-ALPHA3-ACCEPTANCE.md).

The receiving baseline reached dev at `0d67259b233ebec8f27b4aa8901c0d9148434857`; [exact-head dev CI passed](https://github.com/rodrigonpaiva/apptit/actions/runs/44711691301). [Promotion PR #33](https://github.com/rodrigonpaiva/apptit/pull/33) merged into main as `fb63233717b268df66f30233a337e0f747e7d485`; [main CI passed](https://github.com/rodrigonpaiva/apptit/actions/runs/44712046862). These are the baseline checkpoints before this documentation maintenance, not assertions about future branch heads.

[Release v0.1.0-alpha.3](https://github.com/rodrigonpaiva/apptit/releases/tag/v0.1.0-alpha.3) was published on 2026-11-20. Its [container publication workflow](https://github.com/rodrigonpaiva/apptit/actions/runs/44712108213) records paired public Linux/amd64 images and attached sanitized evidence:

| Image | Published manifest digest |
| --- | --- |
| `ghcr.io/rodrigonpaiva/apptit-api:v0.1.0-alpha.3` | `sha256:b2527f623e40c77189144366105064c423f6105746549bc1e7d760350dda062b` |
| `ghcr.io/rodrigonpaiva/apptit-web:v0.1.0-alpha.3` | `sha256:da1f66c41197ead93a4d54576d0f0d1c3c365d0e7ee4f364334b25f8927befb2` |

Publication does not upgrade an existing local profile or restart containers. Alpha.2 tags/evidence remain historical and unchanged. Documentation promotion does not rebuild or retag these images.

## Shared UI maintenance after this checkpoint

The [shared UI delivery](../delivery/UI-MIGRATION.md) introduces @apptit/ui, shadcn/Radix controls, Tailwind tokens, storage/receiving migration and scoped success notifications. This is presentation maintenance with separate evidence; the historical sprint acceptance, release tag and AP parent statuses above remain unchanged.

## Next implementation: SP3-01

Start `feature/sp3-01-stock-ledger` from current dev after its exact-head CI passes. Refine and implement transactional batch entries and balance readers, durable operation outcomes, identical-command replay, payload mismatch rejection and concurrent availability protection. Preserve site/location/product/presentation/batch/unit/basis/reason/actor attribution. Verify rollback, uncertain outcomes and contention before connecting receipt confirmation in SP3-02.

Real PMS activation, restaurant authorization, operational policy validation, offline persistence, full retention/restore and device qualification remain open. This checkpoint introduces no stock effect or production deployment.
