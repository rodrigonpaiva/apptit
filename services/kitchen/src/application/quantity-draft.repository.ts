import type { QuantityDraftRevision, SaveQuantityDraft, Scope, TrustedActorContext, VersionedQuantityDraft } from '@apptit/contracts';
/** Owns atomic aggregate + revision writes. No transport/session/provider dependency. */
export interface QuantityDraftRepository {
  save(command: SaveQuantityDraft, context: TrustedActorContext, recordedAt: string): Promise<VersionedQuantityDraft>;
  find(id: string, scope: Scope): Promise<VersionedQuantityDraft | null>;
  history(id: string, scope: Scope): Promise<QuantityDraftRevision[]>;
}
export class DraftRepositoryError extends Error {
  constructor(public readonly code: 'NOT_FOUND' | 'VERSION_CONFLICT') { super(code); }
}
