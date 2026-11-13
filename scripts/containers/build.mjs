import { parseArgs } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run, saveReport } from './tooling.mjs';
export const requiredContainerFiles = ['containers/Dockerfile', 'containers/entry.mjs', 'containers/probe.mjs', '.dockerignore', 'package.json', 'package-lock.json', 'scripts/lib.mjs', 'scripts/access-smoke.mjs', 'infra/Dockerfile'];
export async function requireContainerSource(source) {
  const missing = [];
  for (const file of requiredContainerFiles) { try { if (!(await fs.lstat(path.join(source, file))).isFile()) missing.push(file); } catch { missing.push(file); } }
  if (missing.length) throw new Error(`Tagged source lacks required container files: ${missing.join(', ')}`);
}
export async function buildImages({ source, version, revision, repository = 'rodrigonpaiva/apptit', reportFile, execute = run }) {
  await requireContainerSource(source);
  if (!/^[A-Za-z0-9_.-]{1,100}$/.test(version) || !/^[a-f0-9]{40}$/.test(revision) || !/^[A-Za-z0-9-]+\/apptit$/.test(repository)) throw new Error('Invalid image metadata');
  const report = { version, revision, repository, sourceDirty: Boolean((await execute('git', ['status', '--porcelain'], { cwd: source })).trim()), status: 'building', images: {} };
  try {
    for (const target of ['api', 'web']) {
      const image = `apptit-validation-${target}:${revision.slice(0, 12)}`;
      console.log(`Building ${target} from ${revision} (${version})`);
      const output = await execute('docker', ['build', '--target', target, '--build-arg', `VERSION=${version}`, '--build-arg', `REVISION=${revision}`, '--build-arg', `SOURCE=https://github.com/${repository}`, '--tag', image, '--file', 'containers/Dockerfile', '.'], { cwd: source }).catch(async error => { await fs.writeFile(reportFile + `.${target}.log`, error.output ?? error.message); throw error; });
      await fs.writeFile(reportFile + `.${target}.log`, output);
      const [data] = JSON.parse(await execute('docker', ['image', 'inspect', image]));
      for (const [key, value] of Object.entries({ source: `https://github.com/${repository}`, version, revision })) if (data.Config.Labels?.[`org.opencontainers.image.${key}`] !== value) throw new Error(`Invalid ${target} OCI ${key}`);
      report.images[target] = { image, imageId: data.Id, platform: `${data.Os}/${data.Architecture}`, user: data.Config.User };
      if (!data.Config.User || ['root', '0'].includes(data.Config.User)) throw new Error(`${target} runs as root`);
      await execute('docker', ['run', '--rm', '--entrypoint', 'node', image, '-e', "const fs=require('fs'); for(const p of ['/app/.env','/app/.git','/app/.local']) if(fs.existsSync(p)) process.exit(1);"]);
    }
    report.status = 'built'; return report;
  } catch (error) { report.status = 'failed'; report.error = error.message; throw error; } finally { await saveReport(reportFile, report); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { source: { type: 'string', default: process.cwd() }, version: { type: 'string', default: 'local-validation' }, revision: { type: 'string' }, repository: { type: 'string', default: 'rodrigonpaiva/apptit' }, report: { type: 'string', default: '/tmp/apptit-images.json' } } });
  const source = path.resolve(values.source); const revision = values.revision ?? (await run('git', ['rev-parse', 'HEAD'], { cwd: source })).trim();
  try { await fs.mkdir(path.dirname(path.resolve(values.report)), { recursive: true }); await buildImages({ source, version: values.version, revision, repository: values.repository, reportFile: path.resolve(values.report) }); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
