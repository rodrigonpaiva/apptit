import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('live OFF opt-in and fixture restoration preserve local credentials and role isolation', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'apptit-local-mode-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, 'scripts'), { recursive: true });
  await fs.cp(new URL('../scripts/containers', import.meta.url), path.join(root, 'scripts/containers'), { recursive: true });
  await fs.copyFile(new URL('../.env.example', import.meta.url), path.join(root, '.env.example'));
  const bin = path.join(root, 'bin'); await fs.mkdir(bin);
  await fs.writeFile(path.join(bin, 'docker'), '#!/bin/sh\nprintf "%s\\n" "$@" > "$DOCKER_ARGUMENTS"\n', { mode: 0o700 });
  const argsFile = path.join(root, 'docker-arguments');
  function run(action) {
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/containers/local.mjs'), action], { encoding: 'utf8', env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH, DOCKER_ARGUMENTS: argsFile } });
    assert.equal(result.status, 0, result.stderr);
  }
  const config = () => fs.readFile(path.join(root, '.local/alpha2/settings.json'), 'utf8').then(JSON.parse);
  run('prepare'); const before = await config(); assert.equal(before.OFF_MODE, 'fixture');
  const accounts = await fs.readFile(path.join(root, '.local/alpha2/fixture-credentials.json'), 'utf8');
  run('off-live'); const live = await config(); assert.deepEqual(live, { ...before, OFF_MODE: 'live' });
  assert.equal(await fs.readFile(path.join(root, '.local/alpha2/fixture-credentials.json'), 'utf8'), accounts);
  const kitchen = await fs.readFile(path.join(root, '.local/alpha2/kitchen.env'), 'utf8');
  assert.match(kitchen, /^OFF_MODE=live$/m); assert.doesNotMatch(kitchen, /^IDENTITY_DATABASE_URL=|^FIXTURE_.*PASSWORD=/m);
  const invoked = await fs.readFile(argsFile, 'utf8'); assert.match(invoked, /\nup\n-d\n/); assert.doesNotMatch(invoked, /\ndown\n|--volumes/);
  run('off-fixture'); assert.deepEqual(await config(), before);
  run('up'); assert.deepEqual(await config(), before);
});
