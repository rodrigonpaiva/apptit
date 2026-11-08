import type { Scope, TrustedActorContext } from './quantity-draft.js';
export type AccessCapability = 'site.read' | 'catalogue.read' | 'quantity-draft.read' | 'quantity-draft.write' | 'receipt.draft.read' | 'receipt.draft.write';
export type SiteRole = 'chef' | 'storekeeper' | 'cook';
export interface SiteAccess extends Scope {
  name: string;
  timeZone: string;
  role: SiteRole;
  membershipVersion: number;
  capabilities: AccessCapability[];
}
export interface SessionProfile {
  user: { id: string; login: string; name: string };
  sites: SiteAccess[];
  selectedSite: SiteAccess | null;
  expiresAt: string;
}
export interface AuthorizedSiteContext extends TrustedActorContext {
  site: SiteAccess;
  authorizedAt: string;
  membershipVersion: number;
}
export type AuthCode = 'INVALID_INPUT' | 'INVALID_CREDENTIALS' | 'UNAUTHENTICATED' | 'SESSION_EXPIRED' | 'SESSION_REVOKED' | 'FORBIDDEN' | 'RATE_LIMITED' | 'DEPENDENCY_UNAVAILABLE';
