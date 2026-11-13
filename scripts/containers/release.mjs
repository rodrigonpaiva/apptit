import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { requireContainerSource } from './build.mjs';
import { run, saveReport } from './tooling.mjs';
import { registryInspector } from './registry.mjs';
export function releaseTag(value) {
  if (typeof value !== 'string' || value.length > 100 || !/^v\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*)?$/.test(value)) throw new Error('A version tag, never a branch/ref/expression, is required');
  return value;
}
export function releasePolicy(release, tag) {
  if (release.tag_name !== releaseTag(tag) || release.draft || !release.published_at) throw new Error('Release must already be published for the exact requested tag');
}
export function sprint2Policy(value) {
  const expected = ['SP2-01', 'SP2-02', 'SP2-03', 'SP2-04', 'SP2-05', 'SP2-06'];
  if (value.schemaVersion !== 1 || value.sprint !== 2 || value.status !== 'passed' || !/^[a-f0-9]{40}$/.test(value.validatedSourceCommit ?? '') || value.evidence !== 'docs/delivery/SPRINT-2-ACCEPTANCE.md' || !expected.every(item => value.completed?.includes(item))) throw new Error('Sprint 2 acceptance is missing/incomplete; SP2-05 alone cannot authorize alpha.2');
}
export async function github(route, { token = process.env.GITHUB_TOKEN, fetcher = fetch } = {}) {
  if (!token) throw new Error('GITHUB_TOKEN is required; never substitute a local PAT for publication');
  const response = await fetcher('https://api.github.com' + route, { headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' }, signal: AbortSignal.timeout(20000) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub metadata request rejected (${response.status})`);
  return response.json();
}
export async function resolveRelease(tag, repository, request = github) {
  releaseTag(tag);
  if (!/^[A-Za-z0-9-]+\/apptit$/.test(repository ?? '')) throw new Error('Expected the actual owner/apptit repository');
  const repo = await request(`/repos/${repository}`); if (!repo || repo.full_name.toLowerCase() !== repository.toLowerCase()) throw new Error('Repository identity cannot be verified');
  const release = await request(`/repos/${repository}/releases/tags/${encodeURIComponent(tag)}`); if (!release) throw new Error('Requested release is not published'); releasePolicy(release, tag);
  let ref = await request(`/repos/${repository}/git/ref/tags/${encodeURIComponent(tag)}`);
  for (let i = 0; ref?.object?.type === 'tag' && i < 8; i++) ref = await request(`/repos/${repository}/git/tags/${ref.object.sha}`);
  if (ref?.object?.type !== 'commit' || !/^[a-f0-9]{40}$/.test(ref.object.sha)) throw new Error('Release tag must resolve unambiguously to a commit');
  return { tag, revision: ref.object.sha, repository: repo.full_name, owner: repo.owner.login.toLowerCase(), ownerType: repo.owner.type, publishedAt: release.published_at, releaseUrl: release.html_url };
}
export async function verifySource(source, metadata, execute = run) {
  await requireContainerSource(source);
  if ((await execute('git', ['rev-parse', 'HEAD'], { cwd: source })).trim() !== metadata.revision) throw new Error('Checkout differs from the tag commit');
  if ((await execute('git', ['status', '--porcelain'], { cwd: source })).trim()) throw new Error('Publication requires a clean tag checkout');
  if (metadata.tag !== 'v0.1.0-alpha.1') {
    const acceptance = JSON.parse(await fs.readFile(path.join(source, 'docs/delivery/sprint-2-acceptance.json'), 'utf8')); sprint2Policy(acceptance);
    if (!(await fs.lstat(path.join(source, acceptance.evidence))).isFile()) throw new Error('Sprint 2 acceptance evidence is absent');
    await execute('git', ['merge-base', '--is-ancestor', acceptance.validatedSourceCommit, metadata.revision], { cwd: source });
    await execute('git', ['diff', '--exit-code', acceptance.validatedSourceCommit, metadata.revision, '--', 'apps', 'services', 'packages'], { cwd: source });
  }
}
export function validatedPair(metadata, build, validation) {
  if (build.status !== 'built' || build.sourceDirty || build.version !== metadata.tag || build.revision !== metadata.revision || build.repository !== metadata.repository || validation.passed !== true) throw new Error('Both exact-tag images must build and pass validation before any push');
  for (const kind of ['api', 'web']) if (!build.images[kind]?.imageId || validation.images?.[kind]?.imageId !== build.images[kind].imageId) throw new Error(`Untested ${kind} image`);
}
export async function privatePackages(metadata, request = github, inspectRegistry, allowPublicRetention) {
  const prefix = metadata.ownerType === 'Organization' ? 'orgs' : 'users'; const result = {};
  for (const kind of ['api', 'web']) {
    const route = `/${prefix}/${metadata.owner}/packages/container/apptit-${kind}`; let pkg, restUnavailable = false;
    try { pkg = await request(route); } catch (error) { if (!inspectRegistry) throw error; restUnavailable = true; }
    if (pkg && pkg.visibility !== 'private' && !inspectRegistry) throw new Error(`apptit-${kind} is not private; no images were pushed`);
    result[kind] = { route, exists: Boolean(pkg), existingDigest: null, ...(restUnavailable ? { restUnavailable: true } : {}) };
    if (!pkg && !inspectRegistry) continue;
    for (let page = 1; pkg && !inspectRegistry; page++) {
      if (page > 20) throw new Error('Package version history exceeds safe preflight bound');
      const versions = await request(`${route}/versions?per_page=100&page=${page}`); if (!Array.isArray(versions)) throw new Error('Cannot verify package version metadata');
      const found = versions.find(version => version.metadata?.container?.tags?.includes(metadata.tag));
      if (found) { result[kind].existingDigest = found.name; break; }
      if (versions.length < 100) break;
    }
    if (inspectRegistry) {
      const registry = await inspectRegistry(kind);
      const approvedPublic = registry.visibility === 'public' && allowPublicRetention?.(kind, registry.existingDigest) === true;
      if ((registry.visibility === 'public' || pkg && pkg.visibility !== 'private') && !approvedPublic) throw new Error(`apptit-${kind} permits anonymous reads; no images were pushed`);
      if (result[kind].existingDigest && registry.existingDigest !== result[kind].existingDigest) throw new Error('REST and registry release digests disagree');
      if (registry.exists && !pkg && registry.visibility !== 'private' && !approvedPublic) throw new Error('Private package visibility cannot be established');
      result[kind] = { ...result[kind], ...registry, exists: Boolean(pkg) || registry.exists, registryManifestExists: registry.exists, visibility: approvedPublic ? 'public' : pkg?.visibility ?? registry.visibility, ...(approvedPublic ? { ownerApprovedPublicRetention: true } : {}) };
    }
  }
  return result;
}
export async function recordedRecovery() {
  const root = new URL('../../docs/evidence/ghcr/alpha2-first-attempt/', import.meta.url);
  const result = {};
  for (const [key, file] of Object.entries({ metadata: 'release-metadata.json', build: 'images.json', validation: 'validation.json', publication: 'publication.json' })) result[key] = JSON.parse(await fs.readFile(new URL(file, root), 'utf8'));
  result.runId = 43417110222; result.publicRetentionApproval = JSON.parse(await fs.readFile(new URL('public-retention-approval.json', root), 'utf8')); return result;
}
export function recoveryProof(metadata, kind, digest, recovery, image) {
  if (!recovery) return null;
  if (recovery.metadata.tag !== metadata.tag || recovery.metadata.revision !== metadata.revision || recovery.metadata.repository !== metadata.repository) return null;
  validatedPair(metadata, recovery.build, recovery.validation);
  const previous = recovery.publication;
  if (previous.tag !== metadata.tag || previous.revision !== metadata.revision || previous.status !== 'failed' || !previous.publicationPartial || !recovery.runId) return null;
  const recorded = previous.published?.[kind];
  if (!recorded || typeof image.platform !== 'string' || recorded.digest !== digest || recorded.reference !== `ghcr.io/${metadata.owner}/apptit-${kind}:${metadata.tag}` || recovery.build.images[kind].platform !== image.platform) return null;
  return { ...recorded, retainedFromRun: recovery.runId };
}
export function approvedPublicRetention(metadata, kind, digest, recovery, image) {
  const approval = recovery?.publicRetentionApproval;
  if (metadata.ownerType !== 'User' || !approval || approval.schemaVersion !== 1 || approval.action !== 'retain-existing-public-digest-only' || approval.webVisibility !== 'private' || approval.kind !== 'api' || kind !== 'api') return false;
  if (approval.tag !== metadata.tag || approval.revision !== metadata.revision || approval.repository !== metadata.repository || approval.digest !== digest || approval.reference !== `ghcr.io/${metadata.owner}/apptit-api:${metadata.tag}`) return false;
  return Boolean(recoveryProof(metadata, kind, digest, recovery, image));
}
export async function publishPair({ metadata, source, build, validation, reportFile, request = github, execute = run, token = process.env.GITHUB_TOKEN, summary = process.env.GITHUB_STEP_SUMMARY, inspectRegistry, recovery }) {
  const report = { tag: metadata.tag, revision: metadata.revision, status: 'preflight', published: {}, publicationPartial: false }; let credentials;
  async function checkpoint() {
    report.publicationPartial = Object.keys(report.published).length === 1 || (Object.keys(report.published).length === 0 && (report.existingPublicationPartial === true || report.priorPublicationPartial === true));
    await saveReport(reportFile, report);
    if (summary) await fs.appendFile(summary, `\nGHCR checkpoint: **${report.status}** — ${metadata.tag}, commit ${metadata.revision}.\n` + Object.values(report.published).map(image => `- ${image.reference} @ ${image.digest} — ${image.visibility ?? 'visibility unverified'}${image.retainedFromRun ? '; retained from run ' + image.retainedFromRun : ''}\n`).join('') + (report.publicationPartial ? '\n**PARTIAL PUBLICATION: only one image is recorded. Do not treat this release as complete.**\n' : '') + (report.publicationUncertain ? '\n**UNCERTAIN REGISTRY EFFECT: a push failed without a confirmed digest. Inspect both packages before retrying.**\n' : '') + (report.error ? `\nFailure: ${report.error}\n` : ''));
  }
  try {
    validatedPair(metadata, build, validation);
    if (recovery?.metadata.tag === metadata.tag && recovery.metadata.revision === metadata.revision && recovery.metadata.repository === metadata.repository && recovery.publication.publicationPartial) {
      validatedPair(metadata, recovery.build, recovery.validation); report.priorPublicationPartial = true;
    }
    await verifySource(source, metadata, execute);
    const current = await resolveRelease(metadata.tag, metadata.repository, request); if (current.revision !== metadata.revision) throw new Error('Release tag moved; refusing publication');
    const allowPublic = (kind, digest) => approvedPublicRetention(metadata, kind, digest, recovery, build.images[kind]);
    report.packages = await privatePackages(metadata, request, inspectRegistry, allowPublic);
    const existing = Object.values(report.packages).filter(pkg => pkg.existingDigest);
    report.existingPublicationPartial = existing.length === 1;
    for (const kind of ['api', 'web']) {
      const digest = report.packages[kind].existingDigest; if (!digest) continue;
      const retained = recoveryProof(metadata, kind, digest, recovery, build.images[kind]);
      if (!retained || report.packages[kind].visibility !== 'private' && !allowPublic(kind, digest)) throw new Error('Release tag already exists without exact validated recovery proof; never overwrite. Inspect existing digests/partial state before recovery.');
      report.published[kind] = { ...retained, visibility: report.packages[kind].visibility, verification: report.packages[kind].verification, ...(allowPublic(kind, digest) ? { ownerApprovedPublicRetention: true } : {}) };
    }
    if (!token) throw new Error('GITHUB_TOKEN is required');
    // Re-check both validated local image identities before the first push; mutable local tags are not authority.
    for (const kind of ['api', 'web']) { const [image] = JSON.parse(await execute('docker', ['image', 'inspect', build.images[kind].image])); if (image.Id !== build.images[kind].imageId) throw new Error(`Validated ${kind} image was replaced`); }
    credentials = await fs.mkdtemp(path.join(os.tmpdir(), 'apptit-ghcr-login-')); const env = { ...process.env, DOCKER_CONFIG: credentials }; delete env.GITHUB_TOKEN;
    await execute('docker', ['login', 'ghcr.io', '--username', metadata.owner, '--password-stdin'], { env, input: token + '\n', secrets: [token] });
    for (const kind of ['api', 'web']) {
      if (report.published[kind]) continue; // Preserve the exact previously validated digest; never tag/push it again.
      const reference = `ghcr.io/${metadata.owner}/apptit-${kind}:${metadata.tag}`;
      await execute('docker', ['tag', build.images[kind].imageId, reference], { env });
      report.status = `pushing-${kind}`; report.pushAttempt = { kind, reference }; await checkpoint();
      const output = await execute('docker', ['push', reference], { env, secrets: [token] });
      const digest = [...output.matchAll(/digest:\s*(sha256:[a-f0-9]{64})/g)].at(-1)?.[1];
      report.published[kind] = { reference, digest: digest ?? 'unknown: push completed but digest capture failed' }; await checkpoint();
      if (!digest) throw new Error(`Digest unavailable after ${kind} push; inspect GHCR before retry`);
      delete report.pushAttempt;
      let pkg; try { pkg = await request(report.packages[kind].route); } catch (error) { if (!inspectRegistry) throw error; }
      const registry = inspectRegistry ? await inspectRegistry(kind) : null;
      if ((pkg && pkg.visibility !== 'private') || (registry && registry.existingDigest !== digest) || (!pkg && registry?.visibility !== 'private')) throw new Error(`Post-push private visibility/digest not verified for ${kind}`);
      if (registry?.visibility === 'public') throw new Error(`Post-push anonymous access detected for ${kind}`);
      report.published[kind].visibility = 'private';
      report.published[kind].verification = pkg ? 'REST-private' : registry.verification;
    }
    if (inspectRegistry) {
      for (const kind of ['api', 'web']) {
        const current = await inspectRegistry(kind), published = report.published[kind];
        if (current.existingDigest !== published.digest || metadata.ownerType === 'User' && current.visibility !== published.visibility || current.visibility === 'public' && !allowPublic(kind, current.existingDigest)) throw new Error(`Final registry state changed for ${kind}; inspect before recovery`);
      }
      report.finalRegistryVerified = true;
    }
    report.status = 'published'; return report;
  } catch (error) { report.status = 'failed'; report.error = error.message; if (report.pushAttempt) report.publicationUncertain = true; throw error; }
  finally { if (credentials) await fs.rm(credentials, { recursive: true, force: true }); await checkpoint(); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2]; const file = process.env.RELEASE_METADATA;
  try {
    if (mode === 'resolve') { const value = await resolveRelease(process.env.RELEASE_TAG, process.env.GITHUB_REPOSITORY); await saveReport(file, value); await fs.appendFile(process.env.GITHUB_OUTPUT, `tag=${value.tag}\nsha=${value.revision}\n`); }
    else {
      const metadata = JSON.parse(await fs.readFile(file, 'utf8')); const source = process.env.RELEASE_SOURCE;
      if (mode === 'verify') await verifySource(source, metadata);
      else if (mode === 'publish') await publishPair({ metadata, source, build: JSON.parse(await fs.readFile(process.env.IMAGE_REPORT, 'utf8')), validation: JSON.parse(await fs.readFile(process.env.VALIDATION_REPORT, 'utf8')), reportFile: process.env.PUBLICATION_REPORT, inspectRegistry: registryInspector(metadata, process.env.GITHUB_TOKEN), recovery: await recordedRecovery() });
      else throw new Error('Unknown release operation');
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
