import type { AuthCode, SiteAccess, SiteRole } from '@apptit/contracts';
export interface IdentityUser { id: string; login: string; name: string; passwordHash: string; isActive: boolean }
export interface StoredSession { id: string; tokenHash: string; userId: string; selectedSiteId: string; expiresAt: Date; lastSeenAt: Date; revokedAt: Date | null; user: IdentityUser }
export const roleCapabilities = (role: SiteRole): SiteAccess['capabilities'] => role === 'chef' ? ['storage.location.manage', 'site.read', 'catalogue.read', 'quantity-draft.read', 'quantity-draft.write', 'receipt.draft.read', 'receipt.draft.write', 'evidence.read', 'evidence.write', 'observation.read', 'observation.capture'] : role === 'storekeeper' ? ['site.read', 'catalogue.read', 'quantity-draft.read', 'receipt.draft.read', 'receipt.draft.write', 'evidence.read', 'evidence.write', 'observation.read', 'observation.capture'] : role === 'cook' ? ['site.read', 'catalogue.read'] : [];
export interface SessionRepository {
  user(login: string): Promise<IdentityUser | null>;
  memberships(userId: string): Promise<SiteAccess[]>;
  find(hash: string): Promise<StoredSession | null>;
  touch(id: string, now: Date, cutoff: Date): Promise<boolean>;
  create(user: IdentityUser, siteId: string, hash: string, now: Date, expiresAt: Date, previousHash?: string): Promise<void>;
  revoke(hash: string, now: Date): Promise<void>;
  select(id: string, siteId: string, now: Date, cutoff: Date): Promise<boolean>;
  attempt(keys: string[], now: Date, windowSeconds: number): Promise<number[]>;
}
export interface PasswordHasher { hash(password: string): Promise<string>; verify(hash: string, password: string): Promise<boolean> }
export interface SessionSecrets { generate(): string; hash(secret: string): string; valid(secret: unknown): secret is string }
export class SessionError extends Error { constructor(public readonly code: AuthCode) { super(code); } }
