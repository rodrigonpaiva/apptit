import { spawn } from 'node:child_process';
import { loadLocalEnv, root, safeFailure, serviceEnv } from './lib.mjs';
try {
  loadLocalEnv();
  const { readConfig } = await import('../packages/runtime/dist/index.js');
  const service = process.argv[2];
  if (!['web', 'gateway-api', 'identity', 'kitchen'].includes(service)) throw new Error('Unknown service.');
  const env = serviceEnv(service);
  const config = readConfig(service, env);
  const production = process.argv.includes('--built');
  const args = service === 'web'
    ? [`${root}node_modules/next/dist/bin/next`, production ? 'start' : 'dev', '--hostname', config.host, '--port', String(config.port)]
    : [production ? '' : '--watch', `${root}${service === 'gateway-api' ? 'apps' : 'services'}/${service}/dist/main.js`].filter(Boolean);
  const child = spawn(process.execPath, args, { env, cwd: service === 'web' ? `${root}apps/web` : root, stdio: 'inherit' });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
  child.on('error', safeFailure);
  child.on('exit', code => { process.exitCode = code ?? 1; });
} catch { safeFailure(); }
