FROM node:22-alpine AS deps
WORKDIR /repo
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /repo
COPY . .
RUN npm ci
RUN npx nx build @apptit/api

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy only built artifacts and runtime deps
COPY --from=builder /repo/dist/apps/api ./dist
COPY --from=deps /repo/node_modules ./node_modules
# Default port (can be overridden)
ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/main.js"]
