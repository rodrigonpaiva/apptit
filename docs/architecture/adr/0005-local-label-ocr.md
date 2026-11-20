# ADR-0005 — Local, reviewable label OCR

Status: adopted for the explicitly authorized AP-128 synthetic receiving extension, 2026-11-13. Supersedes ADR-0004's unselected/disabled OCR position only for this bounded local assistant. AI, cloud OCR, operational acceptance and external image transfer remain unavailable.

Use pinned Tesseract.js 7.0.0/core 7.0.0 with the pinned French traineddata package 1.0.0. All worker/WASM/model resources are served from fixed same-origin allowlisted paths; no runtime CDN or provider receives the label. The user explicitly requests processing of an authorized available original photo. Browser memory holds decoded/resized derived pixels and unreviewed suggestions; originals remain immutable private evidence. No OCR text/image is written to browser storage. Model cache is disabled. Generated bundle code, WASM and language data are not restaurant data.

`OCR_MODE=browser_local` is opt-in; checked-in defaults remain disabled. Evidence listing advertises the local capability; its historical per-image server extraction status remains disabled because no server OCR result is persisted or attested. A client OCR result is untrusted input, not evidence of a backend extraction or validated food safety.

The conservative parser only proposes explicit labelled batch tokens and exact calendar dates with four-digit years. Missing, ambiguous, low-confidence or unlabelled values remain uncertain. It distinguishes use-by and best-before; unknown type needs explicit user choice. User corrects/selects fields and explicitly acknowledges comparison to the visible original before applying changes to the draft. Existing values are never changed on extraction alone.

Reviewed receipt metadata keeps the source photo ID/digest, pinned engine, client-reported extraction time/proposals and selected corrected values. The server checks scope/capability, source availability/digest/line identities and equality with the saved fields under the existing receipt lock. Receipt revisions provide authenticated actor, server time and correlation. Manual edits clear the current OCR association; historical reviewed revisions remain. No new database table is needed because these snapshots are already versioned JSON. Retakes remain separate images. No stock or safety approval follows from OCR/review/save.

Evaluation uses versioned synthetic labels and negative cases. It is not a restaurant-label accuracy benchmark or camera/device certification. The known tradeoff is on-device CPU/memory and dependence on legible framing; timeout/cancellation/unsupported-browser failure preserves manual entry and the original photo. Cloud/vendor selection and operational rollout require separate evaluation.

References: official Tesseract.js API documentation at https://github.com/naptha/tesseract.js/blob/master/docs/api.md and local AP-128 planning. Dependency licenses and the traineddata license must be shipped with the UI notices.
