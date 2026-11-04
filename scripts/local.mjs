import { spawn } from 'node:child_process';
import { loadLocalEnv, root, run, safeFailure } from './lib.mjs';
try {
  loadLocalEnv();
  await run('npm', ['run', 'build:backend']);
  const { readConfig } = await import('../packages/runtime/dist/index.js');
  for (const service of ['web', 'gateway-api', 'identity', 'kitchen']) readConfig(service);
  await run('npm', ['run', 'infra:up']);
  await run('npm', ['run', 'db:migrate']);
  await run('npm', ['run', 'db:seed']);
  // Each process group includes its watch/server descendants. No child owns terminal input.
  const launch = args => spawn(process.execPath, args, {
    cwd: root, stdio: ['ignore', 'inherit', 'inherit'], detached: process.platform !== 'win32',
  });
  const children = [
    launch([`${root}node_modules/typescript/bin/tsc`, '-b', '--watch', '--preserveWatchOutput']),
    ...['identity', 'kitchen', 'gateway-api', 'web'].map(service => launch([`${root}scripts/serve.mjs`, service])),
  ];
  let stopping = false;
  function terminate(child, signal) {
    try {
      if (process.platform === 'win32') child.kill(signal);
      else process.kill(-child.pid, signal);
    } catch (error) { if (error.code !== 'ESRCH') console.error('Could not stop a local runtime.'); }
  }
  function stop(code) {
    if (stopping) return;
    stopping = true;
    process.exitCode = code;
    for (const child of children) terminate(child, 'SIGTERM');
    const timer = setTimeout(() => {
      for (const child of children) if (child.exitCode === null) terminate(child, 'SIGKILL');
    }, 3000);
    timer.unref();
  }
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop(0));
  for (const child of children) {
    child.on('error', () => stop(1));
    child.on('exit', code => stop(code ?? 1));
  }
} catch { safeFailure(); }
