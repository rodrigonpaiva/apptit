import { randomBytes, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { run, saveReport } from './tooling.mjs';
export function syntheticEnvironment(example) {
  const values = new Map(); const result = {};
  for (const line of example.split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('='); const key = line.slice(0, index), value = line.slice(index + 1).replace(/__GENERATE_[A-Z_]+__/g, marker => { if (!values.has(marker)) values.set(marker, randomBytes(32).toString('hex')); return values.get(marker); });
    result[key] = value;
  }
  result.APP_MODE = 'synthetic'; result.SEED_MODE = 'synthetic'; result.OFF_MODE = 'fixture'; result.EVIDENCE_MODE = 'fixture'; result.OBSERVATION_MODE = 'fixture'; result.EVIDENCE_ROOT = '/tmp/apptit-private-evidence'; result.EVIDENCE_MAX_BYTES = '2097152'; result.POSTGRES_PORT = '5432';
  for (const service of ['IDENTITY', 'KITCHEN']) { const url = new URL(result[`${service}_DATABASE_URL`]); url.port = '5432'; result[`${service}_DATABASE_URL`] = url.toString(); }
  return result;
}
export function scopedEnvironment(env, service, seed = false) {
  const scoped = { ...env };
  for (const key of ['POSTGRES_ADMIN_PASSWORD', 'IDENTITY_DB_PASSWORD', 'KITCHEN_DB_PASSWORD', 'IDENTITY_DATABASE_URL', 'KITCHEN_DATABASE_URL', 'IDENTITY_INTERNAL_TOKEN', 'KITCHEN_INTERNAL_TOKEN', 'IDENTITY_KITCHEN_TOKEN']) delete scoped[key];
  for (const key of Object.keys(scoped)) if (/^FIXTURE_.*_PASSWORD$/.test(key)) delete scoped[key];
  if (['identity', 'kitchen'].includes(service)) { scoped[`${service.toUpperCase()}_DATABASE_URL`] = env[`${service.toUpperCase()}_DATABASE_URL`]; scoped[`${service.toUpperCase()}_INTERNAL_TOKEN`] = env[`${service.toUpperCase()}_INTERNAL_TOKEN`]; scoped.IDENTITY_KITCHEN_TOKEN = env.IDENTITY_KITCHEN_TOKEN; }
  if (service === 'gateway-api') { scoped.IDENTITY_INTERNAL_TOKEN = env.IDENTITY_INTERNAL_TOKEN; scoped.KITCHEN_INTERNAL_TOKEN = env.KITCHEN_INTERNAL_TOKEN; }
  if (seed && service === 'identity') for (const key of Object.keys(env)) if (/^FIXTURE_.*_PASSWORD$/.test(key)) scoped[key] = env[key];
  return scoped;
}
export async function validateImages({ source, images, reportFile }) {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'apptit-container-')); const prefix = 'apptit-validation-' + randomUUID().slice(0, 8); const owned = [];
  const report = { passed: false, source, images, syntheticOnly: true, isolatedDatabase: true, publishedPorts: [], checks: [] };
  const env = syntheticEnvironment(await fs.readFile(path.join(source, '.env.example'), 'utf8')); const secrets = Object.entries(env).filter(([key]) => /PASSWORD|TOKEN|SECRET|DATABASE_URL/.test(key)).map(([, value]) => value);
  const docker = args => run('docker', args, { secrets });
  async function envFile(name, values) { const filename = path.join(temporary, name); await fs.writeFile(filename, Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n', { mode: 0o600 }); return filename; }
  async function start(name, args) { owned.push(name); await docker(['run', '-d', '--name', name, ...args]); }
  async function wait(name, args) { const end = Date.now() + 60000; while (Date.now() < end) { try { await docker(['exec', name, ...args]); return; } catch { await new Promise(resolve => setTimeout(resolve, 300)); } } throw new Error(`Container readiness failed: ${name}`); }
  try {
    const postgres = `${prefix}-postgres`, pgImage = `${prefix}-postgres:fixture`;
    await run('docker', ['build', '--tag', pgImage, '.'], { cwd: path.join(source, 'infra') });
    const pgEnv = await envFile('postgres.env', { POSTGRES_USER: 'postgres', POSTGRES_PASSWORD: env.POSTGRES_ADMIN_PASSWORD, IDENTITY_DB_PASSWORD: env.IDENTITY_DB_PASSWORD, KITCHEN_DB_PASSWORD: env.KITCHEN_DB_PASSWORD });
    await start(postgres, ['--env-file', pgEnv, pgImage]); await wait(postgres, ['pg_isready', '-U', 'postgres']);
    for (const service of ['identity', 'kitchen']) {
      const credentials = await envFile(`${service}-init.env`, scopedEnvironment(env, service, true));
      for (const action of ['migrate', 'seed', 'seed']) await docker(['run', '--rm', '--network', `container:${postgres}`, '--env-file', credentials, images.api.image, action, service]);
      const filename = await envFile(`${service}.env`, scopedEnvironment(env, service));
      await start(`${prefix}-${service}`, ['--network', `container:${postgres}`, '--env-file', filename, images.api.image, service]);
    }
    const gateway = `${prefix}-gateway`, web = `${prefix}-web`;
    await start(gateway, ['--network', `container:${postgres}`, '--env-file', await envFile('gateway.env', scopedEnvironment(env, 'gateway-api')), images.api.image, 'gateway-api']);
    await start(web, ['--network', `container:${postgres}`, '--env-file', await envFile('web.env', scopedEnvironment(env, 'web')), images.web.image, 'web']);
    const code = "Promise.all([fetch('http://127.0.0.1:4000/health/ready'),fetch('http://127.0.0.1:3000')]).then(r=>process.exit(r.every(v=>v.ok)?0:1)).catch(()=>process.exit(1))";
    await wait(gateway, ['node', '-e', code]); report.checks.push('migrations', 'repeat-seed', 'api-ready', 'web-200');
    const probeEnv = await envFile('probe.env', env);
    await new Promise((resolve, reject) => {
      const child = spawn('docker', ['exec', '-i', '--env-file', probeEnv, gateway, 'node', 'containers/probe.mjs'], { stdio: ['pipe', 'pipe', 'pipe'] });
      let output = '', buffer = '', ready = false, complete = false;
      const timer = setTimeout(() => { child.kill('SIGTERM'); reject(new Error('Container probe timed out')); }, 120000);
      child.stderr.on('data', data => { output += data; });
      child.stdout.on('data', data => { output += data; buffer += data; let end; while ((end = buffer.indexOf('\n')) >= 0) { const line = buffer.slice(0, end); buffer = buffer.slice(end + 1); let value; try { value = JSON.parse(line); } catch { continue; }
        if (value.phase === 'ready' && !ready) { ready = true; report.probe = value; docker(['stop', '--time', '3', `${prefix}-identity`]).then(() => child.stdin.write('identity-stopped\n')).catch(reject); }
        if (value.phase === 'complete' && value.passed === true && ready) { complete = true; report.dependencyFailureVerified = value.dependencyFailureVerified; }
      } });
      child.on('error', error => { clearTimeout(timer); reject(error); });
      child.on('exit', code => { clearTimeout(timer); for (const secret of secrets) if (secret) output = output.replaceAll(secret, '[redacted]'); if (code === 0 && complete && report.probe?.inventoryCountsUnchanged === true && report.probe?.draftState === 'draft') resolve(); else reject(new Error(`Container probe failed: ${output.slice(-4000)}`)); });
    });
    report.passed = true; return report;
  } catch (error) {
    let message = error.message;
    for (const name of owned) { try { message += '\n' + await docker(['logs', '--tail', '12', name]); } catch { /* already removed */ } }
    for (const secret of secrets) if (secret) message = message.replaceAll(secret, '[redacted]'); report.error = message; throw new Error(message, { cause: error });
  } finally {
    for (const name of owned.reverse()) await docker(['rm', '-f', '-v', name]).catch(() => undefined);
    await fs.rm(temporary, { recursive: true, force: true }); report.cleanup = 'task-owned containers/anonymous database volume/env files removed'; await saveReport(reportFile, report);
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { source: { type: 'string', default: process.cwd() }, images: { type: 'string', default: '/tmp/apptit-images.json' }, report: { type: 'string', default: '/tmp/apptit-container-validation.json' } } });
  try { const build = JSON.parse(await fs.readFile(values.images, 'utf8')); if (build.status !== 'built') throw new Error('Both image builds must pass before validation'); await validateImages({ source: path.resolve(values.source), images: build.images, reportFile: path.resolve(values.report) }); console.log('Both containers passed synthetic initialization, scoped draft/no-stock and inherited HTTP checks.'); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
