import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class OrderSummaryType {
  @Field()
  id!: string;

  @Field()
  number!: string;

  @Field()
  status!: string;

  @Field(() => Number)
  total!: number;

  @Field()
  currency!: string;

  @Field()
  createdAt!: string;
}

@ObjectType()
export class OrderConnectionType {
  @Field(() => [OrderSummaryType])
  orders!: OrderSummaryType[];

  @Field(() => Number, { nullable: true })
  total?: number;
}
