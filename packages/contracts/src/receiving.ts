import type { ActorSnapshot, ApplicationError, Datum, Decimal, Expiry, Instant, Quantity, Scope } from './quantity-draft.js';

/** SP2-01 receiving types; SP2-03 adds draft-only persistence. Stock/evidence ports remain future contracts. */
export interface ReceiptProductIdentity {
  productId: string;
  presentationId: string;
  presentationVersion: number;
}
export interface ReceivedBatchDraft {
  id: string;
  code: Datum<string>;
  expiry: Datum<Expiry>;
}
export interface ReceiptDisposition {
  accepted: Quantity;
  rejected: Quantity;
  quarantined: Quantity;
  pending: Quantity;
}
export interface ReceiptLineDraft {
  id: string;
  product: ReceiptProductIdentity;
  batch: ReceivedBatchDraft;
  received: Datum<Quantity>;
  disposition: Datum<ReceiptDisposition>;
  destinationLocationId: Datum<string>;
  evidenceIds: string[];
}
export interface ReceiptDraftData {
  supplierReference: Datum<string>;
  receivedAt: Datum<Instant>;
  lines: ReceiptLineDraft[];
}
export interface SaveReceiptDraft {
  schemaVersion: 1;
  operationId: string;
  scope: Scope;
  receiptId: string;
  expectedVersion: number;
  payload: ReceiptDraftData;
}
export interface ReceiptDraftSnapshot {
  id: string;
  scope: Scope;
  version: number;
  state: 'draft';
  data: ReceiptDraftData;
  createdBy: ActorSnapshot;
  updatedBy: ActorSnapshot;
  recordedAt: Instant;
}
export type ReceiptReconciliation =
  | { state: 'balanced'; total: Quantity }
  | { state: 'incomplete'; missing: ('received' | 'disposition')[] };
export interface CheckedPackConversion {
  id: string;
  version: number;
  product: ReceiptProductIdentity;
  factor: Decimal;
  toUnit: Quantity['unit'];
  basis: 'as_received';
  sourceRef: string;
  reviewedBy: ActorSnapshot;
  reviewedAt: Instant;
}
export interface PackConversionPreview {
  state: 'preview';
  quantity: Quantity;
  provenance: {
    packCount: Decimal;
    packUnit: 'pack';
    conversion: CheckedPackConversion;
    method: 'checked_pack_scaling';
  };
}
export type ReceivingCapability = 'receipt.draft.read' | 'receipt.draft.write' | 'receipt.confirm' | 'receipt.disposition' | 'evidence.read' | 'evidence.write';
/** Future authenticated adapter must build this afresh; a client-shaped object is not authority. */
export interface ReceivingAuthorization {
  scope: Scope;
  actor: ActorSnapshot;
  sessionId: string;
  capability: ReceivingCapability;
  membershipVersion: number;
  authorizedAt: Instant;
  correlationId: string;
}
export interface ReceivingError extends Omit<ApplicationError, 'code'> {
  code: ApplicationError['code'] | 'IDEMPOTENCY_MISMATCH' | 'OUTCOME_UNCERTAIN' | 'CAPABILITY_DISABLED' | 'INCOMPLETE_DATA';
}
export type ReceivingResult<T> = { ok: true; value: T } | { ok: false; error: ReceivingError };
export interface OperationKey {
  scope: Scope;
  actorId: string;
  action: 'receipt.draft.save' | 'receipt.confirm';
  operationId: string;
}
/** A registry adapter will SHA-256 UTF-8 canonicalIntent and persist it transactionally. */
export interface OperationIdentity { key: OperationKey; canonicalIntent: string }
export type ReceivingOperationOutcome<T> =
  | { state: 'not_found'; operationId: string }
  | { state: 'processing'; operationId: string; claimedAt: Instant }
  | { state: 'completed'; operationId: string; result: T; committedAt: Instant }
  | { state: 'rejected'; operationId: string; error: ReceivingError; recordedAt: Instant };
export interface ConfirmReceipt {
  schemaVersion: 1;
  operationId: string;
  scope: Scope;
  receiptId: string;
  expectedVersion: number;
  payload: { lines: { lineId: string; batchId: string; disposition: ReceiptDisposition }[] };
}
/** Immutable future entry shape, not an executable stock command or current inventory. */
export interface ReceiptLedgerEntry {
  readonly id: string;
  readonly scope: Readonly<Scope>;
  readonly operationId: string;
  readonly receiptId: string;
  readonly lineId: string;
  readonly batchId: string;
  readonly product: Readonly<ReceiptProductIdentity>;
  readonly locationId: string;
  readonly kind: 'receipt.accepted' | 'receipt.quarantined';
  readonly direction: 'credit';
  readonly quantity: Readonly<Quantity>;
  readonly actor: Readonly<ActorSnapshot>;
  readonly recordedAt: Instant;
}
export interface ReceiptPostingResult { receiptId: string; version: number; entryIds: readonly string[] }
/** Ports only: implementation, online capability grants and persistence are later packages. */
export interface ReceiptDraftPort {
  save(command: SaveReceiptDraft, auth: ReceivingAuthorization): Promise<ReceivingResult<ReceiptDraftSnapshot>>;
  find(receiptId: string, scope: Scope, auth: ReceivingAuthorization): Promise<ReceivingResult<ReceiptDraftSnapshot>>;
  outcome(key: OperationKey & { action: 'receipt.draft.save' }, auth: ReceivingAuthorization): Promise<ReceivingResult<ReceivingOperationOutcome<ReceiptDraftSnapshot>>>;
}
export interface ReceiptStockPort {
  confirm(command: ConfirmReceipt, auth: ReceivingAuthorization): Promise<ReceivingResult<ReceiptPostingResult>>;
  outcome(key: OperationKey & { action: 'receipt.confirm' }, auth: ReceivingAuthorization): Promise<ReceivingResult<ReceivingOperationOutcome<ReceiptPostingResult>>>;
}
