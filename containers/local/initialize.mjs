import { spawnSync } from 'node:child_process';
const service = process.argv[2];
if (!['identity', 'kitchen'].includes(service)) throw new Error('Invalid synthetic initialization role');
for (const action of ['migrate', 'seed']) {
  const result = spawnSync(process.execPath, ['containers/entry.mjs', action, service], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
