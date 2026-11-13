/** Unsupported offline capture must never imply local durability. */
export function onlineSignal(signal?: AbortSignal, timeoutMs = 15000): AbortSignal {
  const deadline = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, deadline]) : deadline;
}
/** Drop private in-memory views immediately on denied/expired context. */
export function invalidateDeniedAccess(response: Pick<Response, 'status'>): void {
  if ([401, 403].includes(response.status) && typeof window !== 'undefined') window.dispatchEvent(new Event('apptit:access-invalidated'));
}

let bootstrap: Promise<string> | null = null;
/** Coalesce initial nonce creation; never cache a session-bound token between operations. */
export async function csrfForRequest(signal?: AbortSignal): Promise<string> {
  signal?.throwIfAborted();
  if (!bootstrap) bootstrap = fetch('/api/session/csrf', { credentials: 'same-origin', cache: 'no-store', signal: onlineSignal() }).then(async response => {
    invalidateDeniedAccess(response);
    if (!response.ok) throw new Error('DEPENDENCY_UNAVAILABLE');
    const value = await response.json() as { csrfToken: string }; return value.csrfToken;
  }).finally(() => { bootstrap = null; });
  const token = await bootstrap; signal?.throwIfAborted(); return token;
}
