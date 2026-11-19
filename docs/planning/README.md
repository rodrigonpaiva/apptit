# Execution tracking and maintenance

[Current delivery matrix](DELIVERY-STATUS.md) · [Machine-readable register](delivery-status.json)

This versioned register reconciles execution against the original local specification v0.80, backlog v1.0 (AP-001–AP-173) and first-four-sprints v1.0. It is the execution index, not a second specification or a replacement backlog. The original planning files remain local and are not added to Git by this task. Their recorded fingerprints identify the reviewed baseline.

## Status rules

- `integrated` is a bounded SP/extension delivery with evidence and a dev integration reference.
- `planned` has no implementation acceptance assertion.
- Parent `partial` means linked work covers a subset or contract, or full parent acceptance has not been recorded. A child finishing does not automatically finish its parent.
- Parent `not_assessed` means this reconciliation maps no delivered child. It does not claim the story is absent, blocked, ready, or unnecessary.
- No AP parent is marked Done here. To close one later, review every original criterion and dependency, actual evidence and remaining applicable gates, then deliberately extend the register/checker to represent that full acceptance. Do not merely rename a status or infer completion from PR merge.

The 37 partial parents are an evidence inventory, not a percentage of MVP completion. The remaining 136 require assessment as their scope is refined. All 173 original IDs are explicitly present in JSON. Original acceptance criteria and commercial/food-safety rules are not copied or changed. SP1-01/SP1-02 point to the integrated Sprint 1 verification checkpoint (PR #5), not a claim that their original authoring commits were created in that PR. Retrospective extension mappings are labelled as such.

## Snapshot, runtime and release are different

The assessed dev baseline is `cb112eeb6775c6248e7422285f297102da871d38` (PR #28). That is the reviewed application baseline; a later documentation commit naturally has a different SHA. [Exact-head dev CI](https://github.com/rodrigonpaiva/apptit/actions/runs/43650608814) passed.

- Sprint 1 and Sprint 2 technical acceptances cover their bounded synthetic increments. They do not prove whole-parent completion, independent review or live restaurant readiness. Their original test counts and source SHAs stay historical.
- OCR PR #26, reference photos/destinations PR #27 and logical location removal/layout PR #28 are integrated after the Sprint 2 release. Their own CI/evidence covers those extensions.
- Published `v0.1.0-alpha.2` is still pinned to `4c84d4663a172b7849ed222aea5e19652d1f23e0`; it does not include those extensions. Both existing packages were retained publicly by explicit owner decision; see the [recorded retention decision](../evidence/ghcr/alpha2-recovery-attempt/README.md). This is not a new publication authorization. Alpha.1's historical missing-container-source limitation remains.
- Local preview metadata last records clean ARM64 images at `c09864ad8651679620367be53d9634ad1399d9ef`, the feature source merged by PR #28. Image IDs/profile metadata are not a running-service check or GHCR manifest proof. On the 2026-11-19 read-only inspection, the Docker daemon was unreachable and port 3000 returned no HTTP response; nothing was started.
- Historical disk/Docker blockers in AP-128 describe its original execution. Current availability must be checked independently; an old failure is neither a permanent implementation blocker nor a current pass.

## Next work and open boundaries

Next planned package: **SP3-01**, ledger/operation outcomes. SP2-01, SP1-03 and SP2-06 are integrated prerequisites. This planning readiness does not activate stock operations. Refine stable product/presentation identity, transactional availability/concurrency and event boundaries before dependent confirmation. Reserve/kitchen semantics and removal of locations carrying future stock also need deliberate treatment in the stock slice.

Independent review remains unrecorded for the reconciled scope. Real PMS/restaurant authorization, device qualification, offline persistence, full retention/restore and operational stock policies remain separate gates. Their absence does not forbid bounded synthetic construction. Do not remove them or mark them complete to tidy the register.

## Updating the record

The integration owner maintains `delivery-status.json`. After a bounded delivery:

1. Read the applicable original AP criteria/dependencies and SP boundary from the authorized local planning files. Obtain missing sources before changing business scope.
2. Add/update the child mapping, evidence paths, integration PR/commit and honest review status. Update affected parents' remaining boundaries; leave unrelated parents not assessed. Record actual executed results separately from not-executed checks.
3. Advance `asOf` and `assessedDevCommit` only to the assessed integrated application baseline. A documentation PR does not claim future application evidence. Refresh source fingerprints only after reconciling any changed planning source.
4. Run `node scripts/delivery-status.mjs --write`, then `node scripts/delivery-status.mjs --check`; commit JSON and rendered Markdown together. The checker validates IDs, reciprocal mappings, existing evidence, prerequisite references and generated output. It compares local source fingerprints when available; CI needs no private/local planning files.
5. Preserve historical test logs, image reports and release tags. Add a dated reconciliation notice rather than changing old failed/pending evidence into a success. Integrate through the usual PR/CI flow.

The automated checker validates internal consistency, not semantic correctness, remote merge/check status, operational policies or actual application behavior. The owner must inspect the linked evidence; CI success is not independent review.
