import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class OrdersListInput {
  @Field({ nullable: true })
  tenantId?: string;

  @Field(() => Number, { nullable: true })
  limit?: number;

  @Field(() => Number, { nullable: true })
  offset?: number;
}

@InputType()
export class OrderGetInput {
  @Field()
  orderId!: string;

  @Field({ nullable: true })
  tenantId?: string;
}
