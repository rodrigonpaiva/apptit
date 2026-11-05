# SP1-05 — Private scoped product references

Date: 2026-11-05. Kitchen owns the minimal catalogue read model. This is the bounded navigation/catalogue slice of AP-029/AP-145/AP-146, not complete inventory, receiving or product administration.

## Data and meaning

`CatalogueProduct` has an ID, tenant/site scope, name, presentation and nullable textual barcode. A commercial presentation such as a 5 kg bag is a description, never a received quantity or availability. There are no batches, receipt dates, expiry dates, stock amounts, allergens, imported provider claims or product grants in this model. Bulk references can have no barcode. Codes retain leading zeros; the synthetic fixtures are not claims of registered GTINs.

An additive transactional migration creates a separate table with scope/name ordering index and nonempty name/presentation constraints. Barcodes, if present, contain 1–64 digits stored as VARCHAR. No existing migration is edited. Kitchen's idempotent seed creates three site-A references and one distinct site-B reference, preserving existing rows on repeated seed. Identity data is not read directly by Kitchen and no cross-service database foreign key is introduced.

## API and authorization

GraphQL query:

```graphql
query Catalogue($input: SiteScopeInput!) {
  catalogue(input: $input) {
    items { id name presentation barcode }
    hasMore
  }
}
```

The browser uses its HttpOnly session cookie through the same-origin `/api/graphql` proxy. Gateway verifies `catalogue.read` with Identity before calling credential-protected Kitchen `POST /internal/v1/catalogue`, body `{scope:{tenantId,siteId}}`. Kitchen independently verifies the end-user session/capability with Identity. A service credential alone is insufficient. Forged actor/role headers are ignored. Both tenant and site from Identity's trusted context filter the database query; filtering never occurs after fetching another site's rows.

Chef, storekeeper and cook have the minimal catalogue-read capability. Revoked/expired/inactive sessions, removed membership, wrong scope and unavailable authorization dependencies fail closed using the SP1-04 boundary. No positive authorization cache is added. Missing catalogue persistence returns an unavailable error, never a successful empty list. No mutation is exposed.

Responses contain only public reference fields. Reads are no-store and bounded to the first 100 records ordered by name then ID. `hasMore` explicitly signals truncation. This small synthetic slice has no pagination; search filters only the displayed page. Full catalogue search/pagination and per-product access grants remain future work.

## Visible behavior

The protected `/workspace` displays the actual user/role and site selector, then a catalogue navigation anchor, reference cards and manual name/presentation/barcode search. No camera API or permission is used. Cards explicitly separate product references from batches and stock. Loading, empty catalogue, no search results, access denied and dependency errors have separate messages and recovery actions.

Phone layout uses one column; tablet uses two. Form/buttons have at least 48 px targets, visible focus indicators and labelled fields. This is not a complete design-system or accessibility audit.

Catalogue data exists only inside the verified workspace. Hiding the profile unmounts the catalogue on focus/visibility loss, offline, logout and site changes. Cleanup aborts reads and ignores late results. Returning to the page rechecks the session and refetches the catalogue. Site/user keys prevent showing the previous selection's items. No profile/catalogue is saved to localStorage or an offline queue.
