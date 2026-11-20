import type { ActorSnapshot, Datum, Instant, Scope } from './quantity-draft.js';
import type { EvidenceDeclaredContent, EvidenceLinks } from './evidence.js';
/** Public scoped DTO: never contains a filesystem key or a public image URL. */
export interface EvidenceView {
  id: string; uploadId: string; scope: Scope; links: EvidenceLinks;
  originalFilename: string; author: ActorSnapshot; recordedAt: Instant; capturedAt: Datum<Instant>; synthetic: true;
  state: 'upload_pending' | 'available' | 'failed'; declared: EvidenceDeclaredContent; availableAt?: Instant;
  failure?: 'SIZE_LIMIT' | 'TYPE_REJECTED' | 'DIGEST_MISMATCH' | 'STORAGE_UNAVAILABLE' | 'UPLOAD_INCOMPLETE';
  readability: { state: 'unreviewed' | 'readable' | 'unreadable'; reviewedBy?: ActorSnapshot; reviewedAt?: Instant };
  extraction: { state: 'disabled' };
}
export interface EvidenceListing { localLabelOcr?: boolean; mode: 'disabled' | 'fixture'; maxBytes: number; mediaTypes: string[]; items: EvidenceView[] }
