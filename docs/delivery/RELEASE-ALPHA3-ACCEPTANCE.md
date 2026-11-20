# Alpha.3 — Receiving extensions release acceptance

Date: 2026-11-20 (Europe/Paris). Scope: synthetic receiving after Sprint 2; no Sprint 3 stock activation or restaurant readiness. Owner: coding/integration agent. Independent approval has not been recorded.

Validated application source: `1b8f600644d7636a31fdbdc1f48b538de881fb37`. This release-specific acceptance supplements the historical [Sprint 2 acceptance](SPRINT-2-ACCEPTANCE.md); it does not change its manifest, source SHA, past outcomes or published alpha.2 tag.

The integrated baseline contains local Compose and explicit OFF mode selection, opt-in local reviewed OCR, reference photos, named physical destinations with logical deletion, and persistent scoped product/presentation identity. Traceability is recorded in the [execution matrix](../planning/DELIVERY-STATUS.md). Full AP parents remain partial; next implementation package is SP3-01.

## Actual evidence

- PR #30 and verification/tracking PR #31 passed required CI and paired container/browser evaluation. Foundation covered lint, types, contracts, build, 81 root tests, 52 real PostgreSQL tests and HTTP smoke. Existing OCR/scanner/photo/storage browser flows and six persistent-identity browser scenarios passed, including response loss/retry and legacy association. The post-integration lock probe observed actual blocked deactivation. [Identity delivery](RECEIVING-PERSISTENT-IDENTITY.md) links exact source runs and limitations.
- On 2026-11-20, both clean-source alpha.3-labelled local images were built from the validated application commit, with OCI source/version/revision, nonroot user and no host credentials/configuration bundled. [Build report](evidence/alpha3/images.json).
- Both images passed fresh disposable PostgreSQL migrations, repeated seeds, independent runtime roles, API readiness, web HTTP, authenticated scoped draft/evidence/observation smoke, unchanged stock counts and explicit dependency failure. No ports were published and task-owned resources were cleaned up. [Validation report](evidence/alpha3/validation.json).
- These local images are Linux/arm64 configuration IDs, not registry manifest digests or an amd64 publication claim. The publisher must rebuild and validate both images from the exact immutable release tag on Linux/amd64 before either push. Any application/runtime dependency drift from this validated source is rejected.

## Release/publication boundary

The owner explicitly authorized `v0.1.0-alpha.3` as public in the same `apptit-api` and `apptit-web` packages on 2026-11-20. The [bounded approval](../releases/alpha3-publication-approval.json) permits only this version, validated application source and Linux/amd64 pair. Existing alpha.2 public retention remains a separate decision; no tag, digest or `latest` is overwritten. Private remains the default for unapproved publication contexts. Both existing packages must still be public before any alpha.3 push, and visibility/digests are verified after each push and again at the end. Partial/uncertain outcomes remain explicit.

Preparation integrates through a dev PR and exact-head CI, followed by a regular dev-to-main promotion PR. Only after promotion/validation will the immutable alpha.3 prerelease be published and its release event invoke the existing workflow using GITHUB_TOKEN. Registry results/digests do not exist merely because this acceptance passed; inspect the actual publication artifact before reporting success.

No live OFF availability, physical camera qualification, real-label accuracy benchmark, operational PMS, production readiness, complete offline capture or usable stock is asserted. Published images retain the synthetic loopback-only operating model. Existing user containers, private data/credentials and historical releases are preserved by this preparation.

Preparation verification: 39 publication/registry/retention tests passed, including bounded public authorization, denied version/source/platform, no overwrite, runtime drift, both digests and partial second-push failure. Repository lint passed. The application itself is unchanged from the validated source; canonical CI still runs on preparation and promotion commits.

Canonical `npm run check` passed on the preparation tree: 88 root tests, schema/lint/types/contracts and all seven project builds. The source gate also covers runtime/probe scripts; only the two explicitly reviewed publication-policy modules are excluded from that runtime diff. No runtime, dependency or container entry point changed.
