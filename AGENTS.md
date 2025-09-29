# Repository Guidelines

## Project Structure & Module Organization
- `api/`: NestJS service (`src/main.ts`, feature modules under `src/app`, static assets in `src/assets/`, build output in `dist/`).
- `web/`: Next.js 15 app in `src/app`; shared media in `public/`; compiled assets under `.next/`.
- `mobile/`: React Native client with entrypoints `src/main.tsx` and `src/main-web.tsx`; store shared media in `src/assets/`.
- End-to-end suites: `api-e2e/src` for Jest API journeys, `web-e2e/src` for Playwright flows.
- Shared domain utilities live in `packages/`; keep feature-specific assets close to their modules.

## Build, Test, and Development Commands
- `npm install` once to hydrate dependencies; use Nx thereafter.
- `npx nx run api:serve` watches the API; `...:build` emits the production bundle.
- `npx nx run web:dev` launches Next.js HMR; `web:start` serves the built app.
- `npx nx run mobile:start` opens Metro; `...:run-ios` / `...:run-android` target devices; `...:build` publishes to `dist/mobile/web`.
- `npx nx run-many --target=typecheck` runs TypeScript checks across projects; `npx nx format:write` applies formatting.

## Coding Style & Naming Conventions
- TypeScript everywhere with `strict` mode; follow ES2022 and `module nodenext` from `tsconfig.base.json`.
- Format with Prettier defaults and 2-space indentation; avoid trailing whitespace.
- Use camelCase for variables/functions, PascalCase for components and providers, kebab-case for directories and file folders.

## Testing Guidelines
- Place unit specs beside sources (e.g., `component.spec.tsx`) and wire them into the project `package.json` Vitest target.
- API contracts live in `api-e2e/src/api/*.spec.ts`; run `npx nx run api-e2e:e2e` (auto-starts the API).
- UI journeys live in `web-e2e/src`; execute `npx nx run web-e2e:e2e` for Playwright runs.
- Store coverage artefacts under `test-output/`; keep the directory out of version control.

## Commit & Pull Request Guidelines
- Use Conventional Commits (`feat(api): add menu endpoints`), ≤72-character subjects, lowercase tone.
- Reference issue IDs in the body, note migrations, and list the Nx commands executed during validation.
- Pull requests need a clear problem statement, before/after evidence for UI, and confirmation of relevant Nx tasks.
- Request review before merging; rely on `npx nx affected:graph` or related tooling to scope changes.
