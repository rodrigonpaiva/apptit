# Docker Compose Workflow

This repository supports two modes in a single `docker-compose.yml`:

## 1) Dev mode (default)
Uses `node:22` images and installs dependencies on container start.

```bash
docker compose up -d
```

Services:
- postgres
- redis
- auth
- gateway
- off-service

Healthchecks are enabled for all services.

## 2) Production-like mode (Dockerfiles)
Builds images per service and runs compiled output.

```bash
docker compose --profile prod up -d --build auth-prod gateway-prod off-service-prod
```

Services in this profile:
- auth-prod
- gateway-prod
- off-service-prod

## Notes
- The `prod` services still depend on `postgres` and `redis`.
- Use `docker compose logs -f <service>` to follow logs.
- Stop everything: `docker compose down`.
- Quick checks: see `docs/compose-quick-checks.md`.
