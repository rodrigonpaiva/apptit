import type { ReceiptDraftSnapshot, SaveReceiptDraft } from './receiving.js';
import type { Unit } from './quantity-draft.js';
/** Receipt-private identity snapshot, never a catalogue approval or stock item. */
export interface ReceiptItemDetails {
  lineId: string;
  name: string;
  presentation: string;
  barcode: string | null;
  physicalMatch: boolean;
  pack: { count: string; factor: string; unit: Unit; checked: boolean } | null;
}
export interface SaveReceiptWorkspace { command: SaveReceiptDraft; items: ReceiptItemDetails[] }
export interface ReceiptWorkspaceSnapshot { draft: ReceiptDraftSnapshot; items: ReceiptItemDetails[] }
export interface ReceiptLocation { id: string; name: string }
export interface ReceiptSummary { id: string; version: number; recordedAt: string; lineCount: number }
