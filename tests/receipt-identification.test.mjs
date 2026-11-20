import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { referenceImageUrl } from '../packages/domain-values/dist/index.js';
test('receipt photo prefers the scoped catalogue, reuses OFF fallback and keeps missing-image manual data', async t => {
 const root = await fs.mkdtemp(path.join(os.tmpdir(), 'apptit-reference-photo-')); t.after(() => fs.rm(root, { recursive: true, force: true })); const source = await fs.readFile(new URL('../apps/web/src/lib/receipt-identification.ts', import.meta.url), 'utf8'); const file = path.join(root, 'candidate.mjs'); await fs.writeFile(file, ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText); const { receiptCandidate } = await import(pathToFileURL(file).href);
 const lookup = { barcode: '0012345678905', localCandidates: [{ name: 'Local rice', presentation: '5 kg', imageUrl: '/product-images/rice.png' }], product: { name: { value: 'OFF rice' }, presentation: { value: '1 kg' }, imageUrl: 'https://images.openfoodfacts.org/images/products/001/front_fr.1.200.jpg' }, source: { url: 'https://world.openfoodfacts.org/product/0012345678905' } };
 const local = receiptCandidate(lookup); assert.equal(local.name, 'Local rice'); assert.equal(local.photo.source, 'catalogue'); assert.equal(local.photo.url, '/product-images/rice.png');
 const fallback = receiptCandidate({ ...lookup, localCandidates: [] }); assert.equal(fallback.photo.source, 'open_food_facts'); assert.equal(fallback.photo.sourceUrl, lookup.source.url);
 assert.equal(receiptCandidate({ ...lookup, localCandidates: [], product: null }).photo, null);
});
test('public reference URLs exclude private evidence paths and unsafe schemes/hosts', () => {
 for (const value of ['javascript:alert(1)', '/api/evidence/read', '//example.com/photo.png', 'https://127.0.0.1/x', 'https://localhost/x', 'https://a.local/x', 'https://u:p@example.com/x', 'http://example.com/x']) assert.equal(referenceImageUrl(value), null);
 assert.equal(referenceImageUrl('/product-images/rice.png'), '/product-images/rice.png'); assert.equal(referenceImageUrl('https://images.openfoodfacts.org/front.jpg'), 'https://images.openfoodfacts.org/front.jpg');
});
