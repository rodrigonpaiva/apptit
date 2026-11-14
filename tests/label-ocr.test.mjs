import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createWorker } from 'tesseract.js';
import ts from 'typescript';

test('pinned local OCR evaluates real synthetic label pixels and preserves unknown/ambiguous cases', { timeout: 90000 }, async t => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'apptit-ocr-eval-')); t.after(() => fs.rm(temporary, { recursive: true, force: true }));
  const source = await fs.readFile(path.join(root, 'apps/web/src/lib/label-proposals.ts'), 'utf8');
  const module = path.join(temporary, 'proposals.mjs'); await fs.writeFile(module, ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText);
  const { labelProposals } = await import(pathToFileURL(module).href);
  const worker = await createWorker('fra', 1, { langPath: path.join(root, 'node_modules/@tesseract.js-data/fra/4.0.0'), cacheMethod: 'none' }); t.after(() => worker.terminate());
  const cases = JSON.parse(await fs.readFile(path.join(root, 'tests/fixtures/label-ocr/cases.json'), 'utf8'));
  for (const item of cases) {
    const { data } = await worker.recognize(path.join(root, `tests/fixtures/label-ocr/${item.id}.png`));
    const result = labelProposals(data.text, data.confidence);
    for (const field of ['batch', 'expiry', 'expiryKind']) assert.equal(result[field], item[field], `${item.id}.${field}`);
    t.diagnostic(`${item.id}: real OCR and conservative field checks passed`);
  }
});
