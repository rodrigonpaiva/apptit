FROM node:22-bookworm-slim AS deps
WORKDIR /workspace

RUN apt-get update -y && apt-get install -y openssl

COPY package.json package-lock.json nx.json tsconfig.base.json tsconfig.nest.json ./
COPY packages ./packages
COPY apps ./apps

RUN npm ci

FROM deps AS build
RUN npx nx build @apptit/gateway

FROM node:22-bookworm-slim AS runner
WORKDIR /workspace
ENV NODE_ENV=production

COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/dist ./dist
COPY --from=build /workspace/packages ./packages

EXPOSE 4000
CMD ["node", "dist/apps/gateway/main.js"]
