import { spawnSync } from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { requiredContainerFiles } from '../scripts/containers/build.mjs';
import { releaseTag, releasePolicy, sprint2Policy, resolveRelease, verifySource, validatedPair, privatePackages, publishPair, recordedRecovery, recoveryProof } from '../scripts/containers/release.mjs';
import { syntheticEnvironment, scopedEnvironment } from '../scripts/containers/validate.mjs';
const sha = 'a'.repeat(40), digest = 'sha256:' + 'b'.repeat(64);
const metadata = { tag: 'v0.1.0-alpha.1', revision: sha, repository: 'rodrigonpaiva/apptit', owner: 'rodrigonpaiva', ownerType: 'User' };
const release = { tag_name: metadata.tag, published_at: '2026-11-08', draft: false };
const images = { api: { image: 'local-api', imageId: 'api-id', platform: 'linux/amd64' }, web: { image: 'local-web', imageId: 'web-id', platform: 'linux/amd64' } };
const build = { status: 'built', sourceDirty: false, version: metadata.tag, revision: sha, repository: metadata.repository, images };
const validation = { passed: true, images };
function metadataRequest(route) {
  if (route === '/repos/rodrigonpaiva/apptit') return { full_name: metadata.repository, owner: { login: 'RodrigonPaiva', type: 'User' } };
  if (route.includes('/releases/tags/')) return release;
  if (route.includes('/git/ref/')) return { object: { type: 'tag', sha: 'c'.repeat(40) } };
  if (route.includes('/git/tags/')) return { object: { type: 'commit', sha } };
  return null;
}
async function fixture(t) {
  const source = await fs.mkdtemp(path.join(os.tmpdir(), 'apptit-publication-test-'));
  t.after(() => fs.rm(source, { recursive: true, force: true }));
  for (const file of requiredContainerFiles) { await fs.mkdir(path.dirname(path.join(source, file)), { recursive: true }); await fs.writeFile(path.join(source, file), 'fixture'); }
  return source;
}
test('release inputs reject branches, expressions, drafts and unpublished versions', () => {
  for (const value of ['dev', 'refs/tags/v1.0.0', 'v1.0.0;echo test', '${{ secrets.X }}', '../v1.0.0']) assert.throws(() => releaseTag(value));
  assert.equal(releaseTag('v0.1.0-alpha.2'), 'v0.1.0-alpha.2');
  assert.throws(() => releasePolicy({ ...release, draft: true }, metadata.tag));
  assert.throws(() => releasePolicy({ ...release, published_at: null }, metadata.tag));
  assert.throws(() => releasePolicy(release, 'v0.1.0-alpha.2'));
});
test('published annotated tags resolve to commit, with lowercase real owner', async () => {
  const resolved = await resolveRelease(metadata.tag, metadata.repository, metadataRequest);
  assert.equal(resolved.revision, sha); assert.equal(resolved.owner, 'rodrigonpaiva');
  await assert.rejects(resolveRelease(metadata.tag, metadata.repository, () => null), /identity/);
});
test('SP2-05 alone cannot satisfy Sprint 2 acceptance', () => {
  const accepted = { schemaVersion: 1, sprint: 2, status: 'passed', validatedSourceCommit: sha, evidence: 'docs/delivery/SPRINT-2-ACCEPTANCE.md', completed: ['SP2-01', 'SP2-02', 'SP2-03', 'SP2-04', 'SP2-05', 'SP2-06'] };
  sprint2Policy(accepted);
  assert.throws(() => sprint2Policy({ ...accepted, completed: accepted.completed.slice(0, 5) }));
  assert.throws(() => sprint2Policy({ ...accepted, status: 'in-progress' }));
});
test('old source cannot borrow current Dockerfiles; dirty or wrong checkout rejected', async t => {
  const source = await fixture(t);
  await assert.rejects(verifySource(source, metadata, async () => 'wrong'), /differs/);
  await assert.rejects(verifySource(source, metadata, async (_cmd, args) => args[0] === 'rev-parse' ? sha : ' M file'), /clean/);
  await assert.rejects(verifySource(source, { ...metadata, tag: 'v0.1.0-alpha.2' }, async (_cmd, args) => args[0] === 'rev-parse' ? sha : ''), /ENOENT/);
  await fs.unlink(path.join(source, 'containers/Dockerfile'));
  await assert.rejects(verifySource(source, metadata), /lacks required/);
});
test('both exact validated images are mandatory before push', () => {
  validatedPair(metadata, build, validation);
  for (const changed of [{ ...build, status: 'failed' }, { ...build, sourceDirty: true }, { ...build, revision: 'd'.repeat(40) }]) assert.throws(() => validatedPair(metadata, changed, validation));
  assert.throws(() => validatedPair(metadata, build, { ...validation, images: { api: images.api } }), /web/);
});
test('public packages and preexisting release tags block publication', async () => {
  await assert.rejects(privatePackages(metadata, async () => ({ visibility: 'public' })), /not private/);
  const result = await privatePackages(metadata, async route => route.includes('/versions?') ? [{ name: digest, metadata: { container: { tags: [metadata.tag] } } }] : { visibility: 'private' });
  assert.equal(result.api.existingDigest, digest); assert.equal(result.web.existingDigest, digest);
});
async function publishFixture(t, { failWeb = false, replaceWeb = false, publicWeb = false, existingApi = false, moved = false, recover = false, registryPublic = false } = {}) {
  const source = await fixture(t), events = [], pushed = new Set(); const reportFile = path.join(source, 'result.json');
  const request = async route => {
    if (route.includes('/packages/')) {
      const kind = route.includes('apptit-api') ? 'api' : 'web';
      if (route.includes('/versions?')) return existingApi && kind === 'api' ? [{ name: digest, metadata: { container: { tags: [metadata.tag] } } }] : [];
      return publicWeb && kind === 'web' ? { visibility: 'public' } : pushed.has(kind) || existingApi && kind === 'api' ? { visibility: 'private' } : null;
    }
    const value = metadataRequest(route);
    return moved && route.includes('/git/tags/') ? { object: { type: 'commit', sha: 'd'.repeat(40) } } : value;
  };
  const execute = async (cmd, args, options) => {
    events.push([cmd, ...args].join(' '));
    if (cmd === 'git') return args[0] === 'rev-parse' ? sha : '';
    if (args[0] === 'image') return JSON.stringify([{ Id: replaceWeb && args[2] === 'local-web' ? 'replacement' : args[2] === 'local-api' ? 'api-id' : 'web-id' }]);
    if (args[0] === 'login') { assert.equal(options.input, 'test-token\n'); assert.equal(options.env.GITHUB_TOKEN, undefined); }
    if (args[0] === 'push') { const kind = args[1].includes('apptit-api') ? 'api' : 'web'; if (kind === 'web' && failWeb) throw new Error('simulated registry failure'); pushed.add(kind); return `digest: ${digest}`; }
    return '';
  };
  const recovery = recover ? { metadata, build, validation, runId: 1234, publication: { tag: metadata.tag, revision: metadata.revision, status: 'failed', publicationPartial: true, published: { api: { reference: `ghcr.io/${metadata.owner}/apptit-api:${metadata.tag}`, digest } } } } : undefined;
  const inspectRegistry = recover || registryPublic ? async kind => ({ exists: kind === 'api' || pushed.has(kind), existingDigest: kind === 'api' || pushed.has(kind) ? digest : null, visibility: registryPublic ? 'public' : 'private', verification: 'authenticated-manifest-and-anonymous-denial' }) : undefined;
  let error; try { await publishPair({ metadata, source, build, validation, reportFile, request, execute, token: 'test-token', summary: undefined, recovery, inspectRegistry }); } catch (caught) { error = caught; }
  const report = JSON.parse(await fs.readFile(reportFile)); assert.ok(!JSON.stringify(report).includes('test-token'));
  return { report, events, error };
}
test('successful publication rechecks both image IDs before first push and records digests', async t => {
  const { report, events, error } = await publishFixture(t);
  assert.equal(error, undefined); assert.equal(report.status, 'published'); assert.equal(report.publicationPartial, false);
  assert.equal(report.published.web.digest, digest); assert.equal(report.published.api.visibility, 'private');
  assert.ok(events.findIndex(value => value === 'docker image inspect local-web') < events.findIndex(value => value.startsWith('docker push')));
});
test('second push failure records the actual first digest and explicit partial state', async t => {
  const { report, error } = await publishFixture(t, { failWeb: true });
  assert.match(error.message, /simulated/); assert.equal(report.status, 'failed'); assert.equal(report.publicationPartial, true); assert.equal(report.published.api.digest, digest); assert.equal(report.published.web, undefined); assert.equal(report.publicationUncertain, true);
});
for (const [name, option] of Object.entries({ replaced: { replaceWeb: true }, public: { publicWeb: true }, existing: { existingApi: true }, moved: { moved: true } })) test(`${name} preflight failure never pushes either image`, async t => {
  const { report, events, error } = await publishFixture(t, option); assert.ok(error); assert.ok(!events.some(value => value.startsWith('docker push'))); if (name === 'existing') assert.equal(report.publicationPartial, true);
});
test('synthetic credentials are fresh and projected by role', async () => {
  const example = await fs.readFile(new URL('../.env.example', import.meta.url), 'utf8');
  const a = syntheticEnvironment(example), b = syntheticEnvironment(example);
  assert.notEqual(a.POSTGRES_ADMIN_PASSWORD, b.POSTGRES_ADMIN_PASSWORD); assert.equal(a.POSTGRES_PORT, '5432'); assert.equal(a.OBSERVATION_MODE, 'fixture');
  for (const role of ['web', 'gateway-api']) { const scoped = scopedEnvironment(a, role); assert.equal(scoped.IDENTITY_DATABASE_URL, undefined); assert.equal(scoped.KITCHEN_DATABASE_URL, undefined); assert.equal(scoped.POSTGRES_ADMIN_PASSWORD, undefined); }
  assert.equal(scopedEnvironment(a, 'identity').KITCHEN_DATABASE_URL, undefined);
  assert.equal(scopedEnvironment(a, 'kitchen').IDENTITY_DATABASE_URL, undefined);
});

