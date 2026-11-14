import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
export const runtime = 'nodejs';
/** Public pinned OCR runtime/model only; never accepts label bytes or arbitrary filesystem paths. */
export async function GET(_request: Request, { params }: { params: Promise<{ asset: string[] }> }) {
  const { asset } = await params; const key = asset.join('/');
  let file: string, type: string;
  if (key === 'worker.min.js') { file = 'tesseract.js/dist/worker.min.js'; type = 'application/javascript'; }
  else if (key === 'lang/fra.traineddata.gz') { file = '@tesseract.js-data/fra/4.0.0/fra.traineddata.gz'; type = 'application/octet-stream'; }
  else if (/^core\/tesseract-core(?:-simd|-relaxedsimd)?(?:-lstm)?\.wasm(?:\.js)?$/.test(key)) { file = 'tesseract.js-core/' + asset[1]; type = key.endsWith('.js') ? 'application/javascript' : 'application/wasm'; }
  else return new Response(null, { status: 404 });
  try { return new Response(new Uint8Array(await readFile(resolve(process.cwd(), '../../node_modules', file))), { headers: { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } }); }
  catch { return new Response(null, { status: 503 }); }
}
