# SP2-02 — Product identification, camera and OFF read-only lookup

Date: 2026-11-06. Kitchen owns the lookup adapter. Shared contracts are in `packages/contracts/src/product-lookup.ts`; the existing catalogue/Identity boundaries still authorize every scoped read. This package creates no product, receipt, batch, date, quantity, evidence upload or stock movement.

## Source and identity boundary

GraphQL `productLookup(input:{scope:{tenantId,siteId},barcode})` is a protected query. Gateway verifies catalogue.read; Kitchen independently verifies service identity, the end-user session and that capability/scope before any local/source lookup. Local candidates are filtered by **both tenant and site** and exact textual barcode. Service credentials alone do not grant access. Source outages do not bypass private authorization. Public source data may be shared through cache; local restaurant candidates never enter that cache.

Only 8/12/13/14 digit strings are accepted. Leading zeros and original length are preserved; no JS-number coercion, client URL, arbitrary source host or silent barcode normalization is accepted. The provider can return a padded equivalent UPC/EAN code; comparison verifies digit-string equivalence without rewriting the submitted code. Other formats/unknown bulk codes use manual identification. A code identifies a reference/presentation, never an actual received batch/date/quantity.

`found`, `incomplete`, `absent` and `unavailable` are distinct. A found/incomplete product carries name, brand, descriptive nominal presentation, allergen declaration and a small supported nutrition summary. Unknown fields retain a reason. Empty allergen arrays stay unknown, never allergen-free. Nutrition requires the declared 100g/100ml basis and all five supported source fields; absent/unsupported facts stay unknown rather than invented zero. Supported numeric zero remains zero. All fields are imported/unreviewed candidates, not safety or physical-match approval.

Source metadata includes provider, product URL, pinned API version, lookup timestamp, known source modification date, cache status, synthetic flag and unreviewed status. UI distinguishes synthetic examples and unvalidated external data. No imported attribute is automatically merged into the private catalogue or used as actual delivery evidence.

## Explicit modes

| OFF_MODE | Behavior |
| --- | --- |
| disabled | Unavailable/disabled source with scoped local/manual alternatives; no public request. |
| fixture | Deterministic illustrative OFF-shaped responses; no network. Default for fresh setup and local smoke. |
| live | Explicit public read-only GET, requiring the configured application User-Agent; no credentials trigger auto-activation. |

Fixture examples: `0012345678905` found, `0000000000123` incomplete, `12345678` absent, `9999999999999` simulated outage. Equivalent leading-zero representations of the two fixture references are recognized by the source simulation while preserving the input. Fixture values are fictional, not a verified OFF product or real physical label.

The live adapter uses only `https://world.openfoodfacts.org/api/v3.4/product/{digits}` and an explicit field allowlist. **v3.4 is deliberately pinned** to its flat nutriments read schema; OFF currently recommends v3.6, which changes nutrition/tags. A version upgrade needs mapping/fixture tests, not silent adoption. A real read using this adapter was checked with public example code 3017620422003: found, synthetic=false, reviewState=unreviewed. No private identity, tenant/site, session, image, manual label text or stock value was sent. No OFF write/contribution/form/contact request was made.

`OFF_USER_AGENT=Apptit/0.0.0 (https://github.com/rodrigonpaiva/apptit)` identifies the application. OFF_TIMEOUT_MS defaults to 5000 and is bounded at 10000. Response bytes are bounded at 256000; malformed, oversized, wrong-product or unexpected status bodies are unavailable, not absent. Redirects are rejected. No automatic retries occur.

A bounded 200-entry in-memory public-source cache uses OFF_CACHE_SECONDS (default 900, max 86400). Same-code in-flight reads coalesce. Expired results are not silently reused during failure. Authorization is still fresh before cache access. A conservative ten-source-requests/minute budget applies to this one local Kitchen process. HTTP 429 honors numeric/date Retry-After and blocks new public reads; reported seconds are bounded to GraphQL's signed Int range. No cluster-wide rate limiter is claimed. Provider quotas remain an external contract to recheck before broader use.

