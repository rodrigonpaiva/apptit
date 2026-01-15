import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class OrgLookupInput {
  @Field({ nullable: true })
  organizationId?: string;

  @Field({ nullable: true })
  organizationSlug?: string;
}

@InputType()
export class InviteMemberInput {
  @Field()
  email!: string;

  @Field(() => [String])
  role!: string[];

  @Field({ nullable: true })
  organizationId?: string;
}

@InputType()
export class UpdateMemberRoleInput {
  @Field()
  memberId!: string;

  @Field(() => [String])
  role!: string[];

  @Field({ nullable: true })
  organizationId?: string;
}

@InputType()
export class SetActiveOrgInput {
  @Field(() => String, { nullable: true })
  organizationId?: string | null;

  @Field(() => String, { nullable: true })
  organizationSlug?: string;
}
