# ADR-0003 — Individual sessions, authorization and draft ownership

- Date: 2026-11-04
- Status: selected online synthetic baseline; offline operation disabled initially
- Sources: RF-01, §§13/14, DEC-010/030/047; AP-010/AP-012; SP1-01 AC2.

## Selected access design

Use individual fixture accounts with passwords and an **opaque server-side session**, not a self-contained access JWT. JWT plus denylist/online checks was considered but adds token lifecycle without removing the revocation dependency. SSO and PIN unlock are evaluation-only. Passwords use Argon2id with library parameters reviewed at implementation; fixtures have explicitly synthetic credentials, no live identities. Credential and session creation/rotation/revocation are Identity's authority.

Generate at least 256 random bits for session secrets; store only their cryptographic hash. Online web uses a host-only `HttpOnly`, `SameSite=Lax`, `Secure`, path `/` cookie with no Domain, replaced on login/reauthentication. Production requires HTTPS; any localhost HTTP exception must be explicit, development-only and use a separate cookie name (never silently weaken a production cookie). No token in URLs, logs, localStorage or GraphQL variables. No refresh token is needed for this initial session design.

Validate Origin and CSRF token on every cookie-authenticated state-changing request, including login/logout, uploads and GraphQL mutations. GET cannot execute mutations. SameSite alone is insufficient. Use same-origin web routing to the gateway, explicit CORS, credential throttling and bounded GraphQL query/page cost. Missing secret/hash/timeout/origin configuration fails startup. Idle and absolute expiry must be positive, validated and explicit in SP1-02 fixture configuration; their live values are provisional and must not be invented as restaurant policy.

On each protected request Identity checks session revocation/expiry, active user, current site membership and required capability. No positive permission/session caching for the first slice. Identity outage denies the request with `DEPENDENCY_UNAVAILABLE`, never an anonymous/privileged fallback. Logout revokes server-side session before success and clears cookie; a failed revoke is visible. Already admitted in-flight requests may finish: revocation blocks requests whose authorization occurs after revocation commits, not retroactively committed work. Revalidate authorization immediately before effectful confirmation; no cross-service globally atomic revocation/stock guarantee is claimed.

## Trust and scope

The gateway is the only public backend. Internal calls carry the opaque session through a protected internal channel plus independently authenticated service identity; identity derives actor/capabilities, never trusts browser-supplied author fields. Local services bind loopback/private container network; per-caller secrets authenticate internal HTTP, constant-time verified, excluded from logs. Do not forward browser Authorization/actor headers as service credentials. TLS/workload identity and secret rotation must be resolved before nonlocal deployment. Caller service authentication alone never grants a user's operational rights.

Kitchen independently asks Identity to authorize the requested action/site before executing or disclosing data. An internal validated authorization context is request-scoped and cannot be serialized by the client as authority. Resource fetches also match ID **and tenant/site**; object IDs, filters, paging cursors, operation results and file IDs never bypass policy. Missing capability/scope defaults to deny. Unknown/out-of-scope resource returns `NOT_FOUND` without disclosing existence. Unauthorized scope selection is `FORBIDDEN` without resource details.

Fixture role profiles expand to explicit capabilities; role labels are not permission checks. Chef/storekeeper/cook may have catalogue read as explicitly seeded. Later capture, receipt disposition, inventory adjustment, publication, recipe validation and product withdrawal are distinct capabilities. Platform administrator is not an implicit site operator. Director substitution needs own identity, site, reason, effective interval and audit; no universal admin bypass or substitution path is enabled in SP1. Product grants remain later work; cook withdrawals stay disabled.

## Audit

Derive stable user ID, display name at action time, session reference, tenant/site and server time from authenticated context. Store original observed time separately when supplied; an untrusted client clock does not replace recordedAt. Author/validator/substitute remain separate. Record aggregate version, relevant before/after values, reason, operation and correlation. Never audit passwords, raw tokens or unnecessary health information. Rename/deactivate cannot change past attribution.

## Shared devices and offline

SP1 is online-only. User switch locks the UI, drops in-memory private views and terminates the previous session before a new user is shown. Protected responses use `Cache-Control: no-store`; do not add an offline service-worker cache of private data. Failed logout/expiry/network loss must not reveal the prior user's content. No second offline account can be opened with an assumed local PIN.

The later draft contract reserves original actor/site/device/operation identity before claiming local save. A locally persisted draft is not a server receipt. Queue scope includes original user and site; switching sessions does not transfer ownership or auto-submit under the next user. Reauthentication of the original author revalidates membership/version before submission. Revoked access requires a separately audited authorized recovery procedure, not credential substitution. Unsent data is not silently deleted on logout; if isolation, explicit retention and device-loss recovery are not implemented, local capture remains visibly disabled.

Outage duration, local unlock, encryption/key lifecycle, shared-device storage policy, preload, device revocation and rescue of unsent records await AP-007/AP-010/AP-012. None is claimed implemented by an interface. Pending observations cannot approve safety release, publish a menu or mutate global stock.

## Reference consulted

[OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) supports unpredictable session IDs and explicit cookie/session lifecycle controls. The concrete session architecture above is this project's engineering decision, not a claim of verified security implementation.
