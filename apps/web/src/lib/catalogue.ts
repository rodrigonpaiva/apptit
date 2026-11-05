import type { CataloguePage, SiteAccess } from '@apptit/contracts';
export async function readCatalogue(site: SiteAccess, signal: AbortSignal): Promise<CataloguePage> {
  const response = await fetch('/api/graphql', { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal,
    headers: { 'content-type': 'application/json' }, body: JSON.stringify({
      query: 'query Catalogue($input: SiteScopeInput!) { catalogue(input: $input) { items { id name presentation barcode } hasMore } }',
      variables: { input: { tenantId: site.tenantId, siteId: site.siteId } },
    }) });
  if (!response.ok) throw new Error('UNAVAILABLE');
  const body = await response.json() as { data?: { catalogue?: CataloguePage }; errors?: { extensions?: { code?: string } }[] };
  if (body.errors?.length || !body.data?.catalogue) throw new Error(body.errors?.[0]?.extensions?.code ?? 'UNAVAILABLE');
  return body.data.catalogue;
}
