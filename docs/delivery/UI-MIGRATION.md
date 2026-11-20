# Shared UI migration

Date: 2026-11-20 (Europe/Paris). Scope: presentation architecture and incremental migration of the existing synthetic web application. No AP parent completion, stock feature or release publication is asserted.

## 1. Foundation

[PR #36](https://github.com/rodrigonpaiva/apptit/pull/36) integrates @apptit/ui, owned shadcn/new-york primitives, Radix behavior, Tailwind 4 tokens, Lucide, source exports, Next/PostCSS integration, Docker workspace installation and Nx boundaries. [ADR 0007](../architecture/adr/0007-shared-ui.md) and [package maintenance guide](../../packages/ui/README.md) define ownership and upgrade policy. The upstream MIT license is retained.

The exact feature source passed [foundation CI](https://github.com/rodrigonpaiva/apptit/actions/runs/44755064124) including PostgreSQL integration and HTTP smoke, and [container/browser regression](https://github.com/rodrigonpaiva/apptit/actions/runs/44755064473). Local npm run check passed all eight projects and 88 tests. An incomplete local SWC binary was repaired from the exact locked npm package; Next was not upgraded. No previously locked dependency version changed. Negative lint probes confirmed that backend → UI and UI → domain-contract imports are rejected.

## 2. Storage pilot

Chef-managed physical locations now use shared Button/Input/Label/Card/Badge/Alert/Skeleton controls, curated icons and React Hook Form. Inline French field errors identify their control, whitespace-only names are rejected before transport and existing server validation remains authoritative. Failed commands retain user input and require explicit reload; successful replies update the list/reset the form. Private views still unmount on access lock, and late replies are ignored after unmount.

The destructive confirmation uses Radix AlertDialog: cancel receives initial focus, focus stays in the dialog, Escape/cancel returns focus to the originating button, and successful deletion focuses the enduring status if the row disappears. Busy commands cannot be dismissed/repeated. Location permissions, expected versions, server CSRF handling and historical retention are preserved.

The first real UI consumer also validates package integration: source imports use explicit TypeScript extensions with verification-build rewriting; the web no-emit compiler accepts them. Nx web build/typecheck inputs include dependency sources, preventing stale UI source/CSS cache reuse. Legacy storage styles replaced by primitives were removed. Outline buttons explicitly set foreground colors to avoid inheriting legacy white text; browser checks require at least 4.5:1 contrast for cancel text.

Executed locally: npm run check (88 tests plus all schemas/lint/types/contracts/builds), rebuilt production web after cache configuration, and seven Chromium UI scenarios at 320/375/768/1024/1440 px. [Browser report](evidence/ui-storage/browser.json), [phone](evidence/ui-storage/storage-320.png), [desktop](evidence/ui-storage/storage-1440.png); screenshots were visually inspected. The UI test uses the real production Next app against an explicitly synthetic in-memory HTTP fixture; it is not backend durability/authorization evidence. Real PostgreSQL/HTTP/container suites remain separate required CI gates. The browser suite is added to foundation CI using an isolated pinned Playwright install and retained artifacts.

Local Docker did not respond; no local PostgreSQL or container success is claimed for this pilot. CI must supply those results before integration. Independent review, physical devices and complete screen-reader qualification remain unexecuted.

## 3. Receiving expansion

Next bounded step: adopt shared controls for receiving and its evidence/observation forms, then add scoped notifications only after confirmed server responses. Preserve persistent failure/pending messages, original operation IDs, exact quantity parsers, private-memory clearing and all domain/authorization boundaries. Detailed delivery evidence is added with that implementation.
