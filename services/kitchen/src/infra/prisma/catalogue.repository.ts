import type { AuthorizedSiteContext, CataloguePage } from '@apptit/contracts';
import { referenceImageUrl, scope } from '@apptit/domain-values';
import { AuthFailure } from '@apptit/runtime';
import type { PrismaClient } from '../../generated/prisma/client.js';
/** Receives only server-built context; scope is never read from an untrusted product filter. */
export class CatalogueRepository {
  constructor(private readonly db: PrismaClient) {}
  async list(context: AuthorizedSiteContext): Promise<CataloguePage> {
    if (!context?.capabilities?.includes('catalogue.read')) throw new AuthFailure('FORBIDDEN', 403);
    const authorized = scope(context.scope);
    const rows = await this.db.catalogueProduct.findMany({ where: authorized,
      select: { id: true, name: true, presentation: true, barcode: true, imageUrl: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }], take: 101 });
    return { items: rows.slice(0, 100).map(row => ({ ...row, imageUrl: referenceImageUrl(row.imageUrl) })), hasMore: rows.length > 100 };
  }
}
