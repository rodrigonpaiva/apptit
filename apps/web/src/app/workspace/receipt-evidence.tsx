'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { EvidenceListing, EvidenceUploadIntent, EvidenceView, SiteAccess } from '@apptit/contracts';
import type { ReceiptEditorLine } from '../../lib/receipts';
async function request(action: string, input: unknown, signal?: AbortSignal): Promise<Response> {
  const bootstrap = await fetch('/api/session/csrf', { credentials: 'same-origin', cache: 'no-store', signal });
  if (!bootstrap.ok) throw new Error('Accès indisponible.');
  const { csrfToken } = await bootstrap.json() as { csrfToken: string };
  const response = await fetch(`/api/evidence/${action}`, { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal, headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Photo indisponible : vérifiez votre accès et réessayez.');
  return response;
}
const failureLabels = { SIZE_LIMIT: 'Photo trop volumineuse', TYPE_REJECTED: 'Format réel refusé', DIGEST_MISMATCH: 'Intégrité non confirmée', STORAGE_UNAVAILABLE: 'Stockage indisponible', UPLOAD_INCOMPLETE: 'Envoi incomplet' };
export default function ReceiptEvidence({ site, receiptId, line, saved, onBusy }: { site: SiteAccess; receiptId: string; line: ReceiptEditorLine; saved: boolean; onBusy: (busy: boolean) => void }) {
  const [listing, setListing] = useState<EvidenceListing | null>(null); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null); const [preview, setPreview] = useState(''); const [images, setImages] = useState<Record<string, string>>({});
  const active = useRef(true); const controller = useRef<AbortController | null>(null); const urls = useRef<string[]>([]); const attempt = useRef<{ intent: EvidenceUploadIntent; file: File } | null>(null); const inputRef = useRef<HTMLInputElement>(null);
  const requested = { tenantId: site.tenantId, siteId: site.siteId }; const writable = site.capabilities.includes('evidence.write');
  useEffect(() => { active.current = true; return () => { active.current = false; controller.current?.abort(); for (const url of urls.current) URL.revokeObjectURL(url); }; }, []);
  useEffect(() => {
    if (!saved) return;
    const abort = new AbortController();
    void request('list', { scope: { tenantId: site.tenantId, siteId: site.siteId }, receiptId }, abort.signal).then(response => response.json()).then((value: EvidenceListing) => { if (!abort.signal.aborted) setListing(value); }).catch(() => { if (!abort.signal.aborted) setMessage('Chargement des photos indisponible. Réessayez.'); });
    return () => abort.abort();
  }, [saved, receiptId, site.tenantId, site.siteId]);
  function url(blob: Blob) { const value = URL.createObjectURL(blob); urls.current.push(value); return value; }
  async function refresh() { try { const value = await (await request('list', { scope: requested, receiptId })).json() as EvidenceListing; if (active.current) { setListing(value); setMessage('États des photos rechargés.'); } } catch { if (active.current) setMessage('Vérification impossible. Aucun enregistrement confirmé.'); } }
  function choose(selected: File | undefined) {
    if (!selected) return;
    attempt.current = null; setMessage(''); if (preview) URL.revokeObjectURL(preview);
    if (!listing || !listing.mediaTypes.includes(selected.type) || selected.size < 1 || selected.size > listing.maxBytes) { setFile(null); setPreview(''); setMessage(`Choisissez une photo JPEG/PNG dans la limite de ${listing ? new Intl.NumberFormat('fr-FR').format(listing.maxBytes) : 'la taille autorisée'} octets.`); return; }
    setFile(selected); setPreview(url(selected));
  }
  async function upload() {
    if (!file || !saved || !listing || busy) return;
    setBusy(true); onBusy(true); setMessage('Envoi en cours — photo non confirmée.'); const abort = new AbortController(); controller.current = abort;
    try {
      let current = attempt.current;
      if (!current) {
        const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()))].map(byte => byte.toString(16).padStart(2, '0')).join('');
        if (!active.current) return;
        const intent: EvidenceUploadIntent = { uploadId: crypto.randomUUID(), scope: requested, links: { receiptId, lineId: line.id, productId: line.productId, presentationId: line.presentationId, batchId: line.batchId }, originalFilename: file.name, capturedAt: { state: 'unknown', reason: 'Heure de capture non confirmée par un dispositif de confiance' }, declared: { mediaType: file.type, sizeBytes: file.size, sha256: digest } };
        current = { intent, file }; attempt.current = current;
      }
      const pending = await (await request('begin', current.intent, abort.signal)).json() as EvidenceView;
      const bootstrap = await fetch('/api/session/csrf', { credentials: 'same-origin', cache: 'no-store', signal: abort.signal }); if (!bootstrap.ok) throw new Error('Accès indisponible');
      const { csrfToken } = await bootstrap.json() as { csrfToken: string };
      const response = await fetch('/api/evidence/upload', { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: abort.signal, headers: { 'content-type': current.file.type, 'x-csrf-token': csrfToken, 'x-tenant-id': requested.tenantId, 'x-site-id': requested.siteId, 'x-evidence-id': pending.id }, body: current.file });
      if (!response.ok) throw new Error('Envoi non confirmé');
      const result = await response.json() as EvidenceView;
      if (!active.current) return;
      setListing(value => value ? { ...value, items: [...value.items.filter(item => item.id !== result.id), result] } : value);
      if (result.state !== 'available') { setMessage(`${result.failure ? failureLabels[result.failure] : 'Envoi en attente'}. La saisie manuelle du lot et de la date reste possible.`); return; }
      setMessage('Photo originale enregistrée. Vérifiez sa lisibilité ; aucune donnée extraite automatiquement.'); setFile(null); setPreview(''); attempt.current = null; if (inputRef.current) inputRef.current.value = '';
    } catch { if (active.current && !abort.signal.aborted) setMessage('Envoi non confirmé. Réessayez avec le même fichier ou rechargez les états ; aucune photo disponible n’est annoncée.'); }
    finally { if (active.current) { setBusy(false); onBusy(false); } }
  }
  async function show(item: EvidenceView) { const abort = new AbortController(); controller.current = abort; try { const blob = await (await request('read', { scope: requested, id: item.id }, abort.signal)).blob(); if (active.current) setImages(current => ({ ...current, [item.id]: url(blob) })); } catch { if (active.current && !abort.signal.aborted) setMessage('Image non récupérée. Saisissez le lot et la date depuis l’étiquette réelle, sans supposer une photo disponible.'); } }
  async function review(item: EvidenceView, readability: 'readable' | 'unreadable') { try { const value = await (await request('review', { scope: requested, id: item.id, readability })).json() as EvidenceView; if (active.current) { setListing(current => current ? { ...current, items: current.items.map(row => row.id === item.id ? value : row) } : current); setMessage(readability === 'unreadable' ? 'Photo signalée illisible. Reprenez une photo et saisissez manuellement les informations vérifiées.' : 'Lisibilité indiquée par vous. Ce contrôle ne valide ni la sécurité alimentaire ni des champs extraits.'); } } catch { if (active.current) setMessage('État de lisibilité non enregistré. Réessayez.'); } }
  const items = listing?.items.filter(item => item.links.lineId === line.id) ?? [];
  return <section className="receipt-evidence" aria-label="Photos privées de cette ligne"><h4>Étiquette du lot</h4><p className="lookup-small">Lot et date saisis manuellement restent distincts de la photo. Extraction automatique désactivée.</p>
    {!saved && <p className="lookup-small">Enregistrez les modifications du brouillon avant d’ajouter ou vérifier une photo.</p>}
    {listing?.mode === 'disabled' && <p role="status">Photos privées désactivées dans cet environnement. La saisie manuelle reste disponible.</p>}
    {listing?.mode === 'fixture' && <><p className="lookup-small">JPEG/PNG · {new Intl.NumberFormat('fr-FR').format(listing.maxBytes)} octets maximum · stockage privé synthétique · aucune publication externe.</p>{items.length === 0 && <p>Aucune photo enregistrée pour ce lot.</p>}
      {items.map(item => <article key={item.id} className="evidence-card"><p><strong>{item.state === 'available' ? 'Photo originale enregistrée' : item.state === 'upload_pending' ? 'Envoi en attente — non disponible' : `Envoi échoué — ${item.failure ? failureLabels[item.failure] : 'photo non disponible'}`}</strong></p><p className="lookup-small">{item.originalFilename} · auteur : {item.author.nameAtAction} · enregistré le {new Date(item.recordedAt).toLocaleString('fr-FR')} · heure de capture {item.capturedAt.state === 'known' ? new Date(item.capturedAt.value).toLocaleString('fr-FR') : 'inconnue'}</p>
        {item.state === 'available' && <><p>Lisibilité : {item.readability.state === 'unreadable' ? 'illisible — nouvelle capture ou saisie manuelle nécessaire' : item.readability.state === 'readable' ? 'lisible selon l’opérateur' : 'à vérifier'}</p><button type="button" className="lookup-secondary" disabled={!saved || busy} onClick={() => void show(item)}>Voir la photo privée</button>{images[item.id] && <Image src={images[item.id]!} width={280} height={180} unoptimized alt="Étiquette originale du lot reçu, à vérifier par l’opérateur" />}{writable && <div className="button-row"><button type="button" className="lookup-secondary" disabled={!saved || busy} onClick={() => void review(item, 'readable')}>Étiquette lisible</button><button type="button" className="lookup-secondary" disabled={!saved || busy} onClick={() => void review(item, 'unreadable')}>Signaler illisible</button></div>}</>}
      </article>)}
      {writable && <><label>Photographier / reprendre l’étiquette<input ref={inputRef} type="file" accept="image/jpeg,image/png" capture="environment" disabled={!saved || busy || items.length >= 20} onChange={event => choose(event.target.files?.[0])} /></label>{preview && <><p>Photo sélectionnée — non enregistrée</p><Image src={preview} width={280} height={180} unoptimized alt="Aperçu local non enregistré de l’étiquette" /></>}<button type="button" className="lookup-secondary" disabled={!saved || busy || !file} onClick={() => void upload()}>{busy ? 'Envoi de la photo…' : attempt.current ? 'Réessayer le même envoi' : 'Envoyer la photo'}</button><p className="lookup-small">Une reprise ajoute une nouvelle photo sans remplacer l’original. Fichier non envoyé perdu au verrouillage ; capture hors ligne désactivée.</p></>}
      </>}{saved && <button type="button" className="lookup-secondary" disabled={busy} onClick={() => void refresh()}>Recharger les états des photos</button>}
    {message && <p role="status" className="lookup-small">{message}</p>}
  </section>;
}
