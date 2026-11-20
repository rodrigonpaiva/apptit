# Run alpha.2 locally with Docker Compose

This is an isolated synthetic demonstration, not a production deployment. It runs the exact published Linux/amd64 API and web digests; Apple Silicon uses Docker's emulation. Application images are pulled, not rebuilt. Only the existing PostgreSQL fixture image is built locally.

Requirements: Docker Desktop running with Docker Compose, Git checkout containing this guide, and Node 22.22.2/npm 10.9.7. No npm dependency installation is needed for these commands. Port 3000 must be free; stop a previous local Apptit session first. Run from the repository root:

```sh
npm run containers:up
```

Open **http://127.0.0.1:3000/login**. Use `127.0.0.1` consistently, not `localhost`. Read your generated login/password from `.local/alpha2/fixture-credentials.json`, for example `chef.a@apptit.test` or `stock.a@apptit.test`. These are private generated synthetic accounts; do not commit or share the credentials.

The runner generates separate credentials under ignored `.local/alpha2/` and preserves them on subsequent starts. It never reads or changes the development `.env` or `.local/fixture-credentials.json`. Keep `.local/alpha2/settings.json` together with the database volume: losing its credentials does not reset an existing database. Migrations and repeatable synthetic seeds run before the application services. Photos persist in a separate private volume; the fixture observation profile is enabled, with stock posting still disabled.

```sh
npm run containers:status
npm run containers:logs
npm run containers:down
npm run containers:up
```

`down` stops/removes this Compose project's containers and network while preserving its named database and private-photo volumes. It does not remove images, credentials or other Docker projects. No reset/delete command is provided. A volume is not a backup.

## Network and privileges

The namespace is owned by the PostgreSQL container. Identity, kitchen, gateway, web and the browser entry share that namespace to preserve the released applications' loopback-only contract. Only an HTTP forwarder on internal port 8080 is published as **127.0.0.1:3000**; database and backend ports are not published. The forwarder preserves Host, Origin, cookies, request bodies and streaming responses. Its bind address inside Docker does not expose the host port on LAN interfaces.

Runtime processes keep the images' `node` user. A short root-only initialization job assigns the private-photo volume to UID/GID 1000, then exits; migration/seed jobs run as `node`. Each service receives role-scoped credentials. The browser forwarder receives none. Readiness of identity/kitchen uses their own internal token without printing it.

Compose file: `containers/local/compose.yaml`. The project name is `apptit-alpha2-local`; it is a single local demonstration environment. Do not use it for real restaurant data or concurrently manipulate the same project from another checkout. Do not run `docker compose config` in shared logs: resolved env files contain credentials.

## Look up actual public Open Food Facts products

Fresh synthetic environments use recorded examples (`OFF_MODE=fixture`). To search the real public database by barcode in the receiving tab, explicitly enable read-only access:

```sh
npm run containers:off:live
```

The command preserves credentials, database, private photos and image digests, changes only the persisted OFF mode and restarts the Compose services with that setting. It sends the barcode through the existing protected backend adapter to the fixed public OFF host; private restaurant details and photos are not submitted. The adapter retains its bounded timeout, cache and request budget. No OFF write/contribution is performed. Ordinary `containers:up` preserves the selected mode.

In **Réception**, enter the textual barcode and select **Identifier**, then **Ajouter une ligne de réception**. Available product name and nominal presentation prefill the editable fields. Missing values remain empty for completion from the physical label. Batch, expiry, actual quantity and physical-match confirmation are always entered/checked by the user; the barcode does not establish them. A missing product or provider outage keeps manual entry available. Imported reference data remains unreviewed and draft save still creates no stock.

For repeatable fixture demonstrations/tests, restore the examples:

```sh
npm run containers:off:fixture
```

A useful public example for a manual connectivity check is `3017620422003`; availability and content belong to OFF and can change. External reads are not a deterministic CI dependency. The separate identification view also shows available brand, allergen/nutrition declarations and source information; these are not editable received-batch facts or a completed nutrition/allergen review workflow.

## Local OCR preview (AP-128)

Published alpha.2 digests do not contain AP-128. Keep those images/tags intact. Build a clean committed AP-128 checkout into separate **local-only** images:

```sh
npm run containers:build -- --version local-ap128 --report .local/alpha2/ocr-images.json
npm run containers:ocr:preview
```

The preview verifies image IDs and OCI source revision/version, writes a private Compose override and enables `OCR_MODE=browser_local`. It reuses the same local database, private-photo volume, accounts and loopback URL. `containers:up`, `down`, status and logs retain this selected preview. The images are never pushed to GHCR by these commands. Return to the published alpha.2 runtime without deleting data:

```sh
npm run containers:release
```

In receiving, save the draft, upload a legible JPEG/PNG label, then select **Proposer le lot et la date depuis cette photo**. Compare the displayed original, correct the proposals, select the fields to apply and confirm comparison. Applying changes only the draft; save it to retain source provenance and the actor-attributed revision. No stock is posted. Dates without a reliable type, ambiguous dates/batches, short years and low-confidence readings require manual completion. Clear framing and a readable label matter; this local synthetic evaluation is not an operational accuracy guarantee.

OCR stays on device; worker/WASM/French model assets are served by the app, with no image sent to a cloud OCR API. A 60-second UI deadline, cancellation, photo read failure or unsupported browser leaves manual entry and the original photo available. Browser worker initialization failure may require reloading before another OCR attempt. Model/image memory is discarded; no OCR image/text is stored in IndexedDB/localStorage. Scope/session lock discards in-flight local state.
