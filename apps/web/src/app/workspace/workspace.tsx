'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SessionProfile } from '@apptit/contracts';
import { currentSession, sessionCommand } from '../../lib/session';
const roles = { chef: 'Chef', storekeeper: 'Magasinier', cook: 'Cuisinier' };
export default function Workspace() {
  const generation = useRef(0);
  const locked = useRef(false);
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [message, setMessage] = useState('Vérification de votre accès…');
  const [pending, setPending] = useState(false);
  const [logoutFailed, setLogoutFailed] = useState(false);
  const refresh = useCallback(async () => {
    if (locked.current) return;
    const ticket = ++generation.current;
    setProfile(null); setMessage('Vérification de votre accès…');
    try { const current = await currentSession(); if (ticket !== generation.current || locked.current) return; setProfile(current); setMessage(''); }
    catch (error) { if (ticket !== generation.current || locked.current) return; setMessage(error instanceof Error && error.message === 'SESSION_ENDED' ? 'Votre session est terminée. Reconnectez-vous.' : 'Connexion indisponible. Votre accès doit être vérifié.'); }
  }, []);
  useEffect(() => {
    void refresh();
    const lock = () => { generation.current++; setProfile(null); setMessage('Accès verrouillé. Revenez pour vérifier votre session.'); };
    const focus = () => { if (!logoutFailed) void refresh(); };
    const visibility = () => { if (document.hidden) lock(); else focus(); };
    const restored = (event: PageTransitionEvent) => { if (event.persisted) { lock(); window.location.reload(); } };
    window.addEventListener('blur', lock); window.addEventListener('focus', focus); window.addEventListener('offline', lock);
    document.addEventListener('visibilitychange', visibility); window.addEventListener('pageshow', restored);
    return () => { window.removeEventListener('blur', lock); window.removeEventListener('focus', focus); window.removeEventListener('offline', lock); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pageshow', restored); };
  }, [refresh, logoutFailed]);
  async function logout() {
    locked.current = true; generation.current++;
    setPending(true); setProfile(null); setMessage('Déconnexion en cours…');
    try { await sessionCommand('logout', {}); window.location.replace('/login'); }
    catch { setLogoutFailed(true); setMessage('La déconnexion n’a pas été confirmée. Réessayez avant de changer d’utilisateur.'); setPending(false); }
  }
  async function select(siteId: string) {
    const site = profile?.sites.find(candidate => candidate.siteId === siteId);
    if (!site) return;
    locked.current = true; const ticket = ++generation.current;
    setPending(true); setProfile(null); setMessage('Vérification du restaurant…');
    try { const selected = await sessionCommand('site', { tenantId: site.tenantId, siteId: site.siteId }) as SessionProfile; if (ticket === generation.current) { setProfile(selected); setMessage(''); } }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Accès indisponible.'); }
    finally { locked.current = false; setPending(false); }
  }
  return <main><header><a className="brand" href="/">apptit<span>.</span></a><span className="badge">Données synthétiques</span></header>
    <section className="workspace-section"><p className="eyebrow">Mon restaurant</p>
      {!profile ? <div role="status"><h1>Accès individuel</h1><p>{message}</p><div className="button-row">{logoutFailed ? <button disabled={pending} onClick={logout}>Réessayer la déconnexion</button> : <><button disabled={pending} onClick={refresh}>Vérifier l’accès</button><a className="secondary-link" href="/login">Se connecter</a></>}</div></div> : <>
        <h1>Bonjour, {profile.user.name}</h1><p className="intro">Vous êtes connecté avec votre compte individuel.</p>
        <div className="identity-card"><p><strong>{profile.user.login}</strong></p><p>{profile.selectedSite ? roles[profile.selectedSite.role] : 'Choisissez un restaurant autorisé'}</p>
          <label htmlFor="site">Restaurant<select id="site" value={profile.selectedSite?.siteId ?? ''} onChange={event => void select(event.target.value)} disabled={pending}><option value="" disabled>Choisir un restaurant</option>{profile.sites.map(site => <option key={site.siteId} value={site.siteId}>{site.name}</option>)}</select></label>
        </div>
        {profile.selectedSite && <div className="notice"><span aria-hidden="true">01</span><div><h2>{profile.selectedSite.name}</h2><p>Votre accès au restaurant est vérifié. Le catalogue privé sera disponible à la prochaine étape.</p></div></div>}
        <button className="secondary-button" disabled={pending} onClick={logout}>Se déconnecter / changer d’utilisateur</button>
      </>}
    </section><footer>Apptit · Accès individuel et restaurant autorisé</footer></main>;
}
