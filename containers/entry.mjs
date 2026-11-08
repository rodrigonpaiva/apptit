import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { readConfig } from '@apptit/runtime';
import { serviceEnv, root } from '../scripts/lib.mjs';
const [action, selected] = process.argv.slice(2);
try {
  const database = action === 'migrate' || action === 'seed';
  const service = database ? selected : action;
  if (!['identity', 'kitchen', 'gateway-api', 'web'].includes(service) || (database && !['identity', 'kitchen'].includes(service))) throw new Error('Invalid runtime');
  const config = readConfig(service); const env = serviceEnv(service, action === 'seed');
  let args;
  if (action === 'migrate') args = [`${root}node_modules/prisma/build/index.js`, 'migrate', 'deploy', '--config', `${root}services/${service}/prisma.config.ts`];
  else if (action === 'seed') args = [`${root}services/${service}/dist/seed.js`];
  else if (service === 'web') {
    if (String(process.env.GATEWAY_PORT) !== readFileSync(new URL('./gateway-port', import.meta.url), 'utf8')) throw new Error('Rebuild web for this gateway port');
    env.PORT = String(config.port); env.HOSTNAME = config.host;
    args = [`${root}apps/web/server.js`];
  } else args = [`${root}${service === 'gateway-api' ? 'apps' : 'services'}/${service}/dist/main.js`];
  const child = spawn(process.execPath, args, { cwd: root, env, stdio: 'inherit' });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
  child.on('error', () => { console.error('Container runtime could not start.'); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code ?? 1; });
} catch { console.error('Container configuration rejected; verify explicit synthetic settings and runtime arguments.'); process.exitCode = 1; }
