import type { ActorSnapshot, Datum, Instant, Scope } from './quantity-draft.js';
import type { ReceivingAuthorization, ReceivingResult } from './receiving.js';
export interface EvidenceLinks {
  receiptId: string;
  lineId: string;
  productId: string;
  presentationId: string;
  batchId: string;
}
export interface EvidenceDeclaredContent {
  mediaType: string;
  sizeBytes: number;
  sha256: string;
}
export interface EvidenceUploadIntent {
  uploadId: string;
  scope: Scope;
  links: EvidenceLinks;
  originalFilename: string;
  capturedAt: Datum<Instant>;
  declared: EvidenceDeclaredContent;
}
interface EvidenceBase {
  readonly id: string;
  readonly scope: Readonly<Scope>;
  readonly links: Readonly<EvidenceLinks>;
  readonly author: Readonly<ActorSnapshot>;
  readonly recordedAt: Instant;
  readonly capturedAt: Readonly<Datum<Instant>>;
  readonly originalFilename: string;
  readonly synthetic: boolean;
  readonly hold: boolean;
}
/** Pending declarations are not measured durable bytes. Available requires verified object metadata. */
export type EvidenceMetadata = EvidenceBase & (
  | { readonly state: 'upload_pending'; readonly uploadId: string; readonly declared: Readonly<EvidenceDeclaredContent> }
  | { readonly state: 'available'; readonly object: Readonly<EvidenceDeclaredContent & { storageKey: string }>; readonly availableAt: Instant }
  | { readonly state: 'failed'; readonly uploadId: string; readonly failure: 'SIZE_LIMIT' | 'TYPE_REJECTED' | 'DIGEST_MISMATCH' | 'STORAGE_UNAVAILABLE' | 'UPLOAD_INCOMPLETE' }
);
/** Future authenticated handler streams bytes separately; no public URL/path/provider is selected here. */
export interface EvidenceMetadataPort {
  begin(intent: EvidenceUploadIntent, auth: ReceivingAuthorization): Promise<ReceivingResult<EvidenceMetadata>>;
  find(id: string, scope: Scope, auth: ReceivingAuthorization): Promise<ReceivingResult<EvidenceMetadata>>;
}

/** Future private storage adapter: immutable keys, verified byte metadata, no public URL. */
export interface PrivateEvidenceObjectPort {
  write(object: { scope: Scope; storageKey: string }, bytes: AsyncIterable<Uint8Array>, expected: EvidenceDeclaredContent): Promise<ReceivingResult<Readonly<EvidenceDeclaredContent>>>;
  read(object: { scope: Scope; storageKey: string }): Promise<ReceivingResult<AsyncIterable<Uint8Array>>>;
}
