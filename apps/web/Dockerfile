# Build dependencies
FROM node:22-alpine AS deps
WORKDIR /repo
COPY package*.json ./
RUN npm ci

# Build web
FROM node:22-alpine AS builder
WORKDIR /repo
COPY . .
RUN npm ci
RUN npx nx build web

# Next.js standalone output (if using output:standalone)
# Otherwise copy .next + node_modules
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Try to copy standalone build; fallback to .next
# Adjust the paths based on your Next.js config
COPY --from=builder /repo/dist/apps/web ./dist
COPY --from=builder /repo/apps/web/.next ./.next
COPY --from=deps /repo/node_modules ./node_modules
COPY /apps/web/public ./public
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]
