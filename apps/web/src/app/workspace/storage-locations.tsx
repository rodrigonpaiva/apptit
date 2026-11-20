'use client';
import { useEffect, useRef, useState } from 'react';
import { storageCategories } from '@apptit/contracts';
import type { SiteAccess, StorageLocation } from '@apptit/contracts';
import { csrfForRequest, invalidateDeniedAccess, onlineSignal } from '../../lib/online-request';
import { fr } from '../../i18n/fr';
export default function StorageLocations({ site }: { site: SiteAccess }) {
  const [pendingRemove, setPendingRemove] = useState<StorageLocation | null>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null), triggerRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => { if (pendingRemove) confirmRef.current?.focus(); else triggerRef.current?.focus(); }, [pendingRemove]);
  const [loaded, setLoaded] = useState(false);
  const [rows, setRows] = useState<StorageLocation[]>([]), [busy, setBusy] = useState(false), [needsReload, setNeedsReload] = useState(false), [message, setMessage] = useState('');
  useEffect(() => { if (message === fr.storage.removed) statusRef.current?.focus(); }, [message]);
  const [form, setForm] = useState({ id: '', expectedVersion: 0, name: '', category: '', isActive: true });
  async function request(action: 'list' | 'save' | 'remove', value: unknown, signal?: AbortSignal) {
    signal = onlineSignal(signal); const csrf = await csrfForRequest(signal);
    const response = await fetch(`/api/storage-locations/${action}`, { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal, headers: { 'content-type': 'application/json', 'x-csrf-token': csrf }, body: JSON.stringify(value) }); invalidateDeniedAccess(response);
    if (!response.ok) throw new Error('UNCONFIRMED'); return response.json() as Promise<StorageLocation[] | StorageLocation>;
  }
  useEffect(() => { const abort = new AbortController(); setMessage(fr.storage.loading); void request('list', { scope: { tenantId: site.tenantId, siteId: site.siteId } }, abort.signal).then(value => { if (!abort.signal.aborted) { setRows(value as StorageLocation[]); setLoaded(true); setMessage(''); } }).catch(() => { if (!abort.signal.aborted) setMessage(fr.storage.failure); }); return () => abort.abort(); }, [site.tenantId, site.siteId]);
  async function reload() { setBusy(true); try { const value = await request('list', { scope: { tenantId: site.tenantId, siteId: site.siteId } }) as StorageLocation[]; setRows(value); setLoaded(true); const found = value.find(row => row.id === form.id); if (found) setForm({ id: found.id, name: found.name, category: found.category ?? '', isActive: found.isActive, expectedVersion: found.version }); setNeedsReload(false); setMessage(''); } catch { setMessage(fr.storage.failure); } finally { setBusy(false); } }
  function fresh() { setForm({ id: crypto.randomUUID(), expectedVersion: 0, name: '', category: '', isActive: true }); setMessage(''); }
  async function save() { setBusy(true); setMessage(''); try { const id = form.id || crypto.randomUUID(); setForm(value => ({ ...value, id })); const saved = await request('save', { ...form, id, scope: { tenantId: site.tenantId, siteId: site.siteId } }) as StorageLocation; setRows(value => [...value.filter(row => row.id !== saved.id), saved]); setForm({ id: '', expectedVersion: 0, name: '', category: '', isActive: true }); setMessage(fr.storage.saved); } catch { setNeedsReload(true); setMessage(fr.storage.failure); } finally { setBusy(false); } }

  async function remove() {
    if (!pendingRemove) return;
    setBusy(true); setMessage('');
    try {
      await request('remove', { scope: { tenantId: site.tenantId, siteId: site.siteId }, id: pendingRemove.id, expectedVersion: pendingRemove.version });
      setRows(value => value.filter(row => row.id !== pendingRemove.id));
      if (form.id === pendingRemove.id) fresh();
      setPendingRemove(null); setMessage(fr.storage.removed);
    } catch { setPendingRemove(null); setNeedsReload(true); setMessage(fr.storage.failure); }
    finally { setBusy(false); }
  }
  function cancelRemove() { setPendingRemove(null); }
  if (!site.capabilities.includes('storage.location.manage')) return <p>{fr.storage.noAccess}</p>;
  const groups = [...storageCategories, null];
  return <section id="storage" className="storage-configuration" aria-busy={busy}>
    <header className="storage-heading"><div><p className="eyebrow">{fr.storage.subtitle}</p><h1>{fr.storage.title}</h1><p>{fr.storage.intro}</p></div><button type="button" className="lookup-secondary" disabled={busy} onClick={() => void reload()}>{fr.storage.reload}</button></header>
    {message && <p ref={statusRef} tabIndex={-1} className="storage-notice" role="status">{message}</p>}
    {loaded && <dl className="storage-stats"><div><dt>{fr.storage.total}</dt><dd>{rows.length}</dd></div><div><dt>{fr.storage.activeCount}</dt><dd>{rows.filter(row => row.isActive).length}</dd></div><div><dt>{fr.storage.categoryCount}</dt><dd>{new Set(rows.flatMap(row => row.category ? [row.category] : [])).size} <span>/ 5</span></dd></div></dl>}
    <div className="storage-layout"><form className="storage-editor" onSubmit={event => { event.preventDefault(); void save(); }}><fieldset disabled={busy || needsReload || !loaded || !!pendingRemove}><legend>{form.expectedVersion ? fr.storage.edit : fr.storage.new}</legend><label>{fr.storage.name}<input required maxLength={100} value={form.name} aria-describedby="storage-name-hint" onChange={event => setForm(value => ({ ...value, name: event.target.value }))} /></label><p id="storage-name-hint" className="storage-hint">{fr.storage.nameHint}</p><label htmlFor="storage-category">{fr.storage.category}</label><select id="storage-category" required aria-describedby="storage-category-hint" value={form.category} onChange={event => setForm(value => ({ ...value, category: event.target.value }))}><option value="">{fr.storage.choose}</option>{storageCategories.map(category => <option value={category} key={category}>{fr.categories[category].label}</option>)}</select><p id="storage-category-hint" className="storage-hint">{fr.storage.categoryHint}</p><div className="storage-availability"><label className="physical-match"><input type="checkbox" checked={form.isActive} onChange={event => setForm(value => ({ ...value, isActive: event.target.checked }))} />{fr.storage.active}</label><p className="storage-hint">{fr.storage.activeHelp}</p></div><div className="storage-form-actions"><button>{busy ? fr.storage.saving : fr.storage.save}</button><button type="button" className="lookup-secondary" onClick={fresh}>{fr.storage.cancel}</button></div></fieldset></form>
    <div className="storage-inventory"><h2>{fr.storage.listTitle}</h2><p className="storage-hint">{fr.storage.listHelp}</p>{loaded && rows.length === 0 && <div className="storage-empty">{fr.storage.empty}</div>}
    {groups.map(category => { const locations = rows.filter(row => row.category === category).sort((a,b) => a.name.localeCompare(b.name, 'fr')); if (!locations.length) return null; return <section className="storage-group" key={category ?? 'legacy'}><h3>{category ? fr.categories[category].label : fr.storage.unclassified}<span>{locations.length}</span></h3><ul>{locations.map(row => <li className="storage-location-card" key={row.id}><div className="storage-location-name"><strong>{row.name}</strong><span className={row.isActive ? 'storage-status' : 'storage-status storage-status-inactive'}>{row.isActive ? fr.storage.active : fr.storage.inactive}</span></div><div className="storage-row-actions"><button type="button" className="lookup-secondary" disabled={busy || needsReload || !!pendingRemove} onClick={() => { setForm({ id: row.id, expectedVersion: row.version, name: row.name, category: row.category ?? '', isActive: row.isActive }); }}>{fr.storage.edit}</button><button type="button" className="storage-delete" disabled={busy || needsReload || !!pendingRemove} aria-label={`${fr.storage.remove} ${row.name}`} onClick={event => { triggerRef.current = event.currentTarget; setPendingRemove(row); }}>{fr.storage.remove}</button></div>
    {pendingRemove?.id === row.id && <div className="storage-confirm" role="region" aria-label={fr.storage.removeTitle}><h4>{fr.storage.removeTitle}</h4><p><strong>{row.name}</strong></p><p>{fr.storage.removeHelp}</p><div className="storage-row-actions"><button ref={confirmRef} type="button" className="storage-delete" disabled={busy} onClick={() => void remove()}>{fr.storage.confirmRemove}</button><button type="button" className="lookup-secondary" disabled={busy} onClick={cancelRemove}>{fr.storage.keep}</button></div></div>}</li>)}</ul></section>; })}</div></div>
  </section>;
}
