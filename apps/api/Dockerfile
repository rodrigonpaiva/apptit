FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json turbo.json ./

COPY apps/api/package.json apps/api/package.json
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY apps/landing/package.json apps/landing/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm install --frozen-lockfile

COPY . .

WORKDIR /app/apps/api

RUN npm run build

EXPOSE 8000

CMD ["npm", "run", "start:prod"]