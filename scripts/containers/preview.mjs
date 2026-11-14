import fs from 'node:fs/promises';
import { run } from './tooling.mjs';
export async function previewProfile(directory, action, execute = run) {
  const profileFile = new URL('active-preview.json', directory);
  if (action === 'release') await fs.rm(profileFile, { force: true });
  let profile;
  try { profile = JSON.parse(await fs.readFile(action === 'ocr-preview' ? new URL('ocr-images.json', directory) : profileFile, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT' && action !== 'ocr-preview') return null; throw error; }
  if (profile.status !== 'built' || profile.sourceDirty || profile.version !== 'local-ap128' || profile.repository !== 'rodrigonpaiva/apptit' || !/^[a-f0-9]{40}$/.test(profile.revision)) throw new Error('A clean local-ap128 build report is required');
  for (const kind of ['api', 'web']) {
    const image = profile.images?.[kind];
    if (!image || !/^sha256:[a-f0-9]{64}$/.test(image.imageId) || !/^linux\/(arm64|amd64)$/.test(image.platform)) throw new Error('Invalid local image proof');
    if (!['down', 'status', 'logs'].includes(action)) {
      const [actual] = JSON.parse(await execute('docker', ['image', 'inspect', image.imageId]));
      if (actual.Id !== image.imageId || `${actual.Os}/${actual.Architecture}` !== image.platform || actual.Config.Labels['org.opencontainers.image.source'] !== 'https://github.com/rodrigonpaiva/apptit' || actual.Config.Labels['org.opencontainers.image.revision'] !== profile.revision || actual.Config.Labels['org.opencontainers.image.version'] !== profile.version) throw new Error('Local preview image proof changed');
    }
  }
  const services = {};
  for (const role of ['evidence-init', 'identity-init', 'kitchen-init', 'identity', 'kitchen', 'gateway', 'web', 'browser']) {
    const image = profile.images[['web', 'browser'].includes(role) ? 'web' : 'api']; services[role] = { image: image.imageId, platform: image.platform, pull_policy: 'never' };
  }
  const overlay = new URL('preview-compose.json', directory);
  await fs.writeFile(overlay, JSON.stringify({ services }, null, 2), { mode: 0o600 });
  if (action === 'ocr-preview') await fs.writeFile(profileFile, JSON.stringify(profile), { mode: 0o600 });
  return overlay;
}
