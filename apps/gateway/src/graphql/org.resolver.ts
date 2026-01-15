import { Resolver, Query, Mutation, Args, Context, Directive } from "@nestjs/graphql";
import type { GraphqlContext } from "../auth/auth.context";
import { AuthClientService } from "../auth/auth.client";
import {
  ActiveOrgResultType,
  InvitationResultType,
  LeaveOrgResultType,
  MemberConnectionType,
  MemberUpdateResultType,
  OrganizationSummaryType,
  MutationStatusType,
} from "./org.types";
import {
  InviteMemberInput,
  OrgLookupInput,
  SetActiveOrgInput,
  UpdateMemberRoleInput,
} from "./org.inputs";

@Resolver()
export class OrgResolver {
  constructor(private readonly authClient: AuthClientService) {}

  @Query(() => [OrganizationSummaryType])
  async organizations(
    @Context() ctx: GraphqlContext,
  ): Promise<OrganizationSummaryType[]> {
    const result = await this.authClient.listOrgs(sessionPayload(ctx));
    return result.ok ? result.data.organizations : [];
  }

  @Query(() => OrganizationSummaryType, { nullable: true })
  async activeOrganization(
    @Context() ctx: GraphqlContext,
  ): Promise<OrganizationSummaryType | null> {
    const result = await this.authClient.getActiveOrg(sessionPayload(ctx));
    return result.ok ? result.data.organization : null;
  }

  @Query(() => MemberConnectionType)
  async organizationMembers(
    @Context() ctx: GraphqlContext,
    @Args("input", { nullable: true }) input?: OrgLookupInput,
  ): Promise<MemberConnectionType> {
    const result = await this.authClient.listMembers({
      ...sessionPayload(ctx),
      organizationId: input?.organizationId,
      organizationSlug: input?.organizationSlug,
    });
    return result.ok
      ? { members: result.data.members, total: result.data.total }
      : { members: [], total: 0 };
  }

  @Mutation(() => ActiveOrgResultType)
  async setActiveOrganization(
    @Context() ctx: GraphqlContext,
    @Args("input") input: SetActiveOrgInput,
  ): Promise<ActiveOrgResultType> {
    const result = await this.authClient.setActiveOrg({
      ...sessionPayload(ctx),
      organizationId:
        input.organizationId === undefined ? undefined : input.organizationId,
      organizationSlug: input.organizationSlug,
    });
    return result.ok
      ? { activeOrganizationId: result.data.activeOrganizationId }
      : { activeOrganizationId: null };
  }

  @Directive('@roles(requires: ["OWNER","ADMIN","MANAGER"])')
  @Mutation(() => InvitationResultType)
  async inviteMember(
    @Context() ctx: GraphqlContext,
    @Args("input") input: InviteMemberInput,
  ): Promise<InvitationResultType> {
    const result = await this.authClient.inviteMember({
      ...sessionPayload(ctx),
      email: input.email,
      role: input.role,
      organizationId: input.organizationId,
    });
    return { invitationId: result.ok ? result.data.invitationId : "" };
  }

  @Mutation(() => MutationStatusType)
  async acceptInvite(
    @Context() ctx: GraphqlContext,
    @Args("invitationId") invitationId: string,
  ): Promise<MutationStatusType> {
    const result = await this.authClient.acceptInvite({
      ...sessionPayload(ctx),
      invitationId,
    });
    return { status: result.ok ? result.data.status : "error" };
  }

  @Mutation(() => MutationStatusType)
  async rejectInvite(
    @Context() ctx: GraphqlContext,
    @Args("invitationId") invitationId: string,
  ): Promise<MutationStatusType> {
    const result = await this.authClient.rejectInvite({
      ...sessionPayload(ctx),
      invitationId,
    });
    return { status: result.ok ? result.data.status : "error" };
  }

  @Directive('@roles(requires: ["OWNER","ADMIN","MANAGER"])')
  @Mutation(() => MemberUpdateResultType)
  async updateMemberRole(
    @Context() ctx: GraphqlContext,
    @Args("input") input: UpdateMemberRoleInput,
  ): Promise<MemberUpdateResultType> {
    const result = await this.authClient.updateMemberRole({
      ...sessionPayload(ctx),
      memberId: input.memberId,
      role: input.role,
      organizationId: input.organizationId,
    });
    return { memberId: result.ok ? result.data.memberId : "" };
  }

  @Mutation(() => LeaveOrgResultType)
  async leaveOrganization(
    @Context() ctx: GraphqlContext,
    @Args("organizationId") organizationId: string,
  ): Promise<LeaveOrgResultType> {
    const result = await this.authClient.leaveOrg({
      ...sessionPayload(ctx),
      organizationId,
    });
    return { left: !!result.ok && result.data.left };
  }
}

function sessionPayload(ctx: GraphqlContext): {
  cookie?: string;
  authorization?: string;
  requestId?: string;
} {
  return {
    cookie: headerValue(ctx.headers, "cookie"),
    authorization: headerValue(ctx.headers, "authorization"),
    requestId: ctx.requestId,
  };
}

function headerValue(
  headers: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = headers[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
