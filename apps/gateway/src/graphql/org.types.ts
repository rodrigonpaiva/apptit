import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class OrganizationSummaryType {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field(() => String, { nullable: true })
  logo?: string | null;
}

@ObjectType()
export class MemberType {
  @Field()
  id!: string;

  @Field()
  userId!: string;

  @Field()
  role!: string;
}

@ObjectType()
export class MemberConnectionType {
  @Field(() => [MemberType])
  members!: MemberType[];

  @Field(() => Number, { nullable: true })
  total?: number;
}

@ObjectType()
export class ActiveOrgResultType {
  @Field(() => String, { nullable: true })
  activeOrganizationId!: string | null;
}

@ObjectType()
export class InvitationResultType {
  @Field()
  invitationId!: string;
}

@ObjectType()
export class MutationStatusType {
  @Field()
  status!: string;
}

@ObjectType()
export class MemberUpdateResultType {
  @Field()
  memberId!: string;
}

@ObjectType()
export class LeaveOrgResultType {
  @Field()
  left!: boolean;
}
