import { spawn } from 'node:child_process';
import { root, loadLocalEnv } from './lib.mjs';
loadLocalEnv();
const child = spawn(process.execPath, [`${root}node_modules/nx/dist/bin/nx.js`, ...process.argv.slice(2)], {
  cwd: root, stdio: 'inherit', env: { ...process.env, NX_DAEMON: 'false', NX_ISOLATE_PLUGINS: 'false', NX_NO_CLOUD: 'true', NEXT_TELEMETRY_DISABLED: '1' },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', () => { console.error('Could not launch Nx. Run npm ci.'); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
