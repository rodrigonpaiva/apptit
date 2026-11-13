import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { syntheticEnvironment, scopedEnvironment } from './validate.mjs';
const root = new URL('../../', import.meta.url), directory = new URL('.local/alpha2/', root);
const action = process.argv[2];
async function prepare() {
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  const configFile = new URL('settings.json', directory);
  let env;
  try { env = JSON.parse(await fs.readFile(configFile, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    env = syntheticEnvironment(await fs.readFile(new URL('.env.example', root), 'utf8'));
    await fs.writeFile(configFile, JSON.stringify(env), { mode: 0o600, flag: 'wx' });
  }
  async function write(name, values) { await fs.writeFile(new URL(name, directory), Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n', { mode: 0o600 }); }
  await write('postgres.env', { POSTGRES_USER: 'postgres', POSTGRES_PASSWORD: env.POSTGRES_ADMIN_PASSWORD, IDENTITY_DB_PASSWORD: env.IDENTITY_DB_PASSWORD, KITCHEN_DB_PASSWORD: env.KITCHEN_DB_PASSWORD });
  for (const [name, role] of Object.entries({ identity: 'identity', kitchen: 'kitchen', gateway: 'gateway-api', web: 'web' })) {
    await write(`${name}.env`, scopedEnvironment(env, role));
    if (['identity', 'kitchen'].includes(role)) await write(`${name}-init.env`, scopedEnvironment(env, role, true));
  }
  const accounts = [['chef.a@apptit.test','CHEF_A'],['stock.a@apptit.test','STOREKEEPER_A'],['cook.a@apptit.test','COOK_A'],['chef.b@apptit.test','CHEF_B'],['chef.multi@apptit.test','MULTI']].map(([login, key]) => ({ login, password: env[`FIXTURE_${key}_PASSWORD`] }));
  await fs.writeFile(new URL('fixture-credentials.json', directory), JSON.stringify(accounts, null, 2) + '\n', { mode: 0o600 });
}
try {
  if (!['up', 'down', 'status', 'logs', 'prepare'].includes(action)) throw new Error('Use up, down, status, logs or prepare');
  if (['up', 'prepare'].includes(action)) await prepare();
  if (action === 'prepare') console.log('Private synthetic settings prepared in .local/alpha2; existing credentials preserved.');
  else {
    const args = { up: ['up', '-d', '--build', '--wait', '--wait-timeout', '240'], down: ['down'], status: ['ps', '-a'], logs: ['logs', '--tail', '80', 'identity', 'kitchen', 'gateway', 'web', 'browser'] }[action];
    const child = spawn('docker', ['compose', '--project-name', 'apptit-alpha2-local', '--file', fileURLToPath(new URL('containers/local/compose.yaml', root)), ...args], { stdio: 'inherit' });
    child.on('error', () => { console.error('Docker Compose could not start.'); process.exitCode = 1; });
    child.on('exit', code => { process.exitCode = code ?? 1; if (code === 0 && action === 'up') console.log('Open http://127.0.0.1:3000/login. Private synthetic logins: .local/alpha2/fixture-credentials.json'); });
  }
} catch { console.error('Local alpha.2 setup failed. Check Docker and private configuration; credentials were not printed.'); process.exitCode = 1; }
