import { createHash, randomUUID } from 'node:crypto';
import type { AuthorizedSiteContext, ProductReferenceResolution, ReceiptProductIdentity } from '@apptit/contracts';
import { object, scope, text, uuid, productBarcode } from '@apptit/domain-values';
import type { PrismaClient, Prisma } from '../generated/prisma/client.js';
import { ReceiptFailure } from './receipt-workspace.js';
export function productReference(value: unknown): ReceiptProductIdentity {
  const input = object(value, ['productId', 'presentationId', 'presentationVersion'], 'reference');
  if (!Number.isSafeInteger(input['presentationVersion']) || (input['presentationVersion'] as number) < 1 || (input['presentationVersion'] as number) > 2147483645) throw new ReceiptFailure('INVALID_REFERENCE', 400);
  return { productId: uuid(input['productId'], 'productId'), presentationId: uuid(input['presentationId'], 'presentationId'), presentationVersion: input['presentationVersion'] as number };
}
export async function validateProductReference(db: Pick<Prisma.TransactionClient, 'productPresentation' | '$queryRaw'>, requested: { tenantId: string; siteId: string }, reference: ReceiptProductIdentity) {
  await db.$queryRaw`SELECT id FROM "CatalogueProduct" WHERE id=${reference.productId}::uuid AND "tenantId"=${requested.tenantId}::uuid AND "siteId"=${requested.siteId}::uuid FOR SHARE`;
  await db.$queryRaw`SELECT id FROM "ProductPresentation" WHERE id=${reference.presentationId}::uuid AND "tenantId"=${requested.tenantId}::uuid AND "siteId"=${requested.siteId}::uuid FOR SHARE`;
  const row = await db.productPresentation.findFirst({ where: { ...requested, id: reference.presentationId, productId: reference.productId, isActive: true, product: { isActive: true } } });
  if (!row) throw new ReceiptFailure('INVALID_REFERENCE', 400);
  if (row.version !== reference.presentationVersion) throw new ReceiptFailure('REFERENCE_VERSION_CONFLICT', 409);
  return row;
}
const identity = (row: { id: string; productId: string; version: number }): ReceiptProductIdentity => ({ productId: row.productId, presentationId: row.id, presentationVersion: row.version });
export class ProductReferences {
  constructor(private readonly db: PrismaClient) {}
  async resolve(input: unknown, context: AuthorizedSiteContext): Promise<ProductReferenceResolution> {
    const value = object(input, ['scope', 'operationId', 'selection', 'name', 'presentation', 'barcode'], 'reference');
    const requested = scope(value['scope']);
    if (!context.capabilities.includes('receipt.draft.write') || requested.tenantId !== context.scope.tenantId || requested.siteId !== context.scope.siteId) throw new ReceiptFailure('FORBIDDEN', 403);
    const operationId = uuid(value['operationId'], 'operationId'), name = text(value['name'], 'name', 200), presentation = text(value['presentation'], 'presentation', 200);
    const barcode = value['barcode'] === null ? null : productBarcode(value['barcode']);
    const selection = value['selection'] === null ? null : productReference(value['selection']);
    const intentHash = createHash('sha256').update(JSON.stringify({ requested, name, presentation, barcode, selection })).digest('hex');
    const key = { ...requested, actorId: context.actor.userId, operationId };
    return this.db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`reference-operation:${requested.tenantId}:${requested.siteId}:${context.actor.userId}:${operationId}`},0))`;
      const prior = await tx.productReferenceOperation.findUnique({ where: { tenantId_siteId_actorId_operationId: key } });
      if (prior) {
        if (prior.intentHash !== intentHash) throw new ReceiptFailure('IDEMPOTENCY_MISMATCH', 409);
        const result = prior.result as unknown as ProductReferenceResolution;
        return { reference: result.reference, reviewState: 'unreviewed' };
      }
      let reference: ReceiptProductIdentity, action: string;
      if (selection) {
        const selected = await validateProductReference(tx, requested, selection);
        if (barcode !== null && selected.barcode !== barcode) throw new ReceiptFailure('REFERENCE_MISMATCH', 409);
        reference = identity(selected); action = 'selected';
      } else {
        if (barcode) await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`reference-barcode:${requested.tenantId}:${requested.siteId}:${barcode}`},0))`;
        const matches = barcode ? await tx.productPresentation.findMany({ where: { ...requested, barcode }, include: { product: true }, take: 2 }) : [];
        if (matches.length === 1 && (!matches[0]!.isActive || !matches[0]!.product.isActive)) throw new ReceiptFailure('INVALID_REFERENCE', 400);
        if (!matches.length && barcode && await tx.catalogueProduct.findFirst({ where: { ...requested, barcode } })) throw new ReceiptFailure('REFERENCE_SELECTION_REQUIRED', 409);
        if (matches.length > 1 || matches.length === 1 && (matches[0]!.label !== presentation || matches[0]!.product.name !== name)) throw new ReceiptFailure('REFERENCE_SELECTION_REQUIRED', 409);
        if (matches.length) { reference = identity(matches[0]!); action = 'reused'; }
        else {
          const productId = randomUUID(), id = randomUUID();
          await tx.catalogueProduct.create({ data: { id: productId, ...requested, name, presentation, barcode } });
          const row = await tx.productPresentation.create({ data: { id, productId, ...requested, label: presentation, barcode } });
          reference = identity(row); action = 'created_unreviewed';
        }
      }
      await tx.productReferenceOperation.create({ data: { ...key, sessionId: context.sessionId, correlationId: context.correlationId, recordedAt: new Date(), intentHash, result: JSON.parse(JSON.stringify({ reference, reviewState: 'unreviewed', action, observedName: name, observedPresentation: presentation, barcode })) as Prisma.InputJsonObject } });
      return { reference, reviewState: 'unreviewed' };
    });
  }
}
