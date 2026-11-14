import type { ReceiptDraftSnapshot, SaveReceiptDraft } from './receiving.js';
import type { Unit } from './quantity-draft.js';
/** Client-reported OCR suggestions reviewed by the authenticated draft author; not an OCR attestation. */
export interface LabelReview {
  schemaVersion: 1; evidenceId: string; imageSha256: string;
  engine: 'tesseract.js@7.0.0/fra@1.0.0'; extractedAt: string;
  proposed: { batch: string | null; expiry: string | null; expiryKind: 'use_by' | 'best_before' | null };
  batch: string | null;
  expiry: { date: string; kind: 'use_by' | 'best_before' } | null;
}
/** Receipt-private identity snapshot, never a catalogue approval or stock item. */
export interface ReceiptItemDetails {
  lineId: string;
  name: string;
  presentation: string;
  barcode: string | null;
  physicalMatch: boolean;
  labelReview?: LabelReview;
  pack: { count: string; factor: string; unit: Unit; checked: boolean } | null;
}
export interface SaveReceiptWorkspace { command: SaveReceiptDraft; items: ReceiptItemDetails[] }
export interface ReceiptWorkspaceSnapshot { draft: ReceiptDraftSnapshot; items: ReceiptItemDetails[] }
export interface ReceiptLocation { id: string; name: string }
export interface ReceiptSummary { id: string; version: number; recordedAt: string; lineCount: number }

/** Only a committed operation has a confirmed result. Missing is still uncertain. */
export type ReceiptOperationResult = { state: 'recorded'; snapshot: ReceiptWorkspaceSnapshot } | { state: 'unconfirmed' };
