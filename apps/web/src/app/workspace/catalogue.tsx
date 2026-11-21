'use client';
import { Button } from '@apptit/ui/components/button';
import { Input } from '@apptit/ui/components/input';
import { Label } from '@apptit/ui/components/label';
import { Badge } from '@apptit/ui/components/badge';
import { Card } from '@apptit/ui/components/card';
import { Alert } from '@apptit/ui/components/alert';
import { Skeleton } from '@apptit/ui/components/skeleton';
import { useEffect, useRef, useState } from 'react';
import type { CataloguePage, SiteAccess } from '@apptit/contracts';
import { readCatalogue } from '../../lib/catalogue';
import { fr } from '../../i18n/fr';
import Icon from './workspace-icon';
export default function Catalogue({ site }: { site: SiteAccess }) {
  const [page, setPage] = useState<CataloguePage | null>(null);
  const [failure, setFailure] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (page && attempt > 0) searchRef.current?.focus();
  }, [page, attempt]);
  useEffect(() => {
    const controller = new AbortController();
    setPage(null);
    setFailure('');
    void readCatalogue(site, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setPage(value);
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setFailure(error instanceof Error ? error.message : 'UNAVAILABLE');
      });
    return () => controller.abort();
  }, [site, attempt]);
  const denied = ['UNAUTHENTICATED', 'SESSION_EXPIRED', 'SESSION_REVOKED', 'FORBIDDEN'].includes(
    failure,
  );
  function clearSearch() {
    setSearch('');
    searchRef.current?.focus();
  }
  const query = search.trim().toLocaleLowerCase('fr');
  const items =
    page?.items.filter((item) =>
      [item.name, item.presentation, item.barcode ?? ''].some((value) =>
        value.toLocaleLowerCase('fr').includes(query),
      ),
    ) ?? [];
  return (
    <div
      id="catalogue"
      className="catalogue"
      aria-labelledby="catalogue-title"
      aria-busy={!page && !failure}
    >
      <div className="catalogue-heading">
        <div>
          <p className="eyebrow">
            <span />
            Mon restaurant · Catalogue privé
          </p>
          <h1 id="catalogue-title">
            Les bonnes références.
            <br />
            <span>À portée de main.</span>
          </h1>
          <p className="catalogue-description">
            Retrouvez les produits de votre cuisine, simplement.
          </p>
        </div>
        <div className="catalogue-emblem" aria-hidden="true">
          <Icon name="package" />
          <span>LE SENS DU DÉTAIL</span>
        </div>
      </div>
      <div className="catalogue-notice">
        <Icon name="package" />
        <p>
          <strong>Un catalogue de références.</strong> Les présentations décrivent les produits.
          Cette liste ne confirme ni lot reçu ni quantité en stock.
        </p>
        <span>Lecture seule</span>
      </div>
      {failure ? (
        <Alert variant="destructive" className="catalogue-status">
          <h3>{denied ? 'Accès à vérifier' : 'Catalogue indisponible'}</h3>
          <p>
            {denied
              ? 'Votre session ou vos droits ont changé. Vérifiez votre accès avant de continuer.'
              : 'Impossible de charger les produits. Vos données ne sont pas affichées comme une liste vide.'}
          </p>
          <Button onClick={() => setAttempt((value) => value + 1)}>Réessayer</Button>
          {denied && (
            <a className="secondary-link" href="/workspace">
              Vérifier mon accès
            </a>
          )}
        </Alert>
      ) : !page ? (
        <Card className="catalogue-status" role="status">
          <h3>Chargement des produits…</h3>
          <p>Vérification de votre accès au restaurant.</p>
          <div className="grid gap-3" aria-hidden="true">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      ) : (
        <>
          <div className="catalogue-toolbar">
            <div className="catalogue-section-title">
              <h2>Références produits</h2>
              <Badge
                variant="secondary"
                className="reference-total"
                aria-label={`${page.items.length} références chargées`}
              >
                {String(page.items.length).padStart(2, '0')}
                {page.hasMore ? '+' : ''}
              </Badge>
            </div>
            <div className="catalogue-search">
              <Label className="visually-hidden" htmlFor="product-search">
                Rechercher par nom, présentation ou code-barres
              </Label>
              <Icon name="search" />
              <Input
                ref={searchRef}
                className="pl-11 pr-14"
                id="product-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nom, présentation, code-barres…"
                maxLength={200}
              />
              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="search-clear absolute right-0 top-0 p-2"
                  aria-label="Effacer la recherche"
                  onClick={clearSearch}
                >
                  <Icon name="close" />
                </Button>
              )}
            </div>
          </div>
          <div className="catalogue-results-meta">
            <p className="catalogue-count" role="status">
              {items.length} référence{items.length === 1 ? '' : 's'} affichée
              {items.length === 1 ? '' : 's'}
              {page.hasMore ? ' · recherche limitée aux 100 premières références' : ''}
            </p>
            <span>Classées par nom</span>
          </div>
          {!items.length ? (
            <Card className="catalogue-status">
              <h3>
                {page.items.length ? 'Aucun résultat' : 'Aucune référence pour ce restaurant'}
              </h3>
              <p>
                {page.items.length
                  ? 'Essayez un autre nom ou code-barres.'
                  : 'Aucun produit de référence n’a encore été ajouté. Cela ne représente pas un inventaire de stock.'}
              </p>
              {search && <Button onClick={clearSearch}>Effacer la recherche</Button>}
            </Card>
          ) : (
            <ul className="product-list" aria-label="Références produits">
              {items.map((item) => (
                <li key={item.reference?.presentationId ?? item.id} className="min-w-0">
                  <Card className="product-card h-full">
                    <div className="product-card-top">
                      <span className="product-symbol">
                        <Icon name="package" />
                      </span>
                      <Badge variant="outline" className="product-kind">
                        {item.reviewState === 'unreviewed'
                          ? fr.reference.catalogueUnreviewed
                          : 'Référence produit'}
                      </Badge>
                    </div>
                    <h3>{item.name}</h3>
                    <p className="product-presentation">{item.presentation}</p>
                    <dl className="product-code">
                      <dt>
                        <Icon name="barcode" />
                        Code-barres (texte)
                      </dt>
                      <dd className={item.barcode ? 'barcode' : 'barcode-missing'}>
                        {item.barcode ?? 'Sans code-barres renseigné'}
                      </dd>
                    </dl>
                    <p className="product-footnote">
                      <span aria-hidden="true" />
                      Lot et disponibilité non renseignés
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
