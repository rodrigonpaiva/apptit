# SP1-04 — Individual access and scoped sessions

Date: 2026-11-05 (Europe/Paris). Implements the bounded online/synthetic baseline of ADR-0003. Identity owns users, tenants, sites, memberships, sessions, login limits and access events. The gateway owns browser cookies/CSRF. Kitchen independently reauthorizes protected reads through Identity.

## Session and credential contract

Passwords use Argon2id via pinned `argon2@0.45.2`, with 64 MiB memory, three iterations and parallelism one. User records store hashes only. Unknown/inactive accounts and incorrect passwords return generic INVALID_CREDENTIALS after password verification (a dummy hash is used for unknown users). Persistent counters limit attempts by normalized-account hash and gateway-derived source-address hash; source blocking occurs before creating more account counters. Fixture defaults are five account attempts and fifty source attempts per sixty-second window. These are explicit engineering settings, not an approved restaurant security policy.

Login issues a new 256-bit opaque random secret. Identity stores its HMAC-SHA256 hash under the configured server key, not the secret. There is no JWT/refresh token or browser-readable auth secret. Re-login creates a new session and revokes the presented previous session in one database transaction. Logout revokes before success; unknown/previously revoked secrets can be logged out idempotently. Access events preserve session subject, actual actor/name, site, reason and time for creation, replacement, selection and logout.

Every protected request checks active user, revocation, absolute expiry and idle expiry. A conditional DB touch cannot revive expired/revoked sessions. Membership, role, site and tenant activity are queried afresh; no positive authorization cache exists. A request already admitted may finish; a later request after revocation commits is denied. This is not a globally atomic cross-service revocation/stock transaction. Current-session checks count as request activity; the UI does not poll in the background to keep an idle session alive.

## Cookies, origin and CSRF

The only supported runtime remains explicit synthetic loopback HTTP. `ALLOW_INSECURE_LOCAL_COOKIES=true` is required, alongside APP_MODE/SEED_MODE synthetic and loopback origins/bindings. Cookies are host-only, HttpOnly, SameSite=Lax, path `/`, with development-specific names `apptit_dev_session` and `apptit_dev_csrf`. They deliberately lack Secure only in this supported HTTP development runtime. Nonlocal/live mode remains rejected; deployment requires the HTTPS/Secure cookie design and separate readiness decisions already recorded in ADR-0003.

`GET /session/csrf` supplies a signed token bound to both an HttpOnly browser nonce and the current session secret (including the pre-login state). Login, logout and site selection require exact configured Origin, JSON content type and the matching CSRF header. Cross-site fetch metadata is rejected. Nonce cookies rotate/clear across login/logout; an old pre-login CSRF token cannot authorize a logged-in action. Secrets/tokens are not URLs, JSON login responses, logs or localStorage. GraphQL has no mutation in this slice; enabling future mutations requires the same state-change protection rather than treating Apollo's query CSRF handling as authorization.

## Interfaces and trust boundary

| External boundary | Behavior |
| --- | --- |
| `GET /api/session/csrf` | Same-origin web proxy to gateway bootstrap; no profile or credential returned |
| `POST /api/session/login` | `{login,password}` only; returns public profile and sets HttpOnly cookie |
| `GET /api/session/current` | Fresh valid session → own identity, authorized sites, selected site, absolute expiry |
| `POST /api/session/site` | `{tenantId,siteId}`; selects only an active authorized membership |
| `POST /api/session/logout` | Revokes server-side before clearing cookie/success; failures remain visible |
| GraphQL `siteContext(input)` | Scoped authenticated read through gateway → Kitchen → independent Identity authorization |
| `/workspace` | Dynamic server-guarded route; unauthenticated/revoked/expired → login; unavailable dependency → explicit unavailable state |

The public browser uses `/api` same-origin proxies. Internal calls require service identity plus the end-user secret in a protected header. Gateway and Kitchen have distinct Identity credentials. Caller credential alone never authorizes an end user. Actor IDs/names/roles/site headers from the browser are ignored; Identity constructs the trusted context from its own session/user/membership data. Internal HTTP clients reject redirects and have bounded timeouts. Missing/unavailable Identity fails closed with DEPENDENCY_UNAVAILABLE.

GraphQL `siteContext` returns only the verified actor/site/role/capabilities, not the session secret, hash or internal context. Scope must match both tenant and site. Queries have bounded field/alias/depth counts (50/10/8); fragment spreads are disabled for this narrow schema. No persistence/stock mutation is introduced by the protected read.

## Minimal fixture permissions

| Role | Explicit test capabilities |
| --- | --- |
| Chef | site.read, catalogue.read, quantity-draft.read/write, receipt.draft.read/write |
| Storekeeper | site.read, catalogue.read, quantity-draft.read, receipt.draft.read/write |
| Cook | site.read, catalogue.read |

No stock withdrawal, product grant, safety disposition, menu publication, director substitution or platform-administrator bypass is enabled. Quantity-draft methods remain internal pending an actual business command adapter. Existing SP1-03 attribution contexts can now be constructed by Identity, without accepting client identity claims.

Five individual synthetic accounts cover Chef A, Storekeeper A, Cook A, Chef B and an explicitly authorized multisite chef. Tenant/site A and B are separate for denial tests. Fixture secrets are generated privately; no common kitchen account exists. Seeds preserve unchanged passwords/memberships and do not reactivate disabled users or grants. An explicit changed fixture password invalidates that account's previous sessions. These seeds are not onboarding or administrator APIs.

## Interface and continuity

Login and workspace show synthetic mode, actual signed-in identity, authorized restaurant and role. Server rendering does not place a private profile in prerendered markup; the client verifies again before displaying it. Protected responses use no-store. Login/logout use full navigation to clear the prior router state. Losing focus/visibility/network hides private profile content and requires revalidation; restored browser pages reload. Request generations prevent late responses from restoring a previous view. A failed logout keeps the UI locked with retry rather than claiming a completed user switch.

No local durable draft/observation queue is enabled. SP2-03 receipt editing is memory-only: locking/navigation clears unsaved fields with an explicit notice; saved drafts remain server-side under their original scope/attribution. Switching transfers no authorship. Full offline access, lost-device recovery, organizational administration, complete permissions and real operating policies remain later work.

## References

- [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
- [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
- [OWASP CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

These sources informed implementation choices; no external security certification or live deployment readiness is claimed.
