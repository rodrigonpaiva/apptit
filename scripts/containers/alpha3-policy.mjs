/** Bounded alpha.3 acceptance and explicit owner authorization; defaults remain private. */
export function alpha3Acceptance(value) {
  const extensions = ['EXT-LOCAL-COMPOSE','EXT-OFF-LIVE','EXT-LABEL-OCR','EXT-RECEIVING-PHOTOS-STORAGE','EXT-STORAGE-DELETE-LAYOUT','EXT-PERSISTENT-PRODUCT-IDENTITY'];
  if (value.schemaVersion !== 1 || value.releaseTag !== 'v0.1.0-alpha.3' || value.status !== 'passed' || value.scope !== 'synthetic-receiving' || value.stockEnabled !== false || !/^[a-f0-9]{40}$/.test(value.validatedSourceCommit ?? '') || value.baseAcceptance !== 'docs/delivery/sprint-2-acceptance.json' || value.evidence !== 'docs/delivery/RELEASE-ALPHA3-ACCEPTANCE.md' || !extensions.every(id => value.extensions?.includes(id))) throw new Error('alpha.3 requires its own verified receiving-extension acceptance');
}
export function approvedAlpha3Publication(metadata, approval, acceptance, build) {
  if (metadata.tag !== 'v0.1.0-alpha.3' || metadata.ownerType !== 'User' || metadata.owner !== 'rodrigonpaiva' || metadata.repository !== 'rodrigonpaiva/apptit') return false;
  if (!approval || approval.schemaVersion !== 1 || approval.action !== 'publish-new-public-images' || approval.tag !== metadata.tag || approval.repository !== metadata.repository || approval.visibility !== 'public' || approval.platform !== 'linux/amd64' || approval.validatedSourceCommit !== acceptance?.validatedSourceCommit) return false;
  const names = ['ghcr.io/rodrigonpaiva/apptit-api','ghcr.io/rodrigonpaiva/apptit-web'];
  if (!Array.isArray(approval.packages) || approval.packages.length !== 2 || !names.every(name => approval.packages.includes(name))) return false;
  try { alpha3Acceptance(acceptance); } catch { return false; }
  return ['api','web'].every(kind => build.images?.[kind]?.platform === approval.platform);
}
