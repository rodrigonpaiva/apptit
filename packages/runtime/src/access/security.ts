import { createHmac, randomBytes } from 'node:crypto';
import { matchesSecret } from '../index.js';
export const SESSION_COOKIE = 'apptit_dev_session';
export const CSRF_COOKIE = 'apptit_dev_csrf';
export const validSecret = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);
export function newSecret(): string { return randomBytes(32).toString('base64url'); }
export function sessionHash(secret: string, key: string): string { return createHmac('sha256', key).update(secret).digest('hex'); }
export function cookieValue(header: string | undefined, name: string): string | undefined {
  const found = (header ?? '').split(';').map(part => part.trim()).filter(part => part.startsWith(name + '='));
  if (found.length !== 1) return undefined;
  const value = found[0]!.slice(name.length + 1);
  return validSecret(value) ? value : undefined;
}
export function csrfToken(nonce: string, session: string | undefined, key: string): string {
  return createHmac('sha256', key).update(`${nonce.length}:${nonce}|${session?.length ?? 0}:${session ?? ''}`).digest('hex');
}
export function validCsrf(nonce: string | undefined, session: string | undefined, received: unknown, key: string): boolean {
  return !!nonce && validSecret(nonce) && matchesSecret(received, csrfToken(nonce, session, key));
}
/** Explicit synthetic loopback HTTP exception. Production is rejected by readConfig. */
export function localCookie(name: string, value: string, maxAge: number): string {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}
