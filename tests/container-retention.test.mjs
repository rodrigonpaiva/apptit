import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { recordedProofs, originalProof, verifyExisting } from '../scripts/containers/verify-existing.mjs';
import { requiredContainerFiles } from '../scripts/containers/build.mjs';

test('each retained image uses its own original paired validation, never a retained image from a later build', async () => {
  const { approval, receipts } = await recordedProofs(), metadata = receipts.api.metadata;
  for (const kind of ['api', 'web']) assert.equal(originalProof(metadata, kind, approval, receipts[kind]).digest, approval.images[kind].digest);
  assert.throws(() => originalProof(metadata, 'api', approval, receipts.web), /original/);
  for (const mutation of [value => value.images.web.digest = 'sha256:' + '0'.repeat(64), value => value.revision = '0'.repeat(40), value => value.images.web.runId = 1, value => delete value.images.web]) {
    const invalid = structuredClone(approval); mutation(invalid);
    assert.throws(() => originalProof(metadata, 'web', invalid, receipts.web));
  }
});

test('read-only verification checks both digests twice, rejects drift and executes only source Git checks', async t => {
  const proofs = await recordedProofs(), metadata = proofs.receipts.api.metadata;
  const source = await fs.mkdtemp(path.join(os.tmpdir(), 'apptit-retention-'));
  t.after(() => fs.rm(source, { recursive: true, force: true }));
  for (const file of [...requiredContainerFiles, 'docs/delivery/SPRINT-2-ACCEPTANCE.md', 'docs/delivery/sprint-2-acceptance.json']) {
    await fs.mkdir(path.dirname(path.join(source, file)), { recursive: true }); await fs.writeFile(path.join(source, file), 'fixture');
  }
  await fs.copyFile(new URL('../docs/delivery/sprint-2-acceptance.json', import.meta.url), path.join(source, 'docs/delivery/sprint-2-acceptance.json'));
  let reads = 0;
  const options = { metadata, source, ...proofs, reportFile: path.join(source, 'report.json'), execute: async (command, args) => { assert.equal(command, 'git'); return args[0] === 'rev-parse' ? metadata.revision : ''; }, request: async route => {
    if (route.endsWith('/apptit')) return { full_name: metadata.repository, owner: { login: metadata.owner, type: 'User' } };
    if (route.includes('/releases/')) return { tag_name: metadata.tag, published_at: metadata.publishedAt, draft: false };
    return { object: { type: 'commit', sha: metadata.revision } };
  }, inspectRegistry: async kind => { reads++; return { exists: true, existingDigest: proofs.approval.images[kind].digest, visibility: 'public', verification: 'anonymous-registry-readable' }; } };
  const result = await verifyExisting(options);
  assert.equal(reads, 4); assert.equal(result.status, 'verified-existing'); assert.equal(result.freshBuildExecuted, false);
  await assert.rejects(verifyExisting({ ...options, inspectRegistry: async () => ({ exists: true, existingDigest: 'changed', visibility: 'public' }) }), /changed/);
  assert.equal(JSON.parse(await fs.readFile(options.reportFile)).status, 'failed');
});
