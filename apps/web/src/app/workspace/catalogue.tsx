'use client';
import { useEffect, useState } from 'react';
import type { CataloguePage, SiteAccess } from '@apptit/contracts';
import { readCatalogue } from '../../lib/catalogue';
import Icon from './workspace-icon';
export default function Catalogue({ site }: { site: SiteAccess }) {
  const [page, setPage] = useState<CataloguePage | null>(null);
  const [failure, setFailure] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setPage(null); setFailure('');
    void readCatalogue(site, controller.signal).then(value => { if (!controller.signal.aborted) setPage(value); }).catch(error => {
      if (!controller.signal.aborted) setFailure(error instanceof Error ? error.message : 'UNAVAILABLE');
    });
    return () => controller.abort();
  }, [site, attempt]);
  const denied = ['UNAUTHENTICATED', 'SESSION_EXPIRED', 'SESSION_REVOKED', 'FORBIDDEN'].includes(failure);
  const query = search.trim().toLocaleLowerCase('fr');
  const items = page?.items.filter(item => [item.name, item.presentation, item.barcode ?? ''].some(value => value.toLocaleLowerCase('fr').includes(query))) ?? [];
  return <div id="catalogue" className="catalogue" aria-labelledby="catalogue-title">
    <div className="catalogue-heading"><div><p className="eyebrow"><span />Mon restaurant · Catalogue privé</p><h1 id="catalogue-title">Les bonnes références.<br /><span>À portée de main.</span></h1><p className="catalogue-description">Retrouvez les produits de votre cuisine, simplement.</p></div><div className="catalogue-emblem" aria-hidden="true"><Icon name="package" /><span>LE SENS DU DÉTAIL</span></div></div>
    <div className="catalogue-notice"><Icon name="package" /><p><strong>Un catalogue de références.</strong> Les présentations décrivent les produits. Cette liste ne confirme ni lot reçu ni quantité en stock.</p><span>Lecture seule</span></div>
    {failure ? <div className="catalogue-status" role="alert"><h3>{denied ? 'Accès à vérifier' : 'Catalogue indisponible'}</h3><p>{denied ? 'Votre session ou vos droits ont changé. Vérifiez votre accès avant de continuer.' : 'Impossible de charger les produits. Vos données ne sont pas affichées comme une liste vide.'}</p><button onClick={() => setAttempt(value => value + 1)}>Réessayer</button>{denied && <a className="secondary-link" href="/workspace">Vérifier mon accès</a>}</div> : !page ? <div className="catalogue-status" role="status"><h3>Chargement des produits…</h3><p>Vérification de votre accès au restaurant.</p></div> : <>
      <div className="catalogue-toolbar"><div className="catalogue-section-title"><h2>Références produits</h2><span className="reference-total" aria-label={`${page.items.length} références chargées`}>{String(page.items.length).padStart(2, '0')}{page.hasMore ? '+' : ''}</span></div><div className="catalogue-search"><label className="visually-hidden" htmlFor="product-search">Rechercher par nom, présentation ou code-barres</label><Icon name="search" /><input id="product-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nom, présentation, code-barres…" maxLength={200} />{search && <button type="button" className="search-clear" aria-label="Effacer la recherche" onClick={() => setSearch('')}><Icon name="close" /></button>}</div></div>
      <div className="catalogue-results-meta"><p className="catalogue-count" role="status">{items.length} référence{items.length === 1 ? '' : 's'} affichée{items.length === 1 ? '' : 's'}{page.hasMore ? ' · recherche limitée aux 100 premières références' : ''}</p><span>Classées par nom</span></div>
      {!items.length ? <div className="catalogue-status"><h3>{page.items.length ? 'Aucun résultat' : 'Aucune référence pour ce restaurant'}</h3><p>{page.items.length ? 'Essayez un autre nom ou code-barres.' : 'Aucun produit de référence n’a encore été ajouté. Cela ne représente pas un inventaire de stock.'}</p>{search && <button onClick={() => setSearch('')}>Effacer la recherche</button>}</div> : <ul className="product-list">{items.map(item => <li key={item.id} className="product-card"><div className="product-card-top"><span className="product-symbol"><Icon name="package" /></span><span className="product-kind">Référence produit</span></div><h3>{item.name}</h3><p className="product-presentation">{item.presentation}</p><dl className="product-code"><dt><Icon name="barcode" />Code-barres (texte)</dt><dd className={item.barcode ? 'barcode' : 'barcode-missing'}>{item.barcode ?? 'Sans code-barres renseigné'}</dd></dl><p className="product-footnote"><span aria-hidden="true" />Lot et disponibilité non renseignés</p></li>)}</ul>}
    </>}
  </div>;
}
