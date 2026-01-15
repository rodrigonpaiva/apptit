import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class BillingListInput {
  @Field({ nullable: true })
  tenantId?: string;

  @Field(() => Number, { nullable: true })
  limit?: number;

  @Field(() => Number, { nullable: true })
  offset?: number;
}

@InputType()
export class BillingGetInput {
  @Field()
  invoiceId!: string;

  @Field({ nullable: true })
  tenantId?: string;
}
