# Shared UI — catalogue, navigation and login

Date: 2026-11-21 (Europe/Paris). Branch: `feature/ui-catalogue-navigation-login`, started from integrated dev `1025ebe368b00637880afee65770541ed18b0ad8`, with the existing main promotion ancestry retained. Scope: continue the [shared UI migration](UI-MIGRATION.md); Sprint 3 remains planned.

## Delivered behavior

- Login uses shared Button/Input/Label/Alert/Badge controls. The password visibility toggle has an explicit label, pressed state and target control. Existing email, required-field, length and autocomplete attributes remain. Submission hides the password; responses still clear it; failures focus the persistent error. Login transport, CSRF/session handling and credential policy remain in the existing application/service code.
- Catalogue uses shared cards, badges, search controls, error feedback and loading skeletons. Loading, transport failure, no matching search and a confirmed empty catalogue are distinct. Textual barcodes keep leading zeroes. Clearing search and successful retry return focus to the search field. The loaded-page limit and the distinction between catalogue references and stock remain visible.
- Workspace navigation is an app-owned component with the original capability visibility and hash routes. Active links expose aria-current. Links use shared button styling with an inverse focus-ring token for the dark sidebar. Site label and native select are explicitly associated, with a 48px control target. The skip link focuses main without routing to another feature. Logout remains locked on an uncertain reply until explicit retry succeeds.
- Product identification, manual preview and camera close controls use shared primitives. Scanner decoding and camera lifecycle are unchanged. Controlled camera denial and lookup failure retain manual identification; preparing a receipt remains an explicit unsaved action. Existing app icon names map to curated Lucide exports through the compatibility wrapper.
- Skeleton animation uses a motion-safe utility; the reduced-motion preference is verified against computed production CSS. No new runtime dependencies, backend migrations, stock commands, offline persistence or release publication are added.

Feature composition, capabilities, French copy and transports stay in apps/web. Generic controls, tokens and curated icons stay in @apptit/ui, under [ADR 0007](../architecture/adr/0007-shared-ui.md). The login keeps its controlled credential state to preserve explicit clearing behavior; this migration does not require changing every form to one state-management library.

## Executed verification

Local `npm run check` passed all eight projects: schemas, lint/boundaries, types, contract compilation, 88 tests with zero skipped and production builds. Nx cache use remains visible in the execution output; no new dependency-install claim is made. Whitespace and delivery-register checks passed.

The real production Next app passed **17 Chromium UI scenarios** against an explicit in-memory synthetic HTTP fixture. Existing storage/receipt/conflict/focus/notification cases remain, with seven additional checkpoints for login, catalogue states/search, reduced-motion loading, skip navigation, camera/manual fallback, selected-site scope/capability visibility and uncertain logout. The fixture exercises UI behavior; it does not prove real credential validation, cross-site security or database durability. Those remain the separate real PostgreSQL, HTTP smoke and container/browser CI gates before merge.

Reflow and navigation targets were checked at 320/375/768/1024/1440 px. Passwords are cleared in captured login states. Screenshots use only synthetic identities/product values and were visually inspected:

- [Browser report](evidence/ui-catalogue-navigation-login/browser.json)
- [Login phone](evidence/ui-catalogue-navigation-login/login-320.png) / [desktop](evidence/ui-catalogue-navigation-login/login-1440.png)
- [Catalogue phone](evidence/ui-catalogue-navigation-login/catalogue-320.png) / [desktop](evidence/ui-catalogue-navigation-login/catalogue-1440.png)
- [Manual identification phone](evidence/ui-catalogue-navigation-login/identification-320.png) / [desktop](evidence/ui-catalogue-navigation-login/identification-1440.png)

Existing private session, receiving, evidence and observation server boundaries are preserved; real-device/screen-reader qualification and independent approval are not claimed. Git integration does not rebuild published alpha.3 images or restart local containers. Final source and integration/check results are identified by Git history and the feature/promotion PRs.
