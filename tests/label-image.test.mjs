import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
test('local OCR rejects oversized and malformed PNG/JPEG headers before raster decoding', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'apptit-label-dimensions-')); t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const source = await fs.readFile(new URL('../apps/web/src/lib/label-image.ts', import.meta.url), 'utf8'), file = path.join(dir, 'dimensions.mjs');
  await fs.writeFile(file, ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText);
  const { labelImageDimensions } = await import(pathToFileURL(file).href);
  const png = new Uint8Array(await fs.readFile(new URL('fixtures/label-ocr/dlc.png', import.meta.url))); assert.deepEqual(labelImageDimensions(png), { width: 1400, height: 650 });
  const oversized = png.slice(); new DataView(oversized.buffer).setUint32(16, 100000); assert.throws(() => labelImageDimensions(oversized));
  const jpeg = Uint8Array.from([255,216,255,192,0,8,8,2,88,3,32,0,255,217]); assert.deepEqual(labelImageDimensions(jpeg), { width: 800, height: 600 });
  for (const value of [new Uint8Array(), Uint8Array.from([255,216,255,192,0,0]), png.subarray(0, 15)]) assert.throws(() => labelImageDimensions(value));
});
