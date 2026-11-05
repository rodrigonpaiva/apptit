import type { SessionProfile } from '@apptit/contracts';
export async function currentSession(): Promise<SessionProfile> {
  const response = await fetch('/api/session/current', { cache: 'no-store', credentials: 'same-origin' });
  if (!response.ok) throw new Error(response.status === 401 ? 'SESSION_ENDED' : 'UNAVAILABLE');
  return response.json() as Promise<SessionProfile>;
}
export async function sessionCommand(path: 'login' | 'logout' | 'site', body: unknown): Promise<SessionProfile | { success: true }> {
  const bootstrap = await fetch('/api/session/csrf', { cache: 'no-store', credentials: 'same-origin' });
  if (!bootstrap.ok) throw new Error('Connexion indisponible. Réessayez.');
  const { csrfToken } = await bootstrap.json() as { csrfToken: string };
  const response = await fetch(`/api/session/${path}`, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify(body), cache: 'no-store' });
  if (!response.ok) {
    if (response.status === 429) throw new Error('Trop de tentatives. Patientez avant de réessayer.');
    if (response.status === 401) throw new Error(path === 'login' ? 'Identifiant ou mot de passe incorrect.' : 'Votre session a expiré. Reconnectez-vous.');
    if (response.status === 403) throw new Error('Accès refusé. Vérifiez votre session et le restaurant choisi.');
    throw new Error('Connexion indisponible. Réessayez.');
  }
  return response.json();
}
