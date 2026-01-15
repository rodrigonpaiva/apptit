import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class InvoiceSummaryType {
  @Field()
  id!: string;

  @Field()
  number!: string;

  @Field()
  status!: string;

  @Field(() => Number)
  amount!: number;

  @Field()
  currency!: string;

  @Field()
  issuedAt!: string;

  @Field(() => String, { nullable: true })
  dueAt?: string | null;
}

@ObjectType()
export class InvoiceConnectionType {
  @Field(() => [InvoiceSummaryType])
  invoices!: InvoiceSummaryType[];

  @Field(() => Number, { nullable: true })
  total?: number;
}
