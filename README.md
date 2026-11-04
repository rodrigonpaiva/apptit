# Apptit

Restart baseline for a B2B foodservice planning, execution and inventory platform.

## Product and delivery

- [Product specification v0.80](plans/APPTIT_SPEC_v0.80_EN.md)
- [Delivery backlog v1.0](plans/backlog/APPTIT_BACKLOG_v1.0_EN.md)
- [First four sprints](plans/sprints/APPTIT_SPRINTS_01-04_v1.0_EN.md)

## Engineering

- [First-slice architecture and ADRs](docs/architecture/README.md)
- [Typed contract specification](docs/architecture/contracts/first-slice.md)
- [SP1-01 acceptance evidence and SP1-02 handoff](docs/delivery/SP1-01.md)

## Branch workflow

Work on a feature branch from `dev`, open a PR into `dev`, wait for its complete CI, then promote `dev` to `main`. Run `npm run git:setup` in each checkout. [Workflow and current protection limitation](docs/development/branch-workflow.md).

## Local development

Requires Node 22.22.2, npm 10.9.7 and a running Docker daemon.

```sh
npm ci
npm run local:env
npm run dev
```

Open http://127.0.0.1:3000. This is a synthetic development shell; login and operational flows arrive in later packages.

- [Setup, commands and troubleshooting](docs/development/local-development.md)
- [Toolchain compatibility](docs/development/toolchain.md)
- [SP1-02 acceptance evidence](docs/delivery/SP1-02.md)

Run `npm run check` for schema/lint/type/contract/test/build verification. Run `npm run smoke` after building and starting/migrating/seeding the synthetic databases as documented. No real restaurant approval or deployment is claimed.
