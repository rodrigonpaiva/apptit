import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
export const runtime = 'nodejs';
/** Public immutable decoder bytes only. No camera images or user input reach this handler. */
export async function GET(request: Request) {
  if (new URL(request.url).searchParams.get('v') !== '3.1.6') return new Response(null, { status: 404 });
  try {
    const binary = await readFile(resolve(process.cwd(), '../../node_modules/zxing-wasm/dist/reader/zxing_reader.wasm'));
    return new Response(new Uint8Array(binary), { headers: { 'content-type': 'application/wasm', 'cache-control': 'public, max-age=86400', 'x-content-type-options': 'nosniff' } });
  } catch { return new Response(null, { status: 503 }); }
}
