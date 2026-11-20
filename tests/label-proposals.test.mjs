import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
async function parser(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'apptit-label-parser-')); t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const source = await fs.readFile(new URL('../apps/web/src/lib/label-proposals.ts', import.meta.url), 'utf8');
  const file = path.join(dir, 'parser.mjs'); await fs.writeFile(file, ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText);
  return import(pathToFileURL(file).href);
}
test('label proposals preserve leading-zero batch codes and distinguish explicit DLC/DDM', async t => {
  const { labelProposals } = await parser(t);
  assert.deepEqual(labelProposals('LOT: 001AB23\nDLC: 29/02/2028', 90), { batch: '001AB23', expiry: '2028-02-29', expiryKind: 'use_by', uncertain: false });
  assert.equal(labelProposals('LOT: AB-123\nÀ consommer de préférence avant: 2028-12-31', 90).expiryKind, 'best_before');
  const generic = labelProposals('LOT: AB12\nEXP: 31.12.2028', 90); assert.equal(generic.expiry, '2028-12-31'); assert.equal(generic.expiryKind, null); assert.equal(generic.uncertain, true);
});
test('uncertain, unlabelled, conflicting, invalid and two-digit-year readings never invent a date or lot', async t => {
  const { labelProposals } = await parser(t);
  for (const value of ['DLC: 29/02/2027', 'DLC: 31/04/2028', 'DLC: 01/02/28', 'DLC: 03/04/2028', 'FAB: 01/02/2028', '01/02/2028', 'DLC: 01/02/2028\nDLC: 02/02/2028']) assert.equal(labelProposals(value, 95).expiry, null, value);
  assert.equal(labelProposals('LOT A123\nLOT B456', 95).batch, null);
  assert.equal(labelProposals('LOT 00123 DLC 31/12/2028', 30).batch, null);
  assert.equal(labelProposals('', 95).uncertain, true);
  assert.equal(labelProposals('LOT 00123 DLC 31/12/2028', NaN).expiry, null);
});
