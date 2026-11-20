# ADR 0007 — Shared web UI with shadcn and explicit package boundaries

Date: 2026-11-20. Status: selected for incremental synthetic web migration.

## Decision

Use `@apptit/ui` for owned shadcn/new-york components based on Radix primitives, Tailwind CSS 4 tokens and Lucide icons. Retain npm workspaces and Nx. Add React Hook Form to application forms when migrated; Sonner may supplement confirmed-success messages. Do not duplicate domain validation with an unrelated schema merely to use a form library.

UI exports source through documented component subpaths; Next compiles it through `transpilePackages`. Nx separately builds/typechecks UI and checks dependency boundaries. React and React DOM are peers, supplied by the web application. UI depends on no application, backend, contract or domain package. Web may depend on UI and contracts. Backend/shared packages cannot import UI. No backend runtime is required to render a primitive.

Application composition, French copy, HTTP/session access, permissions, domain quantities, dates, draft operations and stock authority remain in `apps/web` and their existing services. UI accepts ordinary presentation props, children and handlers. It does not fetch, persist, evaluate business rules or cache private user/site data.

## Styling and accessibility

Use semantic CSS-variable tokens for the existing green/cream identity. Import styles once from the root stylesheet. Explicit cascade layers put legacy screen styles below component utilities. Omit global Tailwind Preflight; reset only owned `.apptit-ui` elements. Migrate legacy rules only as their consumers move. This avoids replacing the appearance/behavior of unrelated screens during foundation setup.

Use 48px primary control targets, visible focus, text alongside meaningful icons, native date/number semantics and reduced-motion support. Radix supplies dialog focus/keyboard behavior; application tests still verify labels, focus return, confirmation and responsive layout. A library does not certify accessibility.

Critical failures, uncertain saves and pending controls remain visible inline. A toast is only supplementary, emitted after a confirmed successful operation. The private workspace owns its toaster so lock/logout removes private notifications. Preserve existing operation IDs, retry/conflict behavior and server validation.

## Ownership, upgrades and delivery

Components are copied from the official shadcn registry, not a binary theme dependency. Preserve upstream MIT attribution and record source/adaptations in the package README. Use explicit dependency versions and lockfile. Review generated changes, imports, client boundaries, defaults and updates; do not run init over existing configuration blindly.

Deliver in three PRs: foundation; storage-management pilot and form integration; receiving migration and confirmed-success notifications. Run appropriate checks, real PostgreSQL integration and HTTP smoke, plus meaningful browser regressions. Keep historical Sprint 2 acceptance intact. This UI work does not implement SP3-01, activate stock, publish a release or change business acceptance.

## Implemented consumer refinements

The storage pilot uses React Hook Form with field-associated French errors and a Radix AlertDialog. The receiving editor, evidence controls, observation form and OCR review use the same primitive package while retaining their original transport/domain logic. Native file inputs, checkboxes and selects retain their platform semantics. Quantity mode/unit/date-kind selectors have explicit IDs and labels. Long button labels wrap within the viewport.

Sonner notifications are exposed through a generic provider and success callback rather than a global app-wide API. The application mounts it inside the keyed authenticated actor/site subtree; each mount gets a distinct toaster ID. Disposal dismisses only owned notifications and disables retained callbacks. Success follows confirmed server results; enduring pending/error status remains inline. No actor/site contracts or HTTP imports are added to UI.

The source package uses explicit TypeScript relative imports; UI verification builds rewrite extensions, and the no-emit web compiler accepts source extensions. Web build/typecheck hash dependency sources in Nx. Frontend compilation processes shared CSS; Tailwind Preflight stays disabled during the incremental migration. See [delivery evidence](../../delivery/UI-MIGRATION.md).
