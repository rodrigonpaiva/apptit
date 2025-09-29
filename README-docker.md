# Apptit – Docker (dev & prod)

## Dev
- Start: `docker compose -f docker-compose.dev.yml up --build`
- API: http://localhost:4000
- Web: http://localhost:3000
- Mongo: mongodb://localhost:27017 (container "db")
- Redis: redis://localhost:6379 (container "redis")
- Hot reload via bind mounts.

## Prod (demo)
- Build & run: `docker compose -f docker-compose.prod.yml up -d --build`
- Nginx listens on :80 (and 443 if you add TLS).
- Set real secrets in `.env.production` or GitHub Actions envs.

## Notes
- Next.js standalone preferred. If your build doesn’t emit `.next/standalone`, adjust the web Dockerfile CMD to `node server.js` or `npx next start -p 3000`.
- Ensure API exposes `/health` for liveness probes.
- For Kafka later, add a service (e.g., bitnami/kafka) and pass `KAFKA_BROKERS` to API.
