import type { AuthorizedSiteContext, CataloguePage, CatalogueProduct } from '@apptit/contracts';
import { referenceImageUrl, scope } from '@apptit/domain-values';
import { AuthFailure } from '@apptit/runtime';
import type { PrismaClient } from '../../generated/prisma/client.js';
/** Receives only server-built context; scope is never read from an untrusted product filter. */
export class CatalogueRepository {
  constructor(private readonly db: PrismaClient) {}
  async list(context: AuthorizedSiteContext): Promise<CataloguePage> {
    if (!context?.capabilities?.includes('catalogue.read')) throw new AuthFailure('FORBIDDEN', 403);
    const authorized = scope(context.scope);
    const rows = await this.db.catalogueProduct.findMany({ where: { ...authorized, isActive: true, OR: [{ presentations: { none: {} } }, { presentations: { some: { isActive: true } } }] },
      select: { id: true, name: true, presentation: true, barcode: true, imageUrl: true, presentations: { where: { isActive: true }, orderBy: { id: 'asc' }, take: 21 } },
      orderBy: [{ name: 'asc' }, { id: 'asc' }], take: 101 });
    const items = rows.slice(0, 100).flatMap<CatalogueProduct>(({ presentations, ...row }) => presentations.length ? presentations.map(presentation => ({ ...row, presentation: presentation.label, barcode: presentation.barcode, imageUrl: referenceImageUrl(row.imageUrl), reference: { productId: row.id, presentationId: presentation.id, presentationVersion: presentation.version }, reviewState: 'unreviewed' as const })) : [{ ...row, imageUrl: referenceImageUrl(row.imageUrl), reference: null, reviewState: 'unreviewed' as const }]);
    return { items: items.slice(0,100), hasMore: rows.length > 100 || items.length > 100 || rows.some(row => row.presentations.length > 20) };
  }
}
