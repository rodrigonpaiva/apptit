import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Workspace from './workspace';
export const dynamic = 'force-dynamic';
export default async function WorkspacePage() {
  const cookie = (await cookies()).toString();
  let response: Response;
  try {
    response = await fetch(`http://127.0.0.1:${process.env.GATEWAY_PORT ?? '4000'}/session/current`, { redirect: 'error', headers: { cookie }, cache: 'no-store', signal: AbortSignal.timeout(5000) });
  } catch {
    return <main><section><h1>Connexion indisponible</h1><p>Impossible de vérifier votre accès. <a href="/workspace">Réessayer</a></p></section></main>;
  }
  if (response.status === 401) redirect('/login');
  if (!response.ok) return <main><section><h1>Connexion indisponible</h1><p>Impossible de vérifier votre accès. <a href="/workspace">Réessayer</a></p></section></main>;
  // No private profile in prerendered/cached markup. The client performs a fresh verification.
  return <Workspace />;
}
