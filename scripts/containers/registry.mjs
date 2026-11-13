import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
const mediaTypes = 'application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.docker.distribution.manifest.v2+json';
const denied = (status, body) => [401, 403].includes(status) && body?.errors?.some(error => ['DENIED', 'UNAUTHORIZED'].includes(error.code));
/** Read-only GHCR proof. No credentials or bearer tokens are serialized in reports. */
export function registryInspector(metadata, token, fetcher = fetch) {
  if (!token || !/^[a-z0-9-]+$/.test(metadata.owner) || !/^[A-Za-z0-9_.-]{1,100}$/.test(metadata.tag)) throw new Error('Invalid registry verification context');
  return async kind => {
    if (!['api', 'web'].includes(kind)) throw new Error('Invalid package');
    const name = `${metadata.owner}/apptit-${kind}`;
    async function exchange(authenticated) {
      const url = new URL('https://ghcr.io/token'); url.searchParams.set('service', 'ghcr.io'); url.searchParams.set('scope', `repository:${name}:${authenticated ? 'pull,push' : 'pull'}`);
      if (authenticated) url.searchParams.set('account', metadata.owner);
      const response = await fetcher(url, { redirect: 'error', headers: { accept: 'application/json', ...(authenticated ? { authorization: 'Basic ' + Buffer.from(metadata.owner + ':' + token).toString('base64') } : {}) }, signal: AbortSignal.timeout(20000) });
      const body = await response.json().catch(() => ({}));
      if (!authenticated && denied(response.status, body)) return null;
      if (!response.ok || typeof body.token !== 'string' || !body.token) throw new Error(`GHCR ${authenticated ? 'authenticated' : 'anonymous'} token verification failed (${response.status})`);
      return body.token;
    }
    async function manifest(bearer, authenticated) {
      const response = await fetcher(`https://ghcr.io/v2/${name}/manifests/${metadata.tag}`, { redirect: 'error', headers: { authorization: `Bearer ${bearer}`, accept: mediaTypes }, signal: AbortSignal.timeout(20000) });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (authenticated && response.status === 404 && body?.errors?.some(error => ['MANIFEST_UNKNOWN', 'NAME_UNKNOWN'].includes(error.code))) return null;
        if (!authenticated && denied(response.status, body)) return { denied: true };
        throw new Error(`GHCR manifest verification failed (${response.status})`);
      }
      const bytes = Buffer.from(await response.arrayBuffer()); const digest = 'sha256:' + createHash('sha256').update(bytes).digest('hex');
      const advertised = response.headers.get('docker-content-digest'); if (advertised && advertised !== digest) throw new Error('GHCR manifest digest does not match returned bytes');
      return { digest };
    }
    async function tags(bearer, authenticated) {
      const response = await fetcher(`https://ghcr.io/v2/${name}/tags/list?n=1`, { redirect: 'error', headers: { authorization: `Bearer ${bearer}`, accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
      const body = await response.json().catch(() => ({}));
      if (authenticated && response.status === 404 && body?.errors?.some(error => ['NAME_UNKNOWN', 'MANIFEST_UNKNOWN'].includes(error.code))) return null;
      if (!authenticated && denied(response.status, body)) return { denied: true };
      if (!response.ok || !Array.isArray(body.tags)) throw new Error(`GHCR package verification failed (${response.status})`);
      return { readable: true };
    }
    const bearer = await exchange(true); const authenticated = await manifest(bearer, true);
    // A new release tag may be absent inside an already-public package. Check the package before any push.
    if (!authenticated && !await tags(bearer, true)) return { exists: false, packageExists: false, existingDigest: null };
    const anonymousToken = await exchange(false);
    const anonymous = anonymousToken ? await (authenticated ? manifest(anonymousToken, false) : tags(anonymousToken, false)) : { denied: true };
    const result = { exists: Boolean(authenticated), packageExists: true, existingDigest: authenticated?.digest ?? null };
    if (!anonymous.denied) return { ...result, visibility: 'public', verification: 'anonymous-registry-readable' };
    // Personal packages support public/private visibility. Organization internal/private needs REST distinction.
    return { ...result, visibility: metadata.ownerType === 'User' ? 'private' : 'restricted', verification: 'authenticated-registry-and-anonymous-denial' };
  };
}
