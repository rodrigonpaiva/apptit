import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SessionContextType {
  @Field()
  userId!: string;

  @Field()
  tenantId!: string;

  @Field()
  role!: string;
}
