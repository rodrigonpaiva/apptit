import test from 'node:test';
import assert from 'node:assert/strict';
import { cookieValue, csrfToken, localCookie, newSecret, SESSION_COOKIE, sessionHash, validCsrf, validSecret } from '../packages/runtime/dist/index.js';
test('opaque session secrets and stored hashes are distinct and key-bound', () => {
  const first = newSecret(), second = newSecret();
  assert.ok(validSecret(first) && validSecret(second) && first !== second);
  assert.ok(sessionHash(first, 'fixture-key') !== first);
  assert.equal(sessionHash(first, 'fixture-key').length, 64);
  assert.ok(sessionHash(first, 'fixture-key') !== sessionHash(first, 'other-key'));
});
test('cookie parsing rejects duplicates and malformed secrets without choosing an identity', () => {
  const secret = 'a'.repeat(43);
  assert.equal(cookieValue(`other=value; ${SESSION_COOKIE}=${secret}`, SESSION_COOKIE), secret);
  for (const header of [undefined, `${SESSION_COOKIE}=short`, `${SESSION_COOKIE}=${secret}; ${SESSION_COOKIE}=${secret}`, `${SESSION_COOKIE}=%41${secret}`]) assert.equal(cookieValue(header, SESSION_COOKIE), undefined);
  const cookie = localCookie(SESSION_COOKIE, secret, 300);
  assert.ok(cookie.includes('HttpOnly') && cookie.includes('SameSite=Lax') && cookie.includes('Path=/') && !cookie.includes('Domain='));
});
test('CSRF is bound to both nonce and current session, including the pre-login state', () => {
  const nonce = 'n'.repeat(43), session = 's'.repeat(43), key = 'fixture-key';
  const beforeLogin = csrfToken(nonce, undefined, key);
  assert.equal(validCsrf(nonce, undefined, beforeLogin, key), true);
  assert.equal(validCsrf(nonce, session, beforeLogin, key), false);
  const loggedIn = csrfToken(nonce, session, key);
  assert.equal(validCsrf(nonce, session, loggedIn, key), true);
  for (const args of [[undefined, session, loggedIn], [nonce, 'x'.repeat(43), loggedIn], ['x'.repeat(43), session, loggedIn], [nonce, session, [loggedIn]]]) assert.equal(validCsrf(...args, key), false);
});
