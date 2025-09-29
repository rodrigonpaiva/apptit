# Repository Guidelines

Work from the repository root after a single `npm install`. Use Nx targets for builds, tests, and local services.

## Project Structure & Module Organization
- `api/`: NestJS service; entry `src/main.ts`, modules in `src/app`, assets under `src/assets`, compiled to `dist/`.
- `web/`: Next.js 15 app within `src/app`; static assets live in `public/`, generated output in `.next/`.
- `mobile/`: React Native client with web preview; entrypoints `src/main.tsx` and `src/main-web.tsx`; shared media in `src/assets/`.
- `api-e2e/` & `web-e2e/`: Jest API journeys and Playwright UI flows; keep specs in their `src/` folders.
- `packages/`: shared libraries only; park domain-specific utilities here to avoid duplication.

## Build, Test, and Development Commands
- `npx nx run @apptit/api:serve` — start API watcher; `...:build` emits the production bundle.
- `npx nx run @apptit/web:dev` — Next.js hot reload; `@apptit/web:start` serves the built app.
- `npx nx run @apptit/mobile:start` — Metro bundler; `...:run-ios` / `...:run-android` target devices; `...:build` outputs `dist/mobile/web`.
- `npx nx run-many --target=typecheck` — TypeScript checks across projects; format with `npx nx format:write`.

## Coding Style & Naming Conventions
- TypeScript everywhere; `tsconfig.base.json` enforces `strict`, `es2022`, and `module nodenext`.
- Use 2-space indentation; camelCase variables, PascalCase components/providers, kebab-case directories.
- Co-locate feature assets with modules; long-lived shared UI belongs in `packages/`.
- Prettier-compatible formatting; enable the Nx Console extension for task discovery.

## Testing Guidelines
- API contracts: write Jest specs in `api-e2e/src/api/*.spec.ts`; run `npx nx run @apptit/api-e2e:e2e` (starts API automatically).
- Web journeys: Playwright specs in `web-e2e/src`; execute `npx nx run @apptit/web-e2e:e2e` for end-to-end runs.
- For unit coverage, add `vitest` suites alongside sources (e.g., `component.spec.tsx`) and register the target in the project `package.json`.
- Keep coverage artefacts under `test-output/`; ensure they remain out of version control.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat(api): add menu endpoints`) with ≤72-char subjects and lowercase tone.
- Reference issue IDs in the body; document testing performed and any migrations.
- Pull requests should include a problem statement, screenshots or recordings for UI changes, and the `nx` commands run.
- Request review before merging; rely on Nx affected output to keep diffs focused.
