import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { loadLocalEnv, root, run, safeFailure } from './lib.mjs';

const startedAt = new Date().toISOString();
const steps = ['check', 'infra:up', 'db:migrate', 'db:seed', 'db:seed', 'test:integration', 'smoke']
  .map(command => ({ command: `npm run ${command}`, script: command, status: 'not_run', durationMs: null }));
const source = { commit: null, dirty: null };
try {
  source.commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: 'pipe' }).trim();
  source.dirty = !!execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8', stdio: 'pipe' }).trim();
} catch { /* Exported checkouts have no Git metadata; never invent a source revision. */ }
const report = { schemaVersion: 1, startedAt, completedAt: null, status: 'failed', node: process.version, source,
  preflight: 'not_run', steps, scope: 'synthetic local foundation only; no production, stock or restaurant approval' };

async function freePort(key) {
  const value = process.env[key];
  if (!value || !/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535) throw new Error('Invalid local port.');
  await new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(Number(value), '127.0.0.1', () => server.close(error => error ? reject(error) : resolve()));
  });
}

try {
  report.preflight = 'failed';
  loadLocalEnv();
  // Refuse occupied application ports before migrations/seeds; never stop someone else's dev session.
  for (const key of ['WEB_PORT', 'GATEWAY_PORT', 'IDENTITY_PORT', 'KITCHEN_PORT']) await freePort(key);
  report.preflight = 'passed';
  for (const step of steps) {
    console.log(`Foundation verification: ${step.command}`);
    const start = Date.now();
    step.status = 'failed';
    try { await run('npm', ['run', step.script]); step.status = 'passed'; }
    finally { step.durationMs = Date.now() - start; }
  }
  report.status = 'passed';
} catch {
  console.error('Foundation verification stopped. Stop local app runtimes, verify configuration/dependencies, then retry. Remaining steps are not passes.');
  safeFailure();
} finally {
  report.completedAt = new Date().toISOString();
  try {
    const folder = new URL('../.local/verification/', import.meta.url);
    mkdirSync(folder, { recursive: true, mode: 0o700 });
    const name = `foundation-${startedAt.replaceAll(':', '-')}.json`;
    writeFileSync(new URL(name, folder), JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
    console.log(`Foundation result: ${report.status}. Report: .local/verification/${name}`);
  } catch { console.error('Could not persist the verification report.'); process.exitCode = 1; }
}
