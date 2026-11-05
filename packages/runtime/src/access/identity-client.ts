import { randomUUID } from 'node:crypto';
import type { AuthCode } from '@apptit/contracts';
import type { RuntimeConfig } from '../index.js';
export class AuthFailure extends Error {
  constructor(public readonly code: AuthCode, public readonly status: number) { super(code); }
}
export async function identityCall<T>(config: RuntimeConfig, action: 'login' | 'current' | 'logout' | 'select' | 'authorize', secret?: string, body: unknown = {}, correlationId: string = randomUUID()): Promise<T> {
  try {
    const response = await fetch(`${config.identityOrigin}/internal/v1/${action}`, {
      method: 'POST', redirect: 'error', headers: { 'content-type': 'application/json', 'x-caller-id': config.service === 'kitchen' ? 'kitchen' : 'gateway',
        'x-internal-token': (config.service === 'kitchen' ? config.identityKitchenToken : config.identityToken)!,
        ...(secret ? { 'x-session-secret': secret } : {}), 'x-correlation-id': correlationId },
      body: JSON.stringify(body), signal: AbortSignal.timeout(config.internalTimeoutMs),
    });
    const result = await response.json() as T & { code?: AuthCode };
    if (!response.ok) {
      const allowed: AuthCode[] = ['INVALID_INPUT', 'INVALID_CREDENTIALS', 'UNAUTHENTICATED', 'SESSION_EXPIRED', 'SESSION_REVOKED', 'FORBIDDEN', 'RATE_LIMITED'];
      throw new AuthFailure(result.code && allowed.includes(result.code) ? result.code : 'DEPENDENCY_UNAVAILABLE', response.status);
    }
    return result;
  } catch (error) { if (error instanceof AuthFailure) throw error; throw new AuthFailure('DEPENDENCY_UNAVAILABLE', 503); }
}
