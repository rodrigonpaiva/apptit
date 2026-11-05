import type { ApplicationErrorCode, QuantityDraftRevision, Result, SaveQuantityDraft, TrustedActorContext, VersionedQuantityDraft } from '@apptit/contracts';
import { instant, object, quantityDraftData, scope, text, timeZone, uuid, validate, invalid } from '@apptit/domain-values';
import { DraftRepositoryError } from './quantity-draft.repository.js';
import type { QuantityDraftRepository } from './quantity-draft.repository.js';
function error<T>(code: ApplicationErrorCode): Result<T> {
  const messages = { INVALID_INPUT: 'Input requires correction.', UNAUTHENTICATED: 'Authenticated server context is required.', FORBIDDEN: 'Access denied.', NOT_FOUND: 'Draft not found.', VERSION_CONFLICT: 'Draft changed; reload and review the current version.', DEPENDENCY_UNAVAILABLE: 'Persistence is unavailable; no success is confirmed.', INTERNAL_ERROR: 'Operation could not be completed.' };
  return { ok: false, error: { code, message: messages[code], retry: code === 'UNAUTHENTICATED' ? 'after_reauthentication' : code === 'VERSION_CONFLICT' || code === 'DEPENDENCY_UNAVAILABLE' ? 'after_review' : 'never', issues: [] } };
}
function parseCommand(input: unknown): SaveQuantityDraft {
  const value = object(input, ['id', 'scope', 'expectedVersion', 'data'], 'command');
  const version = value['expectedVersion'];
  if (!Number.isInteger(version) || (version as number) < 0 || (version as number) >= 2147483647) invalid('expectedVersion', 'INVALID_VERSION', 'Expected version must be an integer from 0 to 2147483646.');
  return { id: uuid(value['id'], 'id'), scope: scope(value['scope']), expectedVersion: version as number, data: quantityDraftData(value['data']) };
}
/** Context is supplied by a future authenticated adapter, not by client JSON.
 * This package exposes no persistence HTTP/GraphQL mutation or fixture-auth bypass. */
export class QuantityDraftApplication {
  constructor(private readonly repository: QuantityDraftRepository, private readonly clock: () => Date = () => new Date()) {}
  private authorize(context: TrustedActorContext | undefined, capability: TrustedActorContext['capabilities'][number]): Result<TrustedActorContext> {
    if (!context) return error('UNAUTHENTICATED');
    if (!context.capabilities?.includes(capability)) return error('FORBIDDEN');
    return validate(() => ({
      actor: { userId: uuid(context.actor?.userId, 'actor.userId'), nameAtAction: text(context.actor?.nameAtAction, 'actor.nameAtAction', 200) },
      scope: scope(context.scope), siteTimeZone: timeZone(context.siteTimeZone), sessionId: uuid(context.sessionId, 'sessionId'),
      correlationId: uuid(context.correlationId, 'correlationId'), capabilities: context.capabilities,
    }));
  }
  async save(input: unknown, context?: TrustedActorContext): Promise<Result<VersionedQuantityDraft>> {
    const authorized = this.authorize(context, 'quantity-draft.write');
    if (!authorized.ok) return authorized;
    const parsed = validate(() => parseCommand(input));
    if (!parsed.ok) return parsed;
    const command = parsed.value;
    if (command.scope.tenantId !== authorized.value.scope.tenantId || command.scope.siteId !== authorized.value.scope.siteId) return error('FORBIDDEN');
    try {
      const value = await this.repository.save(command, authorized.value, instant(this.clock().toISOString(), 'recordedAt'));
      return { ok: true, value };
    } catch (failure) {
      if (failure instanceof DraftRepositoryError) return error(failure.code);
      return error('DEPENDENCY_UNAVAILABLE');
    }
  }
  async find(id: unknown, context?: TrustedActorContext): Promise<Result<VersionedQuantityDraft>> {
    const authorized = this.authorize(context, 'quantity-draft.read');
    if (!authorized.ok) return authorized;
    const parsed = validate(() => uuid(id, 'id'));
    if (!parsed.ok) return parsed;
    try {
      const value = await this.repository.find(parsed.value, authorized.value.scope);
      return value ? { ok: true, value } : error('NOT_FOUND');
    } catch { return error('DEPENDENCY_UNAVAILABLE'); }
  }
  async history(id: unknown, context?: TrustedActorContext): Promise<Result<QuantityDraftRevision[]>> {
    const authorized = this.authorize(context, 'quantity-draft.read');
    if (!authorized.ok) return authorized;
    const parsed = validate(() => uuid(id, 'id'));
    if (!parsed.ok) return parsed;
    try {
      const history = await this.repository.history(parsed.value, authorized.value.scope);
      return history.length ? { ok: true, value: history } : error('NOT_FOUND');
    } catch { return error('DEPENDENCY_UNAVAILABLE'); }
  }
}
