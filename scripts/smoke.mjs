import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { setTimeout as pause } from 'node:timers/promises';
import { loadLocalEnv, root, serviceEnv } from './lib.mjs';
import { readConfig } from '../packages/runtime/dist/index.js';
const require = createRequire(new URL('../services/identity/package.json', import.meta.url));
const { Pool } = require('pg');
const children = [];
let output = '';
let stopping = false;
function redact(value) {
  for (const [key, secret] of Object.entries(process.env)) {
    if (/PASSWORD|TOKEN|SECRET|DATABASE_URL/.test(key) && secret) value = value.replaceAll(secret, '[redacted]');
  }
  return value;
}
async function waitFor(url, options) {
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    if (children.some(child => child.exitCode !== null)) throw new Error('A runtime exited before readiness.');
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(1500) });
      if (response.ok) return response;
    } catch { /* dependency startup is retried within the bounded smoke deadline */ }
    await pause(300);
  }
  throw new Error('Runtime readiness timed out.');
}
async function stop() {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (child.exitCode === null) child.kill('SIGTERM');
  await Promise.all(children.map(child => child.exitCode !== null ? Promise.resolve() : new Promise(resolve => {
    const timer = setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 3000);
    child.once('exit', () => { clearTimeout(timer); resolve(); });
  })));
}
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void stop().then(() => process.exit(1)); });
try {
  loadLocalEnv();
  for (const service of ['identity', 'kitchen', 'gateway-api', 'web']) {
    const config = readConfig(service, serviceEnv(service));
    // Fail before spawning if another process already owns a smoke port.
    try {
      await fetch(`http://${config.host}:${config.port}`, { signal: AbortSignal.timeout(500) });
      throw new Error(`Port ${config.port} is already in use.`);
    } catch (error) { if (error.message.includes('already in use')) throw error; }
    const args = service === 'web'
      ? [`${root}node_modules/next/dist/bin/next`, 'start', '--hostname', config.host, '--port', String(config.port)]
      : [`${root}${service === 'gateway-api' ? 'apps' : 'services'}/${service}/dist/main.js`];
    const child = spawn(process.execPath, args, { env: serviceEnv(service), cwd: service === 'web' ? `${root}apps/web` : root, stdio: ['ignore', 'pipe', 'pipe'] });
    children.push(child);
    for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { output = (output + redact(chunk.toString())).slice(-10000); });
    child.on('error', () => { output += `Could not launch ${service}.`; });
  }
  const gateway = readConfig('gateway-api');
  const web = readConfig('web');
  await waitFor(`${gateway.gatewayOrigin}/health/ready`);
  const page = await waitFor(`http://127.0.0.1:${web.port}`);
  assert.match(await page.text(), /Données synthétiques/);
  const graphql = await fetch(`http://127.0.0.1:${web.port}/api/graphql`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: '{ runtimeStatus { mode schemaVersion operationalFeaturesEnabled } }' }),
  });
  const result = await graphql.json();
  assert.deepEqual(result.data.runtimeStatus, { mode: 'synthetic', schemaVersion: 1, operationalFeaturesEnabled: false });
  for (const service of ['identity', 'kitchen']) {
    const config = readConfig(service);
    const response = await fetch(`http://127.0.0.1:${config.port}/health/ready`);
    assert.equal(response.status, 401, 'Internal readiness must reject missing credentials.');
    const db = new Pool({ connectionString: config.databaseUrl, connectionTimeoutMillis: 3000 });
    try {
      const rows = await db.query('SELECT payload FROM "RuntimeFixture" WHERE id=$1', ['synthetic-runtime-v1']);
      assert.equal(rows.rowCount, 1);
      assert.equal(rows.rows[0].payload.mode, 'synthetic');
      assert.equal(rows.rows[0].payload.service, service);
    } finally { await db.end(); }
    const other = new URL(config.databaseUrl);
    other.pathname = service === 'identity' ? '/apptit_kitchen_synthetic' : '/apptit_identity_synthetic';
    const forbidden = new Pool({ connectionString: other.toString(), connectionTimeoutMillis: 3000 });
    try { await assert.rejects(forbidden.query('SELECT 1'), error => error.code === '42501'); }
    finally { await forbidden.end(); }
  }
  const introspection = await fetch(`${gateway.gatewayOrigin}/graphql`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: '{ __schema { types { name } } }' }),
  });
  assert.ok((await introspection.json()).errors?.length);
  // Demonstrate actual dependency failure instead of a permanently-green health response.
  children[0].kill('SIGTERM');
  await pause(700);
  const degraded = await fetch(`${gateway.gatewayOrigin}/health/ready`);
  assert.equal(degraded.status, 503);
  console.log('PASS: web shell, same-origin GraphQL, synthetic seeds, internal authentication, database isolation and degraded readiness.');
} catch (error) {
  console.error(redact(`${error.message}\n${output}`));
  process.exitCode = 1;
} finally { await stop(); }
