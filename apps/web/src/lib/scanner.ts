import type * as ZXingReader from 'zxing-wasm/reader';
let reader: Promise<typeof ZXingReader> | undefined;
export async function decodeProductFrame(frame: ImageData): Promise<string | null> {
  reader ??= import('zxing-wasm/reader').then(module => {
    module.prepareZXingModule({ overrides: { locateFile: path => path.endsWith('.wasm') ? '/api/scanner?v=3.1.6' : path } });
    return module;
  });
  try {
    const module = await reader;
    const results = await module.readBarcodes(frame, { formats: ['EAN13', 'EAN8', 'UPCA', 'UPCE', 'ITF14'], maxNumberOfSymbols: 1, tryHarder: true });
    return results[0]?.text ?? null;
  } catch (error) { reader = undefined; throw error; }
}
