'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SessionProfile } from '@apptit/contracts';
import { currentSession, sessionCommand } from '../../lib/session';
import Catalogue from './catalogue';
import Icon from './workspace-icon';
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
  return <div className="workspace-shell">
    <a className="workspace-skip" href="#workspace-content">Aller au contenu</a>
    <aside className="workspace-sidebar" aria-label="Espace restaurant">
      <a className="brand" href="/" aria-label="Apptit, accueil">apptit<span>.</span></a>
      <div className="sidebar-intro"><span className="sidebar-overline">Votre espace cuisine</span><p>Les bonnes bases.<br />Le bon service.</p></div>
      <nav className="workspace-nav" aria-label="Navigation du restaurant"><span className="sidebar-overline">Mon restaurant</span><a href="#catalogue" aria-current="page"><Icon name="grid" /><span>Catalogue produits</span></a></nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><Icon name="leaf" /><p>Une cuisine organisée<br />commence ici.</p></div>
        {profile && <div className="workspace-account"><div className="account-summary"><span className="account-avatar" aria-hidden="true">{profile.user.name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('')}</span><div><strong>{profile.user.name}</strong><span>{profile.selectedSite ? roles[profile.selectedSite.role] : 'Compte individuel'}</span></div></div><p className="account-login">{profile.user.login}</p><button className="workspace-logout" disabled={pending} onClick={logout}><Icon name="logout" /><span>Se déconnecter / changer d’utilisateur</span></button></div>}
      </div>
    </aside>
    <div className="workspace-body">
      <header className="workspace-topbar"><div className="workspace-location"><span className="location-icon"><Icon name="building" /></span>{profile ? <label htmlFor="site"><span>Restaurant actif</span><select id="site" value={profile.selectedSite?.siteId ?? ''} onChange={event => void select(event.target.value)} disabled={pending}><option value="" disabled>Choisir un restaurant</option>{profile.sites.map(site => <option key={site.siteId} value={site.siteId}>{site.name}</option>)}</select></label> : <span className="location-pending">Vérification du restaurant</span>}</div><span className="workspace-demo"><span aria-hidden="true" />Données synthétiques</span></header>
      <main id="workspace-content" className="workspace-main">
        {!profile ? <section className="workspace-locked" role="status"><span className="locked-icon"><Icon name="shield" /></span><p className="eyebrow">Votre espace, protégé</p><h1>Accès individuel</h1><p>{message}</p><div className="button-row">{logoutFailed ? <button disabled={pending} onClick={logout}>Réessayer la déconnexion</button> : <><button disabled={pending} onClick={refresh}>Vérifier l’accès</button><a className="secondary-link" href="/login">Se connecter</a></>}</div></section> : <>
          <div className="workspace-welcome"><p>Bonjour, {profile.user.name}</p><span><Icon name="shield" />{profile.selectedSite ? roles[profile.selectedSite.role] : 'Compte individuel'} · Accès vérifié</span></div>
          {profile.selectedSite ? <Catalogue key={`${profile.user.id}:${profile.selectedSite.tenantId}:${profile.selectedSite.siteId}`} site={profile.selectedSite} /> : <section className="workspace-locked"><h1>Choisissez votre restaurant</h1><p>Sélectionnez un restaurant autorisé pour consulter ses références produits.</p></section>}
        </>}
        <footer className="workspace-footer"><span>Apptit <span aria-hidden="true">/</span> Mon restaurant</span><span>Chaque référence a sa place.</span></footer>
      </main>
    </div>
  </div>;
}