## API/source reuse review

Reviewed official API introduction, version/schema change log, barcode tutorial, licensing page and installed decoder documentation. The [API introduction](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/) lists public-read limits and identification expectations; [schema changes](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/ref-api-and-product-schema-change-log/) explain the version pin. [Reuse/licensing documentation](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/license-be-on-the-legal-side/) distinguishes ODbL database, DbCL contents and image-specific terms. The UI attributes source data and links to the provider; no product images are imported.

The provider's linked terms page returned a bot-indexing notice during automated retrieval. No full legal/commercial reuse approval is claimed. Public source cache stays separate from private restaurant data, with no database export/public contribution/combined-data publication in this slice. Broader reuse/deployment needs an explicit assessment of the actual use case and current terms; application tests do not certify license compliance.

## Camera and local decoder

`zxing-wasm@3.1.6` is pinned in the web workspace. The client lazily imports its reader and fetches the matching reader WASM from same-origin GET `/api/scanner?v=3.1.6`. The Node handler serves one fixed dependency file with the correct MIME and rejects other versions; it accepts no image/path input. Next file tracing explicitly includes that asset from the monorepo. Its file path assumes the prescribed apps/web runtime working directory; no standalone deployment is claimed.

No decoder CDN or external camera service is used. Camera frames are converted to bounded local canvas frames (maximum width 960), decoded on device and never uploaded. Formats are limited to EAN13/EAN8/UPC-A/UPC-E/ITF14 for this reference lookup. One successful reading stops the stream and issues one lookup; repeated frames never add quantities. A 30-second scan timeout, unsupported browser, denied camera or decoder failure keeps manual entry available. All tracks stop on close, successful read, unmount/focus lock and late permission completion after cancellation.

Public license notices are in `/licenses/zxing-wasm.txt` (MIT) and `/licenses/zxing-cpp.txt` (Apache-2.0). See [official reader usage](https://github.com/Sec-ant/zxing-wasm#usage). Camera access requires permission and a browser secure context; local loopback works in the tested Chromium. This runtime still rejects non-loopback/live deployment. Phone/tablet viewports and synthetic video do not prove physical-camera/Safari performance.

## Visible identification and manual fallback

The workspace's “Identifier un produit” navigation opens an anchored section with typed code and optional camera. It shows separate loading/result/error states, missing values, provider/freshness/attribution and same-site existing catalogue candidates. The optional manual label form supports bulk/no-code cases, editable observed name/presentation and an explicit physical-comparison acknowledgement before a **temporary preview**.

The preview is not recorded, creates no reference/receipt/batch/stock and cannot validate allergens/nutrition/safety. Manual text never reaches OFF. Scanning is only identification; saving actual receipts remains SP2-03. Locking or site/user changes unmount the entire private section, abort pending client reads, stop camera tracks and discard temporary fields/results. No browser storage, offline queue or camera image persistence is added.

## Verification boundary

Six adapter test groups use controlled fetch responses to exercise states, public-only transport, cache/coalescing/expiry, 404/429/503/malformed/oversized data, Retry-After and local budget/deadlines. HTTP smoke requires fixture mode and tests actual protected lookup, all four fixture states, wrong scope, unauthenticated/service-only denial, private-candidate isolation, revocation and Identity outage. Browser checks use a production build and actual decoder with generated synthetic EAN frames, plus explicit mocks for denied/late camera permission. No external API is a deterministic test dependency.

### Product card update

The lookup now requests the public front thumbnail and displays it with Open Food Facts contributor attribution and CC BY-SA 3.0 link. Only HTTPS images.openfoodfacts.org product-image paths are accepted; no credentials or referrer are sent. Images load directly from the public host, are not persisted, and missing/failed photos show a placeholder. Declared allergen tags are highlighted with French labels; missing declarations remain unknown. The previous browser no-external-request evidence applies to fixture mode (which has no photo), not live thumbnail loads.
