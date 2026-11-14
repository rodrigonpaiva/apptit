import type { EvidenceView, LabelReview, ReceiptLineDraft } from '@apptit/contracts';
import { invalid, object, text, uuid } from '@apptit/domain-values';
const nullable = (value: unknown, field: string, max = 100) => value === null ? null : text(value, field, max);
function date(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) invalid('labelReview', 'INVALID_DATE', 'An exact calendar date is required.');
  return value;
}
function kind(value: unknown): 'use_by' | 'best_before' {
  if (value !== 'use_by' && value !== 'best_before') invalid('labelReview', 'INVALID_DATE_KIND', 'Date type must be reviewed.'); return value;
}
export function labelReview(input: unknown): LabelReview {
  const value = object(input, ['schemaVersion', 'evidenceId', 'imageSha256', 'engine', 'extractedAt', 'proposed', 'batch', 'expiry'], 'labelReview');
  if (value['schemaVersion'] !== 1 || value['engine'] !== 'tesseract.js@7.0.0/fra@1.0.0' || typeof value['imageSha256'] !== 'string' || !/^[a-f0-9]{64}$/.test(value['imageSha256']) || typeof value['extractedAt'] !== 'string' || value['extractedAt'].length > 40 || !/^\d{4}-\d{2}-\d{2}T/.test(value['extractedAt']) || !Number.isFinite(Date.parse(value['extractedAt']))) invalid('labelReview', 'INVALID_PROVENANCE', 'Bounded image and engine provenance is required.');
  const proposed = object(value['proposed'], ['batch', 'expiry', 'expiryKind'], 'labelReview.proposed');
  const expiry = value['expiry'] === null ? null : object(value['expiry'], ['date', 'kind'], 'labelReview.expiry');
  const batch = nullable(value['batch'], 'labelReview.batch');
  if (!batch && !expiry) invalid('labelReview', 'REVIEW_REQUIRED', 'Select at least one reviewed field.');
  return { schemaVersion: 1, evidenceId: uuid(value['evidenceId'], 'labelReview.evidenceId'), imageSha256: value['imageSha256'], engine: value['engine'], extractedAt: value['extractedAt'], proposed: { batch: nullable(proposed['batch'], 'labelReview.proposed.batch'), expiry: proposed['expiry'] === null ? null : date(proposed['expiry']), expiryKind: proposed['expiryKind'] === null ? null : kind(proposed['expiryKind']) }, batch, expiry: expiry ? { date: date(expiry['date']), kind: kind(expiry['kind']) } : null };
}
export function reviewMatchesLine(review: LabelReview, line: ReceiptLineDraft, evidence: EvidenceView | undefined) {
  if (!evidence || evidence.state !== 'available' || evidence.readability.state === 'unreadable' || evidence.declared.sha256 !== review.imageSha256 || evidence.links.lineId !== line.id || evidence.links.batchId !== line.batch.id || evidence.links.productId !== line.product.productId || evidence.links.presentationId !== line.product.presentationId) return false;
  if (review.batch && (line.batch.code.state !== 'known' || line.batch.code.value !== review.batch)) return false;
  if (review.expiry && (line.batch.expiry.state !== 'known' || line.batch.expiry.value.date !== review.expiry.date || line.batch.expiry.value.kind !== review.expiry.kind)) return false;
  return true;
}
