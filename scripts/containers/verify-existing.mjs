import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveRelease, verifySource, validatedPair } from './release.mjs';
import { registryInspector } from './registry.mjs';
import { saveReport } from './tooling.mjs';

export function originalProof(metadata, kind, approval, receipt) {
  if (approval.schemaVersion !== 1 || approval.action !== 'retain-existing-public-digests-only' || ['tag', 'revision', 'repository'].some(key => approval[key] !== metadata[key] || receipt.metadata[key] !== metadata[key])) throw new Error('Approval/source identity mismatch');
  validatedPair(metadata, receipt.build, receipt.validation);
  const approved = approval.images[kind], published = receipt.publication.published?.[kind];
  if (!approved || approved.visibility !== 'public' || !Number.isSafeInteger(approved.runId) || approved.runId !== receipt.runId || !published || published.retainedFromRun || receipt.publication.tag !== metadata.tag || receipt.publication.revision !== metadata.revision || published.reference !== `ghcr.io/${metadata.owner}/apptit-${kind}:${metadata.tag}` || approved.reference !== published.reference || approved.digest !== published.digest || !/^sha256:[a-f0-9]{64}$/.test(published.digest) || receipt.build.images[kind].platform !== 'linux/amd64') throw new Error('Exact original publication proof is required');
  return { reference: approved.reference, digest: approved.digest, visibility: 'public', retainedFromRun: approved.runId, platform: 'linux/amd64' };
}

export async function verifyExisting({ metadata, source, approval, receipts, inspectRegistry, reportFile, request, execute, summary }) {
  const report = { tag: metadata.tag, revision: metadata.revision, action: 'verify-without-push', status: 'verifying', published: {}, freshBuildExecuted: false, freshInitializationExecuted: false, publicationPartial: false };
  try {
    await verifySource(source, metadata, execute);
    const current = await resolveRelease(metadata.tag, metadata.repository, request);
    if (current.revision !== metadata.revision) throw new Error('Release tag moved');
    for (const kind of ['api', 'web']) report.published[kind] = originalProof(metadata, kind, approval, receipts[kind]);
    // Two reads detect drift during verification. This module has no Docker or registry write operation.
    for (let pass = 0; pass < 2; pass++) for (const kind of ['api', 'web']) {
      const actual = await inspectRegistry(kind), expected = report.published[kind];
      if (!actual.exists || actual.existingDigest !== expected.digest || actual.visibility !== expected.visibility) throw new Error(`Registry digest/visibility changed for ${kind}`);
      expected.verification = actual.verification;
      expected.ownerApprovedPublicRetention = true;
    }
    report.finalRegistryVerified = true; report.status = 'verified-existing'; return report;
  } catch (error) { report.status = 'failed'; report.error = error.message; throw error; }
  finally {
    await saveReport(reportFile, report);
    if (summary) await fs.appendFile(summary, `\nExisting image verification: **${report.status}**. No build, startup or image push executed; original paired build/startup evidence is retained.\n` + Object.values(report.published).map(item => `- ${item.reference} @ ${item.digest}; ${item.visibility}; original run ${item.retainedFromRun}\n`).join(''));
  }
}

export async function recordedProofs() {
  const root = new URL('../../docs/evidence/ghcr/', import.meta.url), receipts = {};
  for (const [kind, folder] of Object.entries({ api: 'alpha2-first-attempt', web: 'alpha2-recovery-attempt' })) {
    receipts[kind] = { runId: kind === 'api' ? 43417110222 : 43426740932 };
    for (const [key, file] of Object.entries({ metadata: 'release-metadata.json', build: 'images.json', validation: 'validation.json', publication: 'publication.json' })) receipts[kind][key] = JSON.parse(await fs.readFile(new URL(`${folder}/${file}`, root), 'utf8'));
  }
  const approval = JSON.parse(await fs.readFile(new URL('alpha2-recovery-attempt/public-retention-approval.json', root), 'utf8'));
  return { approval, receipts };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const metadata = JSON.parse(await fs.readFile(process.env.RELEASE_METADATA, 'utf8'));
    await verifyExisting({ metadata, source: process.env.RELEASE_SOURCE, ...await recordedProofs(), inspectRegistry: registryInspector(metadata, process.env.GITHUB_TOKEN), reportFile: process.env.PUBLICATION_REPORT, summary: process.env.GITHUB_STEP_SUMMARY });
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
