import type { AccessCapability, AuthorizedSiteContext, SessionProfile } from '@apptit/contracts';
import { object, scope, text, uuid } from '@apptit/domain-values';
import { SessionError } from './session.repository.js';
import type { IdentityUser, PasswordHasher, SessionRepository, SessionSecrets, StoredSession } from './session.repository.js';
export interface SessionPolicy { idleSeconds: number; absoluteSeconds: number; loginLimit: number; loginWindowSeconds: number }
export class SessionService {
  constructor(private readonly store: SessionRepository, private readonly passwords: PasswordHasher, private readonly secrets: SessionSecrets,
    private readonly dummyHash: string, private readonly policy: SessionPolicy, private readonly clock: () => Date = () => new Date()) {}
  private async profile(session: StoredSession): Promise<SessionProfile> {
    const sites = await this.store.memberships(session.userId);
    return { user: { id: session.user.id, login: session.user.login, name: session.user.name }, sites,
      selectedSite: sites.find(site => site.siteId === session.selectedSiteId) ?? null, expiresAt: session.expiresAt.toISOString() };
  }
  private async session(secret?: string): Promise<StoredSession> {
    if (!this.secrets.valid(secret)) throw new SessionError('UNAUTHENTICATED');
    const session = await this.store.find(this.secrets.hash(secret));
    if (!session || !session.user.isActive) throw new SessionError('UNAUTHENTICATED');
    if (session.revokedAt) throw new SessionError('SESSION_REVOKED');
    const now = this.clock();
    const cutoff = new Date(now.getTime() - this.policy.idleSeconds * 1000);
    if (session.expiresAt <= now || session.lastSeenAt <= cutoff) throw new SessionError('SESSION_EXPIRED');
    if (!await this.store.touch(session.id, now, cutoff)) throw new SessionError('SESSION_REVOKED');
    return session;
  }
  async login(input: unknown, previousSecret: string | undefined, source: string): Promise<{ sessionSecret: string; profile: SessionProfile }> {
    const value = object(input, ['login', 'password'], 'credentials');
    const login = text(value['login'], 'login', 100).toLowerCase();
    if (!/^[a-z0-9][a-z0-9._@+-]{2,99}$/.test(login) || typeof value['password'] !== 'string' || value['password'].length < 12 || value['password'].length > 256) throw new SessionError('INVALID_INPUT');
    const now = this.clock();
    const sourceAttempts = await this.store.attempt(['source:' + this.secrets.hash(source)], now, this.policy.loginWindowSeconds);
    if (sourceAttempts[0]! > this.policy.loginLimit * 10) throw new SessionError('RATE_LIMITED');
    const accountAttempts = await this.store.attempt(['account:' + this.secrets.hash(login)], now, this.policy.loginWindowSeconds);
    if (accountAttempts[0]! > this.policy.loginLimit) throw new SessionError('RATE_LIMITED');
    const user = await this.store.user(login);
    const valid = await this.passwords.verify(user?.passwordHash ?? this.dummyHash, value['password']);
    if (!valid || !user?.isActive) throw new SessionError('INVALID_CREDENTIALS');
    const sites = await this.store.memberships(user.id);
    if (!sites.length) throw new SessionError('FORBIDDEN');
    const sessionSecret = this.secrets.generate();
    const expiresAt = new Date(now.getTime() + this.policy.absoluteSeconds * 1000);
    await this.store.create(user, sites[0]!.siteId, this.secrets.hash(sessionSecret), now, expiresAt, this.secrets.valid(previousSecret) ? this.secrets.hash(previousSecret) : undefined);
    return { sessionSecret, profile: { user: this.publicUser(user), sites, selectedSite: sites[0]!, expiresAt: expiresAt.toISOString() } };
  }
  private publicUser(user: IdentityUser) { return { id: user.id, login: user.login, name: user.name }; }
  async current(secret?: string): Promise<SessionProfile> { return this.profile(await this.session(secret)); }
  async authorize(input: unknown, secret: string | undefined, correlationId: string): Promise<AuthorizedSiteContext> {
    const value = object(input, ['scope', 'capability'], 'authorization');
    const requested = scope(value['scope']);
    const session = await this.session(secret);
    const profile = await this.profile(session);
    const site = profile.sites.find(site => site.siteId === requested.siteId && site.tenantId === requested.tenantId);
    const capability = value['capability'] as AccessCapability;
    if (!site || !site.capabilities.includes(capability)) throw new SessionError('FORBIDDEN');
    return { scope: requested, actor: { userId: session.user.id, nameAtAction: session.user.name }, siteTimeZone: site.timeZone,
      sessionId: session.id, capabilities: site.capabilities, correlationId: uuid(correlationId, 'correlationId'), site,
      membershipVersion: site.membershipVersion, authorizedAt: this.clock().toISOString() };
  }
  async select(input: unknown, secret: string | undefined): Promise<SessionProfile> {
    const requested = scope(input);
    const session = await this.session(secret);
    const profile = await this.profile(session);
    if (!profile.sites.some(site => site.siteId === requested.siteId && site.tenantId === requested.tenantId)) throw new SessionError('FORBIDDEN');
    const now = this.clock();
    if (!await this.store.select(session.id, requested.siteId, now, new Date(now.getTime() - this.policy.idleSeconds * 1000))) throw new SessionError('SESSION_REVOKED');
    return this.profile({ ...session, selectedSiteId: requested.siteId });
  }
  async logout(secret?: string): Promise<{ success: true }> {
    if (this.secrets.valid(secret)) await this.store.revoke(this.secrets.hash(secret), this.clock());
    return { success: true };
  }
}
