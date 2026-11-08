# syntax=docker/dockerfile:1
FROM node:22.22.2-bookworm-slim@sha256:9f6d5975c7dca860947d3915877f85607946403fc55349f39b4bc3688448bb6e AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global npm@10.9.7 && npm cache clean --force
ENV NEXT_TELEMETRY_DISABLED=1 NX_DAEMON=false NX_NO_CLOUD=true

FROM base AS dependencies
COPY package.json package-lock.json .npmrc ./
COPY apps/gateway-api/package.json apps/gateway-api/package.json
COPY apps/web/package.json apps/web/package.json
COPY services/identity/package.json services/identity/package.json
COPY services/kitchen/package.json services/kitchen/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/domain-values/package.json packages/domain-values/package.json
COPY packages/runtime/package.json packages/runtime/package.json
RUN npm ci

FROM dependencies AS source
COPY . .

FROM source AS api-build
# Generation needs a syntactically valid URL, never a real connection or build secret.
RUN IDENTITY_DATABASE_URL=postgresql://build:build@127.0.0.1/build node node_modules/prisma/build/index.js generate --config services/identity/prisma.config.ts \
    && KITCHEN_DATABASE_URL=postgresql://build:build@127.0.0.1/build node node_modules/prisma/build/index.js generate --config services/kitchen/prisma.config.ts \
    && node node_modules/typescript/bin/tsc -b

FROM source AS web-build
ARG GATEWAY_PORT=4000
ENV GATEWAY_PORT=$GATEWAY_PORT
RUN node node_modules/typescript/bin/tsc -b packages/contracts packages/runtime \
    && node node_modules/next/dist/bin/next build apps/web --webpack \
    && printf '%s' "$GATEWAY_PORT" > /app/containers/gateway-port

FROM dependencies AS api
ARG VERSION=local
ARG REVISION=unknown
ARG SOURCE=https://github.com/rodrigonpaiva/apptit
LABEL org.opencontainers.image.source=$SOURCE \
      org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$REVISION \
      org.opencontainers.image.title="Apptit backend runtimes"
COPY --from=api-build --chown=node:node /app/packages ./packages
COPY --from=api-build --chown=node:node /app/services ./services
COPY --from=api-build --chown=node:node /app/apps/gateway-api ./apps/gateway-api
COPY --from=api-build --chown=node:node /app/scripts ./scripts
COPY --from=api-build --chown=node:node /app/containers ./containers
USER node
ENTRYPOINT ["node", "containers/entry.mjs"]
CMD ["gateway-api"]

FROM base AS web
ARG VERSION=local
ARG REVISION=unknown
ARG SOURCE=https://github.com/rodrigonpaiva/apptit
LABEL org.opencontainers.image.source=$SOURCE \
      org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$REVISION \
      org.opencontainers.image.title="Apptit web"
ENV NODE_ENV=production
COPY --from=web-build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=web-build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=web-build --chown=node:node /app/apps/web/public ./apps/web/public
COPY --from=web-build --chown=node:node /app/packages/runtime/dist ./packages/runtime/dist
COPY --from=web-build --chown=node:node /app/packages/runtime/package.json ./packages/runtime/package.json
COPY --from=web-build --chown=node:node /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=web-build --chown=node:node /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=web-build --chown=node:node /app/scripts/lib.mjs ./scripts/lib.mjs
COPY --from=web-build --chown=node:node /app/containers/entry.mjs ./containers/entry.mjs
COPY --from=web-build --chown=node:node /app/containers/gateway-port ./containers/gateway-port
RUN mkdir -p node_modules/@apptit && ln -sfn ../../packages/runtime node_modules/@apptit/runtime && ln -sfn ../../packages/contracts node_modules/@apptit/contracts
USER node
ENTRYPOINT ["node", "containers/entry.mjs"]
CMD ["web"]