test('build CLI accepts the workflow repository option before validating tagged files', async t => {
  const empty = await fs.mkdtemp(path.join(os.tmpdir(), 'apptit-cli-source-'));t.after(() => fs.rm(empty, { recursive: true, force: true }));
  const result = spawnSync(process.execPath, [new URL('../scripts/containers/build.mjs', import.meta.url).pathname, '--source', empty, '--version', metadata.tag, '--revision', sha, '--repository', metadata.repository], { encoding: 'utf8' });
  assert.equal(result.status, 1);assert.match(result.stderr, /Tagged source lacks required container files/);assert.doesNotMatch(result.stderr, /Unknown option/);
});

test('recorded private API recovery pushes only web and preserves the exact API digest', async t => {
 const {report,events,error}=await publishFixture(t,{existingApi:true,recover:true});assert.equal(error,undefined);assert.equal(report.status,'published');assert.equal(report.publicationPartial,false);assert.equal(report.published.api.digest,digest);assert.equal(report.published.api.retainedFromRun,1234);assert.equal(report.published.web.visibility,'private');assert.equal(events.filter(value=>value.startsWith('docker push')).length,1);assert.ok(events.some(value=>value.startsWith('docker push ghcr.io/rodrigonpaiva/apptit-web:')));assert.ok(!events.some(value=>value.startsWith('docker tag api-id')));
});
test('failed recovered web push still records existing API and partial/uncertain state', async t=>{
 const {report,error}=await publishFixture(t,{existingApi:true,recover:true,failWeb:true});assert.ok(error);assert.equal(report.publicationPartial,true);assert.equal(report.publicationUncertain,true);assert.equal(report.published.api.digest,digest);
});
test('anonymous public access blocks recovery before any push and retains prior partial warning',async t=>{
 const {report,error,events}=await publishFixture(t,{existingApi:true,recover:true,registryPublic:true});assert.ok(error);assert.equal(report.publicationPartial,true);assert.ok(!events.some(value=>value.startsWith('docker push')));
});
test('the versioned first-attempt proof allows only the recorded API digest, source and platform',async()=>{
 const proof=await recordedRecovery();const meta=proof.metadata,api=proof.publication.published.api;
 assert.ok(recoveryProof(meta,'api',api.digest,proof,proof.build.images.api));
 assert.equal(recoveryProof(meta,'web',api.digest,proof,proof.build.images.web),null);
 assert.equal(recoveryProof({...meta,revision:'e'.repeat(40)},'api',api.digest,proof,proof.build.images.api),null);
 assert.equal(recoveryProof(meta,'api','sha256:'+'f'.repeat(64),proof,proof.build.images.api),null);
 assert.equal(recoveryProof(meta,'api',api.digest,proof,{...proof.build.images.api,platform:'linux/arm64'}),null);
 assert.throws(()=>recoveryProof(meta,'api',api.digest,{...proof,validation:{passed:false}},proof.build.images.api));
});

test('unavailable package REST metadata cannot bypass registry privacy and exact-digest preflight',async()=>{
 const result=await privatePackages(metadata,async()=>{throw new Error('REST metadata inaccessible');},async()=>({exists:true,existingDigest:digest,visibility:'private',verification:'authenticated-registry-and-anonymous-denial'}));assert.equal(result.api.restUnavailable,true);assert.equal(result.api.visibility,'private');assert.equal(result.api.existingDigest,digest);
 await assert.rejects(privatePackages(metadata,async()=>{throw new Error('REST metadata inaccessible');},async()=>({exists:false,existingDigest:null,visibility:'public'})),/anonymous reads/);
 await assert.rejects(privatePackages({...metadata,ownerType:'Organization'},async()=>null,async()=>({exists:true,existingDigest:digest,visibility:'restricted'})),/cannot be established/);
});
