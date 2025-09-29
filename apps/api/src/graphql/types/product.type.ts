import { Field, ID, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Product {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  sku!: string;

  @Field(() => Float)
  price!: number;
}
