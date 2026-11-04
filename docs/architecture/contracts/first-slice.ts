/** SP1-01 design contracts only. Runtime parsers and adapters belong to later packages. */
export type Id = string; // UUID; validate at the transport boundary.
export type Decimal = string; // Canonical exact base-10; see ADR-0002.
export type Instant = string; // RFC3339 UTC, ending in Z.
export type LocalDate = string; // Valid YYYY-MM-DD, not a UTC instant.
export type Unit = 'g' | 'ml' | 'each';
export type Basis = 'as_received' | 'raw_net' | 'prepared';
export type KnownQuality = 'measured' | 'estimated' | 'imported';
export type Datum<T> =
  | { state: 'unknown'; reason: string }
  | { state: 'known'; value: T; quality: KnownQuality; sourceRef: string };
export interface Quantity {
  amount: Decimal;
  unit: Unit;
  basis: Basis;
  resolution: Decimal;
}
export interface Conversion {
  id: Id;
  version: number;
  from: { unit: string; basis: Basis };
  to: { unit: Unit; basis: Basis };
  factor: Decimal;
  sourceRef: string;
  reviewedBy: Id;
}
export interface Expiry {
  kind: 'use_by' | 'best_before' | 'after_opening';
  date: LocalDate;
  sourceRef: string;
  procedureVersion?: string;
}
export interface Scope { tenantId: Id; siteId: Id }
export type Capability =
  | 'catalogue.read'
  | 'receipt.draft.write'
  | 'receipt.confirm'
  | 'receipt.disposition'
  | 'inventory.read'
  | 'inventory.transfer'
  | 'evidence.read'
  | 'evidence.write';
/** INTERNAL ONLY: constructed after online Identity authorization, never client authority. */
export interface AuthorizationContext {
  scope: Scope;
  actor: { userId: Id; nameAtAction: string };
  sessionId: Id;
  capability: Capability;
  authorizedAt: Instant;
  membershipVersion: number;
  correlationId: Id;
}
export interface Command<T> {
  schemaVersion: 1;
  operationId: Id;
  scope: Scope;
  expectedVersion: number;
  payload: T;
}
export type ErrorCode =
  | 'INVALID_INPUT' | 'UNAUTHENTICATED' | 'SESSION_EXPIRED' | 'SESSION_REVOKED'
  | 'FORBIDDEN' | 'NOT_FOUND' | 'VERSION_CONFLICT' | 'IDEMPOTENCY_MISMATCH'
  | 'INSUFFICIENT_STOCK' | 'INELIGIBLE_BATCH' | 'INCOMPLETE_DATA'
  | 'CAPABILITY_DISABLED' | 'DEPENDENCY_UNAVAILABLE' | 'OUTCOME_UNCERTAIN'
  | 'INTERNAL_ERROR';
export interface DomainError {
  code: ErrorCode;
  message: string; // Safe public text; no SQL, stack, token or unrelated resource.
  retry: 'never' | 'same_operation' | 'after_reauthentication' | 'after_review';
  correlationId: Id;
  field?: string;
}
export type Result<T> = { ok: true; value: T } | { ok: false; error: DomainError };
export type OperationOutcome<T> =
  | { state: 'not_found'; operationId: Id }
  | { state: 'processing'; operationId: Id }
  | { state: 'completed'; operationId: Id; result: T; committedAt: Instant }
  | { state: 'rejected'; operationId: Id; error: DomainError };
