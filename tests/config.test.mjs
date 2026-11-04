import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ConfigurationError, readConfig, matchesSecret, reportStartupFailure } from '../packages/runtime/dist/index.js';

function fixture() {
  const env = Object.fromEntries(readFileSync(new URL('../.env.example', import.meta.url), 'utf8').split('\n').filter(line => line && !line.startsWith('#')).map(line => {
    const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1).replace(/__GENERATE_[A-Z_]+__/g, 'a'.repeat(64))];
  }));
  return env;
}
test('synthetic configuration rejects live mode, missing secrets and arbitrary database targets', () => {
  for (const [key, value] of [
    ['APP_MODE', 'live'], ['SEED_MODE', 'live'], ['SESSION_COOKIE_SECRET', ''],
    ['CSRF_SECRET', 'REPLACE_ME'], ['IDENTITY_INTERNAL_TOKEN', 'short'],
    ['IDENTITY_DATABASE_URL', 'postgresql://postgres:do-not-disclose@external.example/production'],
    ['BIND_HOST', '0.0.0.0'], ['WEB_ORIGIN', '*'], ['OFF_MODE', 'live'], ['OFFLINE_MODE', 'fixture'],
  ]) {
    const env = { ...fixture(), [key]: value };
    assert.throws(() => readConfig('identity', env), error => error instanceof ConfigurationError && !error.message.includes('do-not-disclose'));
  }
});
test('session limits, timeouts and service ports reject ambiguous or conflicting values', () => {
  for (const override of [
    { SESSION_IDLE_SECONDS: '30000', SESSION_ABSOLUTE_SECONDS: '1000' },
    { INTERNAL_TIMEOUT_MS: '0' }, { WEB_PORT: '4000' }, { KITCHEN_PORT: 'NaN' },
  ]) assert.throws(() => readConfig('gateway-api', { ...fixture(), ...override }), ConfigurationError);
  const config = readConfig('kitchen', fixture());
  assert.equal(config.port, 4002);
  assert.equal(config.mode, 'synthetic');
  assert.equal(Object.isFrozen(config), true);
});
test('internal secret verification rejects missing, array, unequal and wrong-length credentials', () => {
  const secret = 'a'.repeat(64);
  assert.equal(matchesSecret(secret, secret), true);
  for (const received of [undefined, [secret], 'b'.repeat(64), 'a', '']) assert.equal(matchesSecret(received, secret), false);
});
test('startup reporting does not serialize dependency errors or connection credentials', () => {
  const original = console.error;
  const records = [];
  console.error = line => records.push(line);
  try { reportStartupFailure('identity', new Error('postgresql://user:do-not-disclose@localhost/db')); }
  finally { console.error = original; }
  assert.equal(records.length, 1);
  assert.equal(records[0].includes('do-not-disclose'), false);
  assert.equal(JSON.parse(records[0]).code, 'STARTUP_FAILED');
});
