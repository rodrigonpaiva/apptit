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
