# Real barcode lookup in local alpha.2 receiving

Task: enable the existing receiving prefill against actual Open Food Facts rather than recorded examples, as explicitly requested by the owner. Infrastructure/configuration owner: coding agent. Branch: `fix/containers-live-off-lookup`, based on dev `b07f7889c8d8c7ecd497d137649b45bca9a943a0`. No independent review is claimed.

Sources: local sprint plan v1.0 SP2-02 AC1–AC3, specification v0.80 barcode receiving flow, `docs/architecture/contracts/product-identification.md`. Existing receiving code already looks up the protected reference and prefills editable name/presentation. The active local environment used `OFF_MODE=fixture`, which cannot find ordinary real product codes. No application code or published image change is necessary for the supported prefill.

Delivered: explicit `containers:off:live` / `containers:off:fixture` commands, preserving generated settings except OFF_MODE, credentials, database/photo volumes and the exact alpha.2 digests. The selected mode persists across ordinary startup. Fixture remains the default and deterministic CI dependency. Commands restart the local services. Local manual verification now uses live read-only mode.

Scope limits: public barcode reference GET only; fixed allowlisted OFF host, existing User-Agent, timeout, cache and request budget. No private restaurant/session/label content or photo is sent to OFF. No contribution, product write, stock transaction, real operational PMS or provider-version migration. Imported values remain unreviewed. Actual batch/date/quantity and physical comparison are entered by the user. Editable brand/allergen/nutrition persistence remains outside this existing receipt DTO and is not claimed by this configuration fix.

Verification:

- `node --test tests/local-container-mode.test.mjs`: passed. In an isolated temporary checkout with a fake Docker executable, fixture→live→fixture preserved all other settings and account credentials, kept Kitchen's role isolation and invoked startup without deleting volumes.
- Focused ESLint on runner/test and `git diff --check`: passed.
- `npm run containers:off:live`: passed; all services healthy using unchanged published digests and persistent volumes.
- Authenticated host web→GraphQL→Kitchen→OFF lookup for public code `3017620422003`: found `Nutella`, presentation `400 g e`, `synthetic=false`, `reviewState=unreviewed`, API 3.4. Sanitized public-only result: `evidence/local-alpha2-off-live/lookup.json`. This manual external check is not a deterministic CI test or a claim about future source contents.
- The published receiving form's lookup handler was inspected: it passes available name/presentation into an explicit candidate, then editable receipt fields after adding a line, with missing values empty. Existing separate batch/date/quantity inputs remain manual.
- New browser automation was not executed: the connected Playwright server could not start because its expected Google Chrome executable is absent. No browser was installed or user profile altered. The actual HTTP lookup passed; prior fixture browser coverage remains historical evidence, not a new live browser pass.

The official [OFF API introduction](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/) was rechecked: identify requests with the application User-Agent, respect read limits and keep external declarations unreviewed. The existing adapter's pinned 3.4 mapping is retained; no silent upgrade to 3.6 is introduced.
