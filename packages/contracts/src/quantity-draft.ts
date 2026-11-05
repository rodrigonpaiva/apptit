export type Decimal = string;
export type LocalDate = string;
export type Instant = string;
export type Unit = 'g' | 'ml' | 'each';
export type QuantityBasis = 'as_received' | 'raw_net' | 'prepared';
export type DataQuality = 'measured' | 'estimated' | 'imported';
export type Datum<T> =
  | { state: 'unknown'; reason: string }
  | { state: 'known'; value: T; quality: DataQuality; sourceRef: string };
export interface Quantity { amount: Decimal; unit: Unit; basis: QuantityBasis; resolution: Decimal }
export interface Expiry {
  kind: 'use_by' | 'best_before' | 'after_opening';
  date: LocalDate;
  sourceRef: string;
  procedureVersion?: string;
}
export interface QuantityDraftData {
  label: string;
  quantity: Datum<Quantity>;
  expiry: Datum<Expiry>;
  observedAt: Datum<Instant>;
}
export interface Scope { tenantId: string; siteId: string }
export interface ActorSnapshot { userId: string; nameAtAction: string }
/** Internal trust boundary. Never deserialize this from client input as proof of identity.
 * The online Identity/session adapter supplies it in SP1-04. No write route exists yet. */
export interface TrustedActorContext {
  actor: ActorSnapshot;
  scope: Scope;
  siteTimeZone: string;
  sessionId: string;
  capabilities: readonly ('quantity-draft.read' | 'quantity-draft.write')[];
  correlationId: string;
}
export interface VersionedQuantityDraft {
  id: string;
  scope: Scope;
  siteTimeZone: string;
  version: number;
  data: QuantityDraftData;
  createdBy: ActorSnapshot;
  updatedBy: ActorSnapshot;
  createdAt: Instant;
  updatedAt: Instant;
}
export interface QuantityDraftRevision {
  draftId: string;
  scope: Scope;
  version: number;
  actor: ActorSnapshot;
  sessionId: string;
  correlationId: string;
  recordedAt: Instant;
  before: VersionedQuantityDraft | null;
  after: VersionedQuantityDraft;
}
export interface ValidationIssue { field: string; code: string; message: string }
export type ApplicationErrorCode = 'INVALID_INPUT' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VERSION_CONFLICT' | 'DEPENDENCY_UNAVAILABLE' | 'INTERNAL_ERROR';
export interface ApplicationError {
  code: ApplicationErrorCode;
  message: string;
  retry: 'after_review' | 'after_reauthentication' | 'same_operation' | 'never';
  issues: ValidationIssue[];
}
export type Result<T> = { ok: true; value: T } | { ok: false; error: ApplicationError };
export interface SaveQuantityDraft {
  id: string;
  scope: Scope;
  expectedVersion: number;
  data: QuantityDraftData;
}