export interface AuditStamp {
  scope: Scope;
  actor: { userId: Id; nameAtAction: string };
  recordedAt: Instant;
  observedAt: Datum<Instant>;
  operationId: Id;
  correlationId: Id;
  version: number;
}
export interface EventEnvelope<T> {
  schemaVersion: 1;
  eventId: Id;
  eventType: string;
  scope: Scope;
  aggregate: { type: string; id: Id; version: number };
  actor: { userId: Id; nameAtAction: string };
  operationId: Id;
  correlationId: Id;
  occurredAt: Instant;
  payload: T;
}
export interface ProductReference {
  id: Id;
  scope: Scope;
  version: number;
  name: string;
  barcode: Datum<string>; // Leading zeros survive; absent bulk GTIN is not an error.
  origin: 'synthetic' | 'local_reviewed' | 'external';
}
export interface ProductListQuery {
  scope: Scope;
  first: number;
  after?: string;
}
export interface ProductPage { items: ProductReference[]; nextCursor: string | null }
export interface CataloguePort {
  list(query: ProductListQuery, auth: AuthorizationContext): Promise<Result<ProductPage>>;
}
export interface AuthorizeRequest {
  sessionSecret: string; // Internal channel only; never persist/log this DTO.
  scope: Scope;
  capability: Capability;
  correlationId: Id;
}
export interface IdentityPort {
  authorize(request: AuthorizeRequest): Promise<Result<AuthorizationContext>>;
}
export interface ReceiptLineDraft {
  id: Id;
  productId: Id;
  presentationVersion: number;
  batchCode: Datum<string>;
  expiry: Datum<Expiry>;
  delivered: Quantity;
  destinationLocationId: Id;
  evidenceIds: Id[];
}
export interface ReceiptDraft {
  id: Id;
  scope: Scope;
  version: number;
  lines: ReceiptLineDraft[];
  state: 'draft';
}
export interface ReceiptAllocation {
  lineId: Id;
  accepted: Quantity;
  rejected: Quantity;
  quarantined: Quantity;
  pending: Quantity;
  dispositionVersion: number;
}
export interface ConfirmReceipt {
  receiptId: Id;
  allocations: ReceiptAllocation[];
}
export interface TransferStock {
  batchId: Id;
  sourceLocationId: Id;
  destinationLocationId: Id;
  quantity: Quantity;
  reason: string;
}
export interface StockOperationResult {
  movementIds: Id[];
  aggregateId: Id;
  version: number;
}
/** Future implementation: not enabled by SP1-01 or the SP1 private read slice. */
export interface StockCommandPort {
  confirmReceipt(command: Command<ConfirmReceipt>, auth: AuthorizationContext): Promise<Result<StockOperationResult>>;
  transfer(command: Command<TransferStock>, auth: AuthorizationContext): Promise<Result<StockOperationResult>>;
  outcome(scope: Scope, action: 'receipt.confirm' | 'inventory.transfer', operationId: Id,
    auth: AuthorizationContext): Promise<Result<OperationOutcome<StockOperationResult>>>;
}
export interface ExternalProductSnapshot {
  barcode: string;
  name: Datum<string>;
  allergens: Datum<string[]>;
  source: { provider: 'open_food_facts'; recordRef: string; retrievedAt: Instant; synthetic: boolean };
}
export type LookupResult =
  | { state: 'found'; snapshot: ExternalProductSnapshot }
  | { state: 'incomplete'; snapshot: ExternalProductSnapshot; missing: string[] }
  | { state: 'absent'; barcode: string }
  | { state: 'unavailable'; reason: 'disabled' | 'timeout' | 'rate_limited' | 'provider_error' };
export interface ProductLookupPort { lookup(barcode: string): Promise<LookupResult> }
export type AdapterMode = 'disabled' | 'fixture' | 'live';
export interface EvidenceMetadata {
  id: Id;
  scope: Scope;
  state: 'upload_pending' | 'available' | 'failed';
  authorId: Id;
  recordedAt: Instant;
  capturedAt: Datum<Instant>;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  originalFilename: string;
  receiptId: Id;
  productId?: Id;
  batchId?: Id;
  synthetic: boolean;
  hold: boolean;
}
export interface LocalDraftEnvelope<T> {
  schemaVersion: 1;
  draftId: Id;
  operationId: Id;
  scope: Scope;
  originalAuthorId: Id;
  deviceId: Id;
  observedAt: Datum<Instant>;
  savedLocallyAt: Instant;
  baseVersion: number;
  payload: T;
}
export type DraftSaveState =
  | { state: 'unsaved' }
  | { state: 'saved_locally'; draftId: Id; savedLocallyAt: Instant }
  | { state: 'server_pending'; operationId: Id }
  | { state: 'server_saved'; id: Id; version: number; recordedAt: Instant }
  | { state: 'review_required'; error: DomainError };
