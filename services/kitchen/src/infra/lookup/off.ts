import type { LookupField, LookupProduct, ProductLookup } from '@apptit/contracts';
import type { RuntimeConfig } from '@apptit/runtime';
import { productBarcode } from '@apptit/domain-values';
const API = 'https://world.openfoodfacts.org/api/v3.4/product/';
const FIELDS = 'code,image_front_small_url,product_name,brands,quantity,allergens_tags,nutriments,nutrition_data_per,last_modified_t,schema_version';
const unknown = (reason = 'Not supplied or not interpretable in this source snapshot.'): LookupField => ({ state: 'unknown', value: null, reason });
function field(value: unknown): LookupField { return typeof value === 'string' && value.trim() ? { state: 'known', value: value.trim().slice(0, 500), reason: null } : unknown(); }
function record(input: unknown): Record<string, unknown> { return input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {}; }
function safeImage(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 500) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'images.openfoodfacts.org' && !url.port && !url.username && !url.password && /^\/images\/products\/[0-9/]+\/[a-z]{2,20}(?:_[a-z]{2})?\.[0-9]+\.(?:100|200|400)\.(?:jpg|png)$/.test(url.pathname) && !url.search && !url.hash ? url.href : null;
  } catch { return null; }
}
export function unavailable(barcode: string, reason: string, retryAfterSeconds: number | null = null): ProductLookup {
  return { state: 'unavailable', barcode, reason, retryAfterSeconds, product: null, source: null, missing: [] };
}
export function mapOffResponse(barcode: string, body: unknown, now: Date, synthetic: boolean): ProductLookup {
  const value = record(body);
  const result = record(value['result']);
  const source = { provider: 'open_food_facts' as const, apiVersion: '3.4' as const, url: `https://world.openfoodfacts.org/product/${barcode}`, retrievedAt: now.toISOString(), sourceUpdatedAt: null as string | null, cached: false, synthetic, reviewState: 'unreviewed' as const };
  if (result['id'] === 'product_not_found') return { state: 'absent', barcode, source, product: null, missing: [], reason: null, retryAfterSeconds: null };
  if (value['status'] !== 'success' || result['id'] !== 'product_found') return unavailable(barcode, 'invalid_response');
  const raw = record(value['product']);
  // The provider may pad a UPC/EAN code. Preserve the submitted code while checking numeric equivalence as text.
  if (typeof raw['code'] !== 'string' || !/^\d{8,14}$/.test(raw['code']) || raw['code'].replace(/^0+/, '') !== barcode.replace(/^0+/, '')) return unavailable(barcode, 'invalid_response');
  const timestamp = raw['last_modified_t'];
  if (typeof timestamp === 'number' && Number.isSafeInteger(timestamp) && timestamp > 0 && timestamp <= now.getTime() / 1000) source.sourceUpdatedAt = new Date(timestamp * 1000).toISOString();
  const tags = raw['allergens_tags'];
  const allergens = Array.isArray(tags) && tags.length > 0 && tags.length <= 30 && tags.every(tag => typeof tag === 'string' && tag.length <= 80) ? field(tags.join(', ')) : unknown('No usable allergen declaration; absence is not allergen-free.');
  const nutrients = record(raw['nutriments']);
  const basis = raw['nutrition_data_per'];
  const facts = [['energy-kj_100g', 'Énergie', 'kJ'], ['fat_100g', 'Lipides', 'g'], ['carbohydrates_100g', 'Glucides', 'g'], ['proteins_100g', 'Protéines', 'g'], ['salt_100g', 'Sel', 'g']];
  const values = facts.map(([key, label, unit]) => {
    const value = nutrients[key!];
    const text = typeof value === 'number' && Number.isFinite(value) ? String(value) : typeof value === 'string' ? value : '';
    return /^(?:0|[1-9]\d{0,8})(?:\.\d{1,9})?$/.test(text) ? `${label} ${text} ${unit}` : null;
  });
  const nutrition = (basis === '100g' || basis === '100ml') && values.every(value => value !== null) ? field(`Pour ${basis} : ${values.join(' ; ')}`) : unknown('Incomplete nutrition or undeclared basis; verify the physical label.');
  const imageUrl = safeImage(raw['image_front_small_url']);
  const product: LookupProduct = { imageUrl, name: field(raw['product_name']), brands: field(raw['brands']), presentation: field(raw['quantity']), allergens, nutrition };
  const missing = Object.entries(product).filter(([key, value]) => key !== 'imageUrl' && typeof value === 'object' && value !== null && value.state === 'unknown').map(([key]) => key);
  return { state: missing.length ? 'incomplete' : 'found', barcode, product, source, missing, reason: null, retryAfterSeconds: null };
}
const complete = (code: string) => ({ status: 'success', result: { id: 'product_found' }, product: { code, product_name: 'Préparation végétale — exemple synthétique', brands: 'Marque de démonstration', quantity: 'Sachet de 1 kg (déclaré)', allergens_tags: ['en:soybeans'], nutrition_data_per: '100g', nutriments: { 'energy-kj_100g': 400, fat_100g: 2, carbohydrates_100g: 15, proteins_100g: 4, salt_100g: 0.2 } } });
export class OffLookup {
  private readonly cache = new Map<string, { until: number; result: ProductLookup }>();
  private readonly pending = new Map<string, Promise<ProductLookup>>();
  private requests: number[] = [];
  private backoffUntil = 0;
  constructor(private readonly config: Pick<RuntimeConfig, 'offMode' | 'offUserAgent' | 'offTimeoutMs' | 'offCacheSeconds'>, private readonly request: typeof fetch = fetch, private readonly clock: () => Date = () => new Date()) {}
  async lookup(input: unknown): Promise<ProductLookup> {
    const code = productBarcode(input);
    const now = this.clock();
    if (this.config.offMode === 'disabled') return unavailable(code, 'disabled');
    if (this.config.offMode === 'fixture') {
      if (code === '9999999999999') return unavailable(code, 'fixture_outage');
      if (code.replace(/^0+/, '') === '12345678905') return mapOffResponse(code, complete(code), now, true);
      if (code.replace(/^0+/, '') === '123') return mapOffResponse(code, { status: 'success', result: { id: 'product_found' }, product: { code, product_name: 'Référence incomplète — exemple synthétique' } }, now, true);
      return mapOffResponse(code, { result: { id: 'product_not_found' } }, now, true);
    }
    const cached = this.cache.get(code);
    if (cached && cached.until > now.getTime()) return structuredClone({ ...cached.result, source: { ...cached.result.source!, cached: true } });
    const pending = this.pending.get(code);
    if (pending) return structuredClone(await pending);
    this.requests = this.requests.filter(time => time > now.getTime() - 60000);
    if (this.backoffUntil > now.getTime()) return unavailable(code, 'rate_limited', Math.min(2147483647, Math.ceil((this.backoffUntil - now.getTime()) / 1000)));
    if (this.requests.length >= 10) return unavailable(code, 'rate_limited', Math.max(1, Math.ceil((this.requests[0]! + 60000 - now.getTime()) / 1000)));
    this.requests.push(now.getTime());
    const job = this.remote(code);
    this.pending.set(code, job);
    try { return structuredClone(await job); } finally { this.pending.delete(code); }
  }
  private async remote(code: string): Promise<ProductLookup> {
    try {
      const url = new URL(API + code); url.searchParams.set('fields', FIELDS);
      const response = await this.request(url, { method: 'GET', redirect: 'error', headers: { 'user-agent': this.config.offUserAgent!, accept: 'application/json' }, signal: AbortSignal.timeout(this.config.offTimeoutMs) });
      if (response.status === 429) {
        const retry = response.headers.get('retry-after');
        const seconds = Number(retry);
        const dateSeconds = retry ? Math.ceil((Date.parse(retry) - this.clock().getTime()) / 1000) : NaN;
        const requestedWait = Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : Number.isFinite(dateSeconds) && dateSeconds > 0 ? dateSeconds : 60;
        const wait = Math.min(requestedWait, 2147483647);
        this.backoffUntil = this.clock().getTime() + wait * 1000;
        return unavailable(code, 'rate_limited', wait);
      }
      if (!response.ok && response.status !== 404) return unavailable(code, 'provider_error');
      // Bound public source responses; do not forward arbitrary provider bodies/URLs or images.
      const reader = response.body?.getReader();
      if (!reader) return unavailable(code, 'invalid_response');
      let length = 0; const chunks: Uint8Array[] = [];
      try { while (true) { const part = await reader.read(); if (part.done) break; length += part.value.length; if (length > 256000) { await reader.cancel(); return unavailable(code, 'invalid_response'); } chunks.push(part.value); } } finally { reader.releaseLock(); }
      const buffer = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
      const body: unknown = JSON.parse(new TextDecoder().decode(buffer));
      if (response.status === 404 && record(record(body)['result'])['id'] !== 'product_not_found') return unavailable(code, 'invalid_response');
      const result = mapOffResponse(code, body, this.clock(), false);
      if (result.state !== 'unavailable') { if (this.cache.size >= 200) this.cache.delete(this.cache.keys().next().value!); this.cache.set(code, { until: this.clock().getTime() + this.config.offCacheSeconds * 1000, result: structuredClone(result) }); }
      return result;
    } catch (error) { return unavailable(code, error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name) ? 'timeout' : 'provider_error'); }
  }
}
