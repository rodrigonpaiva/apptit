'use client';
import { useEffect, useState } from 'react';
import { storageCategories } from '@apptit/contracts';
import type { SiteAccess, StorageLocation } from '@apptit/contracts';
import { csrfForRequest, invalidateDeniedAccess, onlineSignal } from '../../lib/online-request';
import { fr } from '../../i18n/fr';
export default function StorageLocations({ site }: { site: SiteAccess }) {
  const [loaded, setLoaded] = useState(false);
  const [rows, setRows] = useState<StorageLocation[]>([]), [busy, setBusy] = useState(false), [needsReload, setNeedsReload] = useState(false), [message, setMessage] = useState('');
  const [form, setForm] = useState({ id: '', expectedVersion: 0, name: '', category: '', isActive: true });
  async function request(action: 'list' | 'save', value: unknown, signal?: AbortSignal) {
    signal = onlineSignal(signal); const csrf = await csrfForRequest(signal);
    const response = await fetch(`/api/storage-locations/${action}`, { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal, headers: { 'content-type': 'application/json', 'x-csrf-token': csrf }, body: JSON.stringify(value) }); invalidateDeniedAccess(response);
    if (!response.ok) throw new Error('UNCONFIRMED'); return response.json() as Promise<StorageLocation[] | StorageLocation>;
  }
  useEffect(() => { const abort = new AbortController(); setMessage(fr.storage.loading); void request('list', { scope: { tenantId: site.tenantId, siteId: site.siteId } }, abort.signal).then(value => { if (!abort.signal.aborted) { setRows(value as StorageLocation[]); setLoaded(true); setMessage(''); } }).catch(() => { if (!abort.signal.aborted) setMessage(fr.storage.failure); }); return () => abort.abort(); }, [site.tenantId, site.siteId]);
  async function reload() { setBusy(true); try { const value = await request('list', { scope: { tenantId: site.tenantId, siteId: site.siteId } }) as StorageLocation[]; setRows(value); setLoaded(true); const found = value.find(row => row.id === form.id); if (found) setForm({ id: found.id, name: found.name, category: found.category ?? '', isActive: found.isActive, expectedVersion: found.version }); setNeedsReload(false); setMessage(''); } catch { setMessage(fr.storage.failure); } finally { setBusy(false); } }
  function fresh() { setForm({ id: crypto.randomUUID(), expectedVersion: 0, name: '', category: '', isActive: true }); setMessage(''); }
  async function save() { setBusy(true); setMessage(''); try { const id = form.id || crypto.randomUUID(); setForm(value => ({ ...value, id })); const saved = await request('save', { ...form, id, scope: { tenantId: site.tenantId, siteId: site.siteId } }) as StorageLocation; setRows(value => [...value.filter(row => row.id !== saved.id), saved]); setForm({ id: '', expectedVersion: 0, name: '', category: '', isActive: true }); setMessage(fr.storage.saved); } catch { setNeedsReload(true); setMessage(fr.storage.failure); } finally { setBusy(false); } }
  if (!site.capabilities.includes('storage.location.manage')) return <p>{fr.storage.noAccess}</p>;
  return <section id="storage" className="storage-configuration"><h1>{fr.storage.title}</h1><p>{fr.storage.intro}</p>{message && <p role="status">{message}</p>}<button type="button" className="lookup-secondary" disabled={busy} onClick={() => void reload()}>{fr.storage.reload}</button>
    <form onSubmit={event => { event.preventDefault(); void save(); }}><fieldset disabled={busy || needsReload || !loaded}><legend>{form.expectedVersion ? fr.storage.edit : fr.storage.new}</legend><label>{fr.storage.name}<input required maxLength={100} value={form.name} onChange={event => setForm(value => ({ ...value, name: event.target.value }))} /></label><label htmlFor="storage-category">{fr.storage.category}</label><select id="storage-category" required value={form.category} onChange={event => setForm(value => ({ ...value, category: event.target.value }))}><option value="">{fr.storage.choose}</option>{storageCategories.map(category => <option value={category} key={category}>{fr.categories[category].label}</option>)}</select><label className="physical-match"><input type="checkbox" checked={form.isActive} onChange={event => setForm(value => ({ ...value, isActive: event.target.checked }))} />{fr.storage.active}</label><button>{busy ? fr.storage.saving : fr.storage.save}</button><button type="button" className="lookup-secondary" onClick={fresh}>{fr.storage.cancel}</button></fieldset></form>
    {loaded && rows.length === 0 && <p>{fr.storage.empty}</p>}<ul>{rows.map(row => <li key={row.id}><strong>{row.name}</strong> · {row.category ? fr.categories[row.category].label : fr.storage.unclassified} {!row.isActive && ` · ${fr.storage.inactive}`} <button type="button" className="lookup-secondary" disabled={busy} onClick={() => { setNeedsReload(false); setForm({ id: row.id, expectedVersion: row.version, name: row.name, category: row.category ?? '', isActive: row.isActive }); }}>{fr.storage.edit}</button></li>)}</ul>
  </section>;
}
