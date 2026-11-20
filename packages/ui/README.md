# @apptit/ui

Private presentation package for the Apptit web application. Architecture and migration policy: [ADR 0007](../../docs/architecture/adr/0007-shared-ui.md).

## Consume

Import explicit subpaths, for example `@apptit/ui/components/button` or `@apptit/ui/components/alert-dialog`. The application imports `@apptit/ui/styles.css` once via its root stylesheet and scans its own source with Tailwind. React/React DOM are peers; Next transpiles this source package. Nx builds it for type/declaration verification; consumers use source exports, not the generated dist directory.

Available initial primitives: Button, Input, Label, Textarea, Card, Badge, Alert, Skeleton, Dialog and AlertDialog. Use native selects and checkboxes where their native behavior suits the workflow. DialogContent requires application-supplied `closeLabel`; all business copy belongs to the caller. Use `role="status"` for routine inline feedback and reserve alert semantics for urgent errors.

## Add or update components

The checked-in `components.json` files configure the existing npm/Nx monorepo. Run a pinned shadcn CLI from apps/web only after reviewing its proposed files/dependencies. Review all generated imports against public exports and local ESM relative paths; do not create a new application or replace workspace tooling. Install only needed dependencies, exactly pinned in package.json/lockfile. Run `node scripts/nx.mjs run-many -t lint,typecheck,build --projects=ui,web` from the repository root, then applicable application checks/browser scenarios.

Original source: official `https://ui.shadcn.com/r/styles/new-york/{component}.json`, retrieved 2026-11-20. [MIT license](LICENSE.shadcn.md). Local adaptations: explicit ESM imports, client boundaries for forwardRef components, owned reset marker, 48px touch sizing, visible focus, viewport-safe dialogs, required translated close label, removal of unused animation-plugin classes. Radix owns interaction mechanics; avoid duplicating its focus trap.

Do not import applications, domain/contracts, services, credentials or transport here. Do not add receipt-specific components to this package. Add a shared abstraction when a concrete consumer needs it, and keep its API small.
