'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { ScopedProductLookup, SiteAccess } from '@apptit/contracts';
import { identifyProduct } from '../../lib/product-lookup';
import Scanner from './scanner';
import ProductReferencePhoto from './product-reference-photo';
import Icon from './workspace-icon';
import type { ReceiptSeed } from '../../lib/receipts';
const allergenNames: Record<string, string> = { 'en:milk': 'Lait', 'en:nuts': 'Fruits à coque', 'en:soybeans': 'Soja', 'en:gluten': 'Gluten', 'en:eggs': 'Œufs', 'en:peanuts': 'Arachides', 'en:fish': 'Poisson', 'en:crustaceans': 'Crustacés', 'en:molluscs': 'Mollusques', 'en:celery': 'Céleri', 'en:mustard': 'Moutarde', 'en:sesame-seeds': 'Graines de sésame', 'en:sulphur-dioxide-and-sulphites': 'Sulfites', 'en:lupin': 'Lupin' };
const labels = { name: 'Nom du produit', brands: 'Marque', presentation: 'Présentation déclarée', allergens: 'Allergènes déclarés', nutrition: 'Nutrition déclarée' };
export default function ProductIdentification({ site, onStartReceipt }: { site: SiteAccess; onStartReceipt: (seed: ReceiptSeed) => void }) {
  const [code, setCode] = useState(''); const [result, setResult] = useState<ScopedProductLookup | null>(null);
  const [failure, setFailure] = useState(''); const [busy, setBusy] = useState(false); const [camera, setCamera] = useState(false);
  const [manual, setManual] = useState(false); const [preview, setPreview] = useState(false); const [matched, setMatched] = useState(false);
  const [name, setName] = useState(''); const [presentation, setPresentation] = useState('');
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const lookup = useCallback(async (barcode: string) => {
    request.current?.abort(); setResult(null); setPreview(false); setMatched(false); setManual(false); setName(''); setPresentation(''); setFailure('');
    if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(barcode)) { setBusy(false); setFailure('Entrez 8, 12, 13 ou 14 chiffres, en conservant les zéros initiaux.'); return; }
    const controller = new AbortController(); request.current = controller; setBusy(true);
    try {
      const value = await identifyProduct(site, barcode, controller.signal);
      if (controller.signal.aborted) return;
      setResult(value); setName(value.product?.name.value ?? ''); setPresentation(value.product?.presentation.value ?? '');
    } catch (error) { if (!controller.signal.aborted) setFailure(error instanceof Error && ['UNAUTHENTICATED', 'SESSION_EXPIRED', 'SESSION_REVOKED', 'FORBIDDEN'].includes(error.message) ? 'Votre accès doit être vérifié. Revenez à votre espace restaurant.' : 'Identification indisponible. Vous pouvez continuer manuellement.'); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }, [site]);
  const scanned = useCallback((value: string) => { setCamera(false); setCode(value); void lookup(value); }, [lookup]);
  function submit(event: FormEvent) { event.preventDefault(); setCamera(false); void lookup(code); }
  function openManual() { request.current?.abort(); setBusy(false); setCamera(false); setManual(true); setPreview(false); setMatched(false); }
  function local(index: number) { const candidate = result?.localCandidates[index]; if (!candidate) return; setName(candidate.name); setPresentation(candidate.presentation); setManual(true); setMatched(false); setPreview(false); }
  return <div id="identify" className="identification" aria-labelledby="identify-title"><div className="identify-title"><span className="product-symbol"><Icon name="barcode" /></span><div><p className="eyebrow">Avant la réception</p><h2 id="identify-title">Identifier un produit</h2></div><span className="badge">Sans effet sur le stock</span></div>
    <p className="lookup-intro">Lisez ou saisissez le code, puis comparez la référence à l’emballage réel.</p>
    <form onSubmit={submit} className="identify-form"><label htmlFor="lookup-code">Code-barres<input id="lookup-code" inputMode="numeric" autoComplete="off" maxLength={14} value={code} onChange={event => { request.current?.abort(); setBusy(false); setCamera(false); setCode(event.target.value); setResult(null); setFailure(''); setPreview(false); setManual(false); setMatched(false); setName(''); setPresentation(''); }} placeholder="Ex. 0012345678905" /></label><button type="submit" disabled={busy}>{busy ? 'Recherche…' : 'Rechercher le produit'}</button><button type="button" className="lookup-secondary" onClick={() => setCamera(value => !value)}>{camera ? 'Masquer la caméra' : 'Lire avec la caméra'}</button></form>
    <div className="lookup-help"><span>Codes de test (mode exemples) : 0012345678905 · 0000000000123 (incomplet) · 9999999999999 (panne)</span><button type="button" onClick={openManual}>Saisir sans code / depuis l’étiquette</button></div>
    {camera && <Scanner onRead={scanned} onClose={() => setCamera(false)} />}
    {busy && <p role="status" className="lookup-status">Recherche de la référence. Aucun lot ni quantité ne sera déduit du code.</p>}
    {failure && <div role="alert" className="lookup-status"><strong>{failure}</strong><a href="/workspace">Vérifier mon accès</a></div>}
    {result && <div className="lookup-result"><div className="lookup-result-heading"><h3>{({found:'Référence trouvée',incomplete:'Référence à compléter',absent:'Produit absent de la source',unavailable:'Source indisponible'})[result.state]}</h3><span className="badge">{result.source?.synthetic ? 'Exemple synthétique' : result.source ? 'Données externes à vérifier' : 'Alternative manuelle disponible'}</span></div>
      <p className="lookup-small">Code saisi : <span className="barcode">{result.barcode}</span></p>
      {result.reason && <p>La source ne peut pas répondre maintenant{result.retryAfterSeconds ? ` ; réessayez dans ${result.retryAfterSeconds} secondes` : ''}. La saisie manuelle reste disponible.</p>}
      {result.product && <>
        <div className="lookup-product-overview">
          <ProductReferencePhoto key={result.product.imageUrl ?? result.barcode} url={result.product.imageUrl} source="open_food_facts" sourceUrl={result.source?.url} />
          <div className="lookup-product-summary"><p className="eyebrow">{result.product.brands.value ?? 'Marque inconnue'}</p><h4>{result.product.name.value ?? 'Nom du produit à compléter'}</h4><p className="lookup-presentation">{result.product.presentation.value ?? 'Présentation à vérifier sur l’étiquette'}</p><p className="lookup-match-note">Comparez le nom, le format et la photo à votre emballage.</p></div>
        </div>
        <section className="lookup-allergen-panel" aria-label="Allergènes déclarés"><div className="lookup-section-heading"><Icon name="shield" /><h4>Allergènes déclarés</h4><span>À vérifier</span></div>{result.product.allergens.value ? <ul className="lookup-allergen-tags">{result.product.allergens.value.split(', ').map(tag => <li key={tag}>{allergenNames[tag] ?? tag}</li>)}</ul> : <p className="lookup-unknown">Information inconnue dans la source</p>}<p className="lookup-small">Vérifiez l’étiquette, y compris les traces éventuelles. Une information absente ne signifie pas « sans allergènes ».</p></section>
        <section className="lookup-nutrition" aria-label="Nutrition déclarée"><h4>Nutrition déclarée</h4><p>{result.product.nutrition.value ?? 'Information inconnue — à vérifier sur l’étiquette'}</p></section>
      </>}
      {result.missing.length > 0 && <p className="lookup-warning">Informations manquantes : {result.missing.map(key => labels[key as keyof typeof labels] ?? key).join(', ')}. Une absence d’allergènes dans la source ne signifie pas « sans allergènes ».</p>}
      {result.source && <details className="lookup-provenance"><summary>Source et traçabilité <span>Open Food Facts</span></summary><p className="lookup-source">Source : <a href={result.source.url} target="_blank" rel="noopener noreferrer">Open Food Facts</a> · API {result.source.apiVersion} · consulté le {new Date(result.source.retrievedAt).toLocaleString('fr-FR')}{result.source.cached ? ' · cache public' : ''}{result.source.sourceUpdatedAt ? ` · source modifiée le ${new Date(result.source.sourceUpdatedAt).toLocaleDateString('fr-FR')}` : ' · date de modification inconnue'}. Données importées, non validées. Base sous ODbL, contenus sous DbCL. {result.source.synthetic && 'Réponse illustrative : ne décrit pas un produit vérifié.'}</p></details>}
      {result.localCandidates.length > 0 && <div className="lookup-local"><strong>Référence du restaurant pour ce code</strong>{result.localCandidates.map((candidate,index) => <button type="button" key={candidate.id} onClick={() => local(index)}>{candidate.name} — utiliser comme point de départ</button>)}</div>}
      <div className="lookup-result-action"><p>La référence correspond à votre produit ?</p><button type="button" onClick={openManual}>{result.product ? 'Vérifier / compléter depuis l’étiquette' : 'Identifier manuellement'}</button>{result.product && site.capabilities.includes('receipt.draft.write') && <button type="button" onClick={() => onStartReceipt({ name: result.product!.name.value ?? '', presentation: result.product!.presentation.value ?? '', barcode: result.barcode })}>Préparer la réception</button>}</div>
    </div>}
    {manual && <form className="manual-reference" onSubmit={event => {event.preventDefault(); setPreview(true);}}><h3>Identification locale depuis l’étiquette</h3><p className="lookup-small">Saisie temporaire : non enregistrée, effacée quand votre espace se verrouille.</p><p>Complétez uniquement ce que vous pouvez vérifier. Allergènes et nutrition restent inconnus tant qu’ils ne sont pas renseignés dans un parcours dédié.</p><label htmlFor="manual-product">Nom observé<input id="manual-product" value={name} onChange={event => {setName(event.target.value);setPreview(false);}} required maxLength={200} /></label><label htmlFor="manual-presentation">Présentation observée (facultatif)<input id="manual-presentation" value={presentation} onChange={event => {setPresentation(event.target.value);setPreview(false);}} maxLength={200} /></label><label className="physical-match"><input type="checkbox" checked={matched} required onChange={event => {setMatched(event.target.checked);setPreview(false);}} />J’ai comparé le nom, la marque et la présentation à l’emballage réel.</label><button type="submit">Prévisualiser la référence</button>{preview && <div role="status" className="lookup-preview"><strong>{name}</strong><p>{presentation || 'Présentation inconnue'} · {code || 'Sans code-barres'}</p><p>Correspondance indiquée par vous, non enregistrée. Aucun produit, lot, date, quantité ou mouvement de stock n’a été créé.</p><p>Allergènes et nutrition : non validés. Ne pas utiliser cette prévisualisation comme validation sanitaire.</p>{site.capabilities.includes('receipt.draft.write') && <button type="button" onClick={() => onStartReceipt({ name, presentation, barcode: /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code) ? code : null })}>Préparer la réception</button>}</div>}</form>}
  </div>;
}
