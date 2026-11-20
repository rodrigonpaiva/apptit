import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const input = path.join(root, 'docs/planning/delivery-status.json'), output = path.join(root, 'docs/planning/DELIVERY-STATUS.md');
const mode = process.argv[2] ?? '--check';
assert.ok(['--check', '--write'].includes(mode), 'Use --check or --write');
const register = JSON.parse(await fs.readFile(input, 'utf8'));
assert.equal(register.schemaVersion, 1);
assert.match(register.asOf, /^\d{4}-\d{2}-\d{2}$/);
assert.match(register.assessedDevCommit, /^[a-f0-9]{40}$/);
const expectedIds = Array.from({ length: register.baseline.itemCount }, (_, i) => `AP-${String(i + 1).padStart(3, '0')}`);
assert.equal(register.baseline.itemCount, 173, 'Baseline changes require explicit reconciliation');
assert.deepEqual(register.items.map(item => item.id), expectedIds, 'Every original AP ID must occur once, in order');
const expectedPackages = [1,2,3,4].flatMap(sprint => Array.from({ length: 6 }, (_, i) => `SP${sprint}-${String(i + 1).padStart(2, '0')}`));
assert.deepEqual(register.packages.map(item => item.id), expectedPackages);
const deliveries = [...register.packages, ...register.extensions], byId = new Map(deliveries.map(item => [item.id, item]));
assert.equal(byId.size, deliveries.length, 'Duplicate delivery ID');
async function evidenceExists(file) {
  assert.ok(file.startsWith('docs/') && !file.includes('..'), `Unsafe evidence path: ${file}`);
  assert.ok((await fs.stat(path.join(root, file))).isFile(), `Missing evidence: ${file}`);
}
for (const delivery of deliveries) {
  assert.ok(['planned', 'integrated'].includes(delivery.status));
  assert.ok(delivery.parents.length > 0 && new Set(delivery.parents).size === delivery.parents.length);
  for (const id of delivery.parents) assert.ok(expectedIds.includes(id), `Unknown parent: ${id}`);
  for (const id of delivery.prerequisites ?? []) assert.ok(byId.has(id), `Unknown prerequisite: ${id}`);
  if (delivery.status === 'integrated') {
    assert.match(delivery.integration.commit, /^[a-f0-9]{40}$/);
    assert.match(delivery.integration.pr, /^https:\/\/github\.com\/rodrigonpaiva\/apptit\/pull\/\d+$/);
    assert.ok(delivery.review && delivery.evidence.length > 0, 'Integration must retain evidence and review status');
    for (const evidence of delivery.evidence) await evidenceExists(evidence);
  }
}
for (const item of register.items) {
  // This inventory deliberately makes no full parent acceptance assertion.
  assert.ok(['partial', 'not_assessed'].includes(item.status));
  const linked = deliveries.filter(delivery => delivery.status === 'integrated' && delivery.parents.includes(item.id)).map(delivery => delivery.id);
  assert.deepEqual(item.deliveries, linked, `Broken reciprocal AP/delivery mapping: ${item.id}`);
  assert.equal(item.status, linked.length ? 'partial' : 'not_assessed');
  if (linked.length) assert.ok(item.remaining?.trim(), `Missing parent acceptance boundary: ${item.id}`);
}
assert.equal(byId.get(register.nextPackage)?.status, 'planned');
for (const id of byId.get(register.nextPackage).prerequisites) assert.equal(byId.get(id).status, 'integrated', `Next-package dependency is not integrated: ${id}`);
let localSources = 0;
for (const source of register.baseline.sources) {
  assert.ok(source.path.startsWith('plans/') && !source.path.includes('..'));
  assert.match(source.sha256, /^[a-f0-9]{64}$/);
  try {
    const bytes = await fs.readFile(path.join(root, source.path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, `Local planning source changed: ${source.path}; reconcile before refreshing status`);
    localSources++;
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const partial = register.items.filter(item => item.status === 'partial');
const link = file => `[${path.basename(file, '.md')}](${path.relative(path.dirname(output), path.join(root, file)).split(path.sep).join('/')})`;
const clean = value => value.replaceAll('|', '\\|').replaceAll('\n', ' ');
const lines = ['# Delivery status and backlog traceability', '', '<!-- Generated from delivery-status.json by node scripts/delivery-status.mjs --write. -->', '', `As of **${register.asOf}**; assessed integrated dev: \`${register.assessedDevCommit}\`. This is a dated execution snapshot, not a claim about the current branch head or running services.`, '', '## Reading this register', '', '- Product scope and acceptance criteria remain in the original local specification, backlog and sprint plans. Their Proposed status describes the original forecast, not current execution.', '- Integrated means the bounded child delivery reached dev with recorded evidence. It does not mean its parent story is Done, independently reviewed or ready for restaurant use.', '- Partial means linked evidence covers a subset or contract; full parent acceptance/dependencies have not been signed off here. Not assessed means no delivery is mapped by this reconciliation, not proof that code is absent.', '- All acceptance evidence below is historical. This documentation reconciliation does not rerun application tests or certify operational readiness.', '', `Coverage: **173 original AP IDs**, **${partial.length} with partial evidence**, **${173 - partial.length} not assessed**, **0 asserted Done**. Twelve sprint packages are integrated; twelve remain planned.`, '', '## Sprint package execution', '', '| Package | Scope | Execution | Parents | Evidence / integration |', '| --- | --- | --- | --- | --- |'];
for (const item of register.packages) lines.push(`| ${item.id} | ${clean(item.title)} | ${item.status} | ${item.parents.join(', ')} | ${item.status === 'integrated' ? `${link(item.evidence[0])}; [PR](${item.integration.pr})` : 'No implementation acceptance asserted'} |`);
lines.push('', '## Post-Sprint-2 extensions', '', 'These retrospective parent links identify affected scope; they do not expand the approved story or close its remaining criteria.', '', '| Delivery | Parents | Evidence / integration |', '| --- | --- | --- |');
for (const item of register.extensions) lines.push(`| ${clean(item.title)} | ${item.parents.join(', ')} | ${link(item.evidence[0])}; [PR](${item.integration.pr}) |`);
lines.push('', '## Parent stories with partial evidence', '', 'The machine-readable register contains all 173 IDs, including every not-assessed entry. This table shows only parents with linked delivered work. The remaining column is an acceptance boundary, not a new product requirement.', '', '| Parent | Delivered children | Still open / acceptance boundary |', '| --- | --- | --- |');
for (const item of partial) lines.push(`| ${item.id} | ${item.deliveries.join(', ')} | ${clean(item.remaining)} |`);
lines.push('', '## Next planned package', '', `**${register.nextPackage}** — ${byId.get(register.nextPackage).title}. Integrated prerequisites: ${byId.get(register.nextPackage).prerequisites.join(', ')}. Planning readiness is not permission to enable stock effects; refine the ledger/operation boundary and its negative/concurrent cases before implementation.`, '', 'No Sprint 3 or Sprint 4 package is marked implemented. See [maintenance, release distinctions and open reconciliation](README.md).', '');
const rendered = lines.join('\n');
if (mode === '--write') await fs.writeFile(output, rendered); else assert.equal(await fs.readFile(output, 'utf8'), rendered, 'Generated status is stale; run node scripts/delivery-status.mjs --write');
console.log(`PASS: 173 AP IDs, 24 sprint packages, ${register.extensions.length} extensions, reciprocal mappings, existing evidence and rendered status; ${localSources}/${register.baseline.sources.length} local planning fingerprints available. No remote CI or application execution is implied.`);
