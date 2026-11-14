import type { ScopedProductLookup, SiteAccess } from '@apptit/contracts';
export async function identifyProduct(site: SiteAccess, barcode: string, signal: AbortSignal): Promise<ScopedProductLookup> {
  const response = await fetch('/api/graphql', { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal,
    headers: { 'content-type': 'application/json' }, body: JSON.stringify({
      query: 'query Identify($input: ProductLookupInput!) { productLookup(input: $input) { state barcode reason missing retryAfterSeconds source { provider apiVersion url retrievedAt sourceUpdatedAt cached synthetic reviewState } product { imageUrl name { state value reason } brands { state value reason } presentation { state value reason } allergens { state value reason } nutrition { state value reason } } localCandidates { id name presentation barcode imageUrl } } }',
      variables: { input: { scope: { tenantId: site.tenantId, siteId: site.siteId }, barcode } },
    }) });
  if (!response.ok) throw new Error('UNAVAILABLE');
  const body = await response.json() as { data?: { productLookup?: ScopedProductLookup }; errors?: { extensions?: { code?: string } }[] };
  if (body.errors?.length || !body.data?.productLookup) throw new Error(body.errors?.[0]?.extensions?.code ?? 'UNAVAILABLE');
  return body.data.productLookup;
}
