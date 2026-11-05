import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { SESSION_COOKIE, sessionHash } from '../packages/runtime/dist/index.js';
const require = createRequire(new URL('../services/identity/package.json', import.meta.url));
const { Pool } = require('pg');
class Browser {
  constructor(origin, cookies = new Map()) { this.origin = origin; this.cookies = cookies; }
  clone() { return new Browser(this.origin, new Map(this.cookies)); }
  async request(path, init = {}) {
    const cookie = [...this.cookies].map(([key, value]) => `${key}=${value}`).join('; ');
    const response = await fetch(this.origin + path, { redirect: 'manual', ...init, headers: { cookie, ...init.headers } });
    for (const header of response.headers.getSetCookie()) {
      const pair = header.split(';')[0]; const i = pair.indexOf('='); const name = pair.slice(0, i), value = pair.slice(i + 1);
      if (value) this.cookies.set(name, value); else this.cookies.delete(name);
    }
    return response;
  }
  async command(path, input, overrides = {}) {
    const bootstrap = await this.request('/api/session/csrf');
    assert.ok(bootstrap.ok, 'CSRF bootstrap must succeed.');
    const { csrfToken } = await bootstrap.json();
    return this.request('/api/session/' + path, { method: 'POST', headers: { 'content-type': 'application/json', origin: this.origin, 'x-csrf-token': csrfToken, ...overrides }, body: JSON.stringify(input) });
  }
  async login(login, password) {
    const response = await this.command('login', { login, password });
    assert.ok(response.ok, 'Synthetic individual login must succeed.');
    const cookies = response.headers.getSetCookie();
    assert.ok(cookies.some(cookie => cookie.startsWith(SESSION_COOKIE + '=') && cookie.includes('HttpOnly') && cookie.includes('SameSite=Lax') && cookie.includes('Path=/') && !cookie.includes('Domain=')));
    const profile = await response.json();
    assert.ok(!('sessionSecret' in profile) && !('passwordHash' in profile.user));
    return profile;
  }
  async site(scope, headers = {}) {
    const response = await this.request('/api/graphql', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify({ query: 'query Site($input: SiteScopeInput!) { siteContext(input: $input) { userId userName tenantId siteId siteName role capabilities } }', variables: { input: scope } }) });
    return response.json();
  }
}
export async function accessSmoke(config, web) {
  const origin = `http://127.0.0.1:${web.port}`;
  const browser = new Browser(origin);
  assert.equal((await browser.request('/workspace')).status, 307);
  assert.equal((await browser.request('/api/session/current')).status, 401);
  const credentials = { login: 'chef.a@apptit.test', password: process.env.FIXTURE_CHEF_A_PASSWORD };
  const missing = await browser.request('/api/session/login', { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(credentials) });
  assert.equal(missing.status, 403, 'Missing CSRF must block login.');
  const hostile = await browser.command('login', credentials, { origin: 'https://untrusted.example' });
  assert.equal(hostile.status, 403, 'Wrong Origin must block login.');
  const chef = await browser.login(credentials.login, credentials.password);
  const scopeA = { tenantId: chef.selectedSite.tenantId, siteId: chef.selectedSite.siteId };
  const allowed = await browser.site(scopeA, { 'x-user-id': randomUUID(), 'x-role': 'cook' });
  assert.equal(allowed.data.siteContext.userId, chef.user.id, 'Actor comes from the session, not forged headers.');
  assert.equal(allowed.data.siteContext.role, 'chef');
  assert.equal((await browser.request('/workspace')).status, 200);
  const b = new Browser(origin);
  const chefB = await b.login('chef.b@apptit.test', process.env.FIXTURE_CHEF_B_PASSWORD);
  const scopeB = { tenantId: chefB.selectedSite.tenantId, siteId: chefB.selectedSite.siteId };
  for (const badScope of [scopeB, { ...scopeA, tenantId: scopeB.tenantId }, { ...scopeA, siteId: scopeB.siteId }]) {
    const denied = await browser.site(badScope, { 'x-user-id': chefB.user.id, 'x-role': 'chef' });
    assert.equal(denied.errors[0].extensions.code, 'FORBIDDEN');
  }
  assert.equal((await b.site(scopeA)).errors[0].extensions.code, 'FORBIDDEN');
  const direct = await fetch(`${config.kitchenOrigin}/internal/v1/site-context`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ scope: scopeA }) });
  assert.equal(direct.status, 401);
  const serviceOnly = await fetch(`${config.kitchenOrigin}/internal/v1/site-context`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-internal-token': config.kitchenToken, 'x-correlation-id': randomUUID() }, body: JSON.stringify({ scope: scopeA }) });
  assert.equal(serviceOnly.status, 401, 'Service credentials alone do not authorize a user.');
  const wrongCaller = await fetch(`${config.identityOrigin}/internal/v1/authorize`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-internal-token': config.identityToken, 'x-caller-id': 'kitchen' }, body: '{}' });
  assert.equal(wrongCaller.status, 401, 'Kitchen and gateway have distinct Identity credentials.');
  const stored = new Pool({ connectionString: process.env.IDENTITY_DATABASE_URL, connectionTimeoutMillis: 3000 });
  const loginFor = async (login, key) => { const instance = new Browser(origin); const profile = await instance.login(login, process.env[key]); return { instance, profile }; };
  try {
    const hashed = sessionHash(browser.cookies.get(SESSION_COOKIE), config.sessionHashKey);
    const row = await stored.query('SELECT "tokenHash" FROM "AccessSession" WHERE "tokenHash"=$1', [hashed]);
    assert.equal(row.rowCount, 1);
    assert.ok(row.rows[0].tokenHash !== browser.cookies.get(SESSION_COOKIE));
    const stock = await loginFor('stock.a@apptit.test', 'FIXTURE_STOREKEEPER_A_PASSWORD');
    assert.equal(stock.profile.selectedSite.role, 'storekeeper');
    assert.ok(!stock.profile.selectedSite.capabilities.includes('quantity-draft.write'));
    const old = browser.clone();
    const cook = await browser.login('cook.a@apptit.test', process.env.FIXTURE_COOK_A_PASSWORD);
    assert.equal(cook.selectedSite.role, 'cook');
    assert.ok(!cook.selectedSite.capabilities.includes('quantity-draft.write'));
    assert.equal((await old.site(scopeA)).errors[0].extensions.code, 'SESSION_REVOKED');
    assert.equal((await browser.site(scopeA)).data.siteContext.userId, cook.user.id);
    // Only the exact sessions created by this smoke are changed, never another user's session.
    await stored.query('UPDATE "AccessSession" SET "revokedAt"=now() WHERE "tokenHash"=$1', [sessionHash(browser.cookies.get(SESSION_COOKIE), config.sessionHashKey)]);
    assert.equal((await browser.site(scopeA)).errors[0].extensions.code, 'SESSION_REVOKED');
    assert.equal((await browser.request('/workspace')).status, 307);
    for (const kind of ['absolute', 'idle']) {
      const expired = await loginFor('chef.b@apptit.test', 'FIXTURE_CHEF_B_PASSWORD');
      const hash = sessionHash(expired.instance.cookies.get(SESSION_COOKIE), config.sessionHashKey);
      if (kind === 'absolute') await stored.query('UPDATE "AccessSession" SET "expiresAt"=now()-interval \'1 second\' WHERE "tokenHash"=$1', [hash]);
      else await stored.query('UPDATE "AccessSession" SET "lastSeenAt"=$2 WHERE "tokenHash"=$1', [hash, new Date(Date.now() - (config.sessionIdleSeconds + 10) * 1000)]);
      assert.equal((await expired.instance.site(scopeB)).errors[0].extensions.code, 'SESSION_EXPIRED');
    }
    const multi = await loginFor('chef.multi@apptit.test', 'FIXTURE_MULTI_PASSWORD');
    assert.equal(multi.profile.sites.length, 2);
    const second = multi.profile.sites[1];
    const selected = await multi.instance.command('site', { tenantId: second.tenantId, siteId: second.siteId });
    assert.ok(selected.ok);
    assert.equal((await selected.json()).selectedSite.siteId, second.siteId);
    const denied = await multi.instance.command('site', { tenantId: randomUUID(), siteId: randomUUID() });
    assert.equal(denied.status, 403);
    const copied = multi.instance.clone();
    const logout = await multi.instance.command('logout', {});
    assert.ok(logout.ok);
    assert.equal((await copied.site(scopeA)).errors[0].extensions.code, 'SESSION_REVOKED');
    const unknown = randomUUID() + '@apptit.test';
    for (let index = 0; index < config.loginLimit; index++) assert.equal((await b.command('login', { login: unknown, password: 'synthetic-invalid-password' })).status, 401);
    assert.equal((await b.command('login', { login: unknown, password: 'synthetic-invalid-password' })).status, 429);
    const fragment = await b.request('/api/graphql', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: 'query { ...Runtime } fragment Runtime on Query { runtimeStatus { mode } }' }) });
    assert.ok((await fragment.json()).errors?.length, 'Unbounded fragment expansion is not enabled.');
  } finally { await stored.end(); }
  return async function unavailable() {
    assert.equal((await b.request('/api/session/current')).status, 503);
    assert.equal((await b.site(scopeB)).errors[0].extensions.code, 'DEPENDENCY_UNAVAILABLE');
    const failedLogout = await b.command('logout', {});
    assert.equal(failedLogout.status, 503);
    assert.equal(failedLogout.headers.getSetCookie().length, 0, 'A failed server revoke cannot claim logout success.');
  };
}
