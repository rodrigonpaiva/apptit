/** Compile-only SP2-01 examples/proofs. No handler, persistence or stock effect. */
import type { EvidenceMetadata, OperationKey, ReceiptLedgerEntry, ReceiptPostingResult, ReceivingOperationOutcome } from '../../../packages/contracts/src/index.js';
export const key: OperationKey = {
  action: 'receipt.confirm', operationId: '50000000-0000-4000-8000-000000000012', actorId: '50000000-0000-4000-8000-000000000011',
  scope: { tenantId: '50000000-0000-4000-8000-000000000004', siteId: '50000000-0000-4000-8000-000000000005' },
};
export const futureOutcomes: ReceivingOperationOutcome<ReceiptPostingResult>[] = [
  { state: 'not_found', operationId: key.operationId },
  { state: 'processing', operationId: key.operationId, claimedAt: '2026-11-05T12:00:00.000Z' },
  { state: 'completed', operationId: key.operationId, committedAt: '2026-11-05T12:00:01.000Z', result: { receiptId: '50000000-0000-4000-8000-000000000006', version: 2, entryIds: [] } },
  { state: 'rejected', operationId: key.operationId, recordedAt: '2026-11-05T12:00:00.000Z', error: { code: 'VERSION_CONFLICT', message: 'Reload and review the receipt.', retry: 'after_review', issues: [] } },
];
// Deliberately never called: compile-time negative tests for contract immutability/state narrowing.
function immutableAndStateProof(entry: ReceiptLedgerEntry, evidence: EvidenceMetadata): void {
  // @ts-expect-error Posted entry quantities cannot be edited.
  entry.quantity.amount = '1';
  // @ts-expect-error Original actor attribution cannot be edited.
  entry.actor.userId = key.actorId;
  // @ts-expect-error Rejected/pending amounts are not receipt ledger credits.
  const pendingKind: ReceiptLedgerEntry['kind'] = 'receipt.pending';
  void pendingKind;
  if (evidence.state === 'upload_pending') {
    // @ts-expect-error Declared content is not a verified stored object.
    const available: Extract<EvidenceMetadata, { state: 'available' }> = evidence;
    void available;
  }
}
void immutableAndStateProof;
