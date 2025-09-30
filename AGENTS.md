# Repository Guidelines

## Project Structure & Module Organization

This Nx workspace organizes deliverables by surface. `api/` hosts the NestJS service with entry `src/main.ts`, feature modules in `src/app`, assets under `src/assets/`, and build artifacts in `dist/`. `web/` contains the Next.js 15 UI (`src/app` routes, shared media in `public/`, compiled output in `.next/`). `mobile/` ships the React Native clients with `src/main.tsx` for devices, `src/main-web.tsx` for web, and shared assets in `src/assets/`. End-to-end suites live in `api-e2e/src` (Jest) and `web-e2e/src` (Playwright). Shared utilities and types belong in `packages/`. Generated bundles land in workspace `dist/`; keep feature-specific assets close to their modules.

## Build, Test, and Development Commands

Initialize dependencies once with `npm install`; afterward drive everything through Nx. Use `npx nx run api:serve` for a hot-reloading API and `npx nx run api:build` for production bundles. Run the web client with `npx nx run web:dev`; serve a build via `npx nx run web:start`. Start Metro by `npx nx run mobile:start`, and target devices with the `mobile:run-ios` or `mobile:run-android` executors. Run type checks across the graph with `npx nx run-many --target=typecheck`. Format sources using `npx nx format:write`.

## Coding Style & Naming Conventions

Code in TypeScript with `strict` settings from `tsconfig.base.json` targeting ES2022 and NodeNext modules. Keep imports sorted logically, prefer descriptive names, and avoid unused exports. Use camelCase for variables and functions, PascalCase for components and providers, and kebab-case for directories. Enforce two-space indentation and Prettier defaults; trim trailing whitespace before commits.

## Testing Guidelines

Co-locate unit specs beside their sources as `*.spec.ts` or `*.spec.tsx`. API contract tests belong in `api-e2e/src/api/*.spec.ts`; run them via `npx nx run api-e2e:e2e`, which auto-starts the service. UI journeys live under `web-e2e/src`; execute with `npx nx run web-e2e:e2e`. Store coverage assets under `test-output/` and keep the directory untracked.

## Commit & Pull Request Guidelines

Write Conventional Commits such as `feat(api): add menu endpoints`, limit subjects to 72 characters, and keep tone lowercase. Reference issue IDs in the body, list migrations, and record Nx commands executed. PRs need a problem statement, before/after evidence for UI changes, confirmation of validated Nx tasks, and a review request before merging. Use `npx nx affected:graph` to scope reviewers and follow-up work.

## Security & Configuration Tips

Use the provided Docker Compose files (`docker-compose.dev.yml`, `docker-compose.prod.yml`) to orchestrate dependencies consistently. Store secrets outside version control and prefer local environment files ignored by git. Consult `docs/` for environment notes before changing infra or deployment settings.
