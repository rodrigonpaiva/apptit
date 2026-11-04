import { loadLocalEnv, root, run, safeFailure } from './lib.mjs';
try {
  loadLocalEnv();
  const action = process.argv[2];
  const args = ['compose', '--env-file', `${root}.env`, '-f', `${root}infra/compose.yaml`];
  if (action === 'up') args.push('up', '-d', '--build', '--wait', '--wait-timeout', '90');
  else if (action === 'down') args.push('down');
  else if (action === 'reset' && process.argv[3] === '--confirm-synthetic-reset') args.push('down', '--volumes');
  else throw new Error('Expected up/down or explicit synthetic reset.');
  await run('docker', args);
} catch { safeFailure(); }
