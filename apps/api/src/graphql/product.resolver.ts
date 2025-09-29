import { Query, Resolver } from '@nestjs/graphql';
import { Product } from './types/product.type';

@Resolver(() => Product)
export class ProductResolver {
  @Query(() => [Product])
  products(): Product[] {
    // TODO: remplacer par service/Prisma
    return [
      { id: 'p_1', name: 'Tomates', sku: 'SKU-TOM', price: 2.5 },
      { id: 'p_2', name: 'Pâtes', sku: 'SKU-PASTA', price: 1.2 },
    ];
  }
}
