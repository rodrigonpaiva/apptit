'use client';
import { useEffect, useRef, useState } from 'react';
import type { EvidenceView, LabelReview } from '@apptit/contracts';
import { recognizeLabel } from '../../lib/label-ocr';
import type { LabelDateKind } from '../../lib/label-proposals';
type Result = Awaited<ReturnType<typeof recognizeLabel>>;
export default function LabelExtraction({ photo, disabled, read, apply }: { photo: EvidenceView; disabled: boolean; read: (signal: AbortSignal) => Promise<Blob>; apply: (review: LabelReview) => void }) {
  const [busy, setBusy] = useState(false), [progress, setProgress] = useState(0), [result, setResult] = useState<Result | null>(null), [message, setMessage] = useState('');
  const [batch, setBatch] = useState(''), [expiry, setExpiry] = useState(''), [kind, setKind] = useState<LabelDateKind | ''>('');
  const [useBatch, setUseBatch] = useState(false), [useExpiry, setUseExpiry] = useState(false), [confirmed, setConfirmed] = useState(false);
  const controller = useRef<AbortController | null>(null), active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; controller.current?.abort(); }; }, []);
  async function extract() {
    controller.current?.abort(); const abort = new AbortController(); controller.current = abort;
    setBusy(true); setProgress(0); setResult(null); setMessage(''); setUseBatch(false); setUseExpiry(false); setConfirmed(false);
    try {
      const blob = await read(abort.signal);
      const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()))].map(value => value.toString(16).padStart(2, '0')).join('');
      if (digest !== photo.declared.sha256) throw new Error('DIGEST_MISMATCH');
      const value = await recognizeLabel(blob, abort.signal, setProgress);
      if (!active.current || abort.signal.aborted) return;
      setResult(value); setBatch(value.batch ?? ''); setExpiry(value.expiry ?? ''); setKind(value.expiryKind ?? '');
      setMessage(value.uncertain ? 'Lecture incomplète ou incertaine. Complétez depuis la photo ; aucun champ du brouillon n’a été modifié.' : 'Propositions non validées. Comparez chaque valeur à la photo avant de les utiliser.');
    } catch { if (active.current) setMessage('Lecture non confirmée ou interrompue. La photo originale est conservée ; la saisie manuelle reste disponible.'); }
    finally { if (active.current) { setBusy(false); } }
  }
  function changed() { setConfirmed(false); }
  function accept() {
    if (disabled || photo.readability.state === 'unreadable' || !result || !confirmed || !useBatch && !useExpiry || useBatch && !batch.trim() || useExpiry && (!expiry || !kind)) return;
    apply({ schemaVersion: 1, evidenceId: photo.id, imageSha256: photo.declared.sha256, engine: result.engine, extractedAt: result.extractedAt, proposed: { batch: result.batch, expiry: result.expiry, expiryKind: result.expiryKind }, batch: useBatch ? batch.trim() : null, expiry: useExpiry ? { date: expiry, kind: kind as LabelDateKind } : null });
    setResult(null); setMessage('Valeurs revues appliquées au brouillon uniquement. Enregistrez le brouillon pour conserver la révision et sa source.');
  }
  return <div className="label-extraction"><p className="lookup-small">Lecture locale de cette photo, sans envoi à un service OCR externe. Une lecture n’est pas une validation sanitaire. <a href="/licenses/tesseract-apache-2.txt" target="_blank" rel="noopener noreferrer">Tesseract.js</a> · <a href="/licenses/tesseract-core.txt" target="_blank" rel="noopener noreferrer">Tesseract Core</a> · <a href="/licenses/tesseract-data.txt" target="_blank" rel="noopener noreferrer">Modèle français</a>.</p><button type="button" className="lookup-secondary" disabled={disabled || busy || photo.readability.state === 'unreadable'} onClick={() => void extract()}>Proposer le lot et la date depuis cette photo</button>
    {busy && <p role="status">Lecture de l’étiquette… {progress} % <button type="button" onClick={() => controller.current?.abort()}>Annuler la lecture</button></p>}
    {result && <fieldset disabled={disabled || busy || photo.readability.state === 'unreadable'}><legend>Propositions à vérifier sur la photo originale</legend><p>Seuls les champs cochés seront appliqués. Les valeurs déjà saisies seront remplacées uniquement après votre confirmation.</p>
      <label className="physical-match"><input type="checkbox" checked={useBatch} onChange={event => { setUseBatch(event.target.checked); changed(); }} />Utiliser le numéro de lot revu</label><label>Lot proposé — modifiable<input value={batch} maxLength={100} onChange={event => { setBatch(event.target.value); changed(); }} placeholder="Aucun lot fiable reconnu" /></label>
      <label className="physical-match"><input type="checkbox" checked={useExpiry} onChange={event => { setUseExpiry(event.target.checked); changed(); }} />Utiliser la date revue</label><label>Date proposée — modifiable<input type="date" value={expiry} onChange={event => { setExpiry(event.target.value); changed(); }} /></label><label>Type de date à confirmer<select value={kind} onChange={event => { setKind(event.target.value as LabelDateKind | ''); changed(); }}><option value="">Type inconnu — choisir sur l’étiquette</option><option value="use_by">DLC — à consommer jusqu’au</option><option value="best_before">DDM — de préférence avant</option></select></label>
      <label className="physical-match"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />J’ai comparé les valeurs sélectionnées à cette photo et je confirme leur application, y compris le remplacement des valeurs déjà saisies.</label><button type="button" disabled={!confirmed || !useBatch && !useExpiry || useBatch && !batch.trim() || useExpiry && (!expiry || !kind)} onClick={accept}>Appliquer les champs vérifiés au brouillon</button><button type="button" className="lookup-secondary" onClick={() => setResult(null)}>Ignorer les propositions</button>
    </fieldset>}{message && <p role="status" className="lookup-small">{message}</p>}
  </div>;
}
