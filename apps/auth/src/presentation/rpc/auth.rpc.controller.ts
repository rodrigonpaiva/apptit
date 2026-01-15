import { Controller, Inject } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import type {
  AcceptInvitePayload,
  AcceptInviteRpcResponse,
  GetActiveOrgPayload,
  GetActiveOrgRpcResponse,
  InviteMemberPayload,
  InviteMemberRpcResponse,
  LeaveOrgPayload,
  LeaveOrgRpcResponse,
  ListMembersPayload,
  ListMembersRpcResponse,
  ListOrgsPayload,
  ListOrgsRpcResponse,
  MeResult,
  RpcResponse,
  RejectInvitePayload,
  RejectInviteRpcResponse,
  SetActiveOrgPayload,
  SetActiveOrgRpcResponse,
  UpdateMemberRolePayload,
  UpdateMemberRoleRpcResponse,
  ValidateSessionRpcResponse,
  ValidateSessionPayload,
} from "@apptit/contracts";
import {
  AUTH_ACCEPT_INVITE,
  AUTH_GET_ACTIVE_ORG,
  AUTH_INVITE_MEMBER,
  AUTH_LEAVE_ORG,
  AUTH_LIST_MEMBERS,
  AUTH_LIST_ORGS,
  AUTH_ME,
  AUTH_REJECT_INVITE,
  AUTH_SET_ACTIVE_ORG,
  AUTH_UPDATE_MEMBER_ROLE,
  AUTH_VALIDATE_SESSION,
} from "@apptit/contracts";
import { MeUseCase } from "../../app/use-cases/me.use-case";
import type { ValidateSessionPort } from "../../app/ports/session.port";
import { VALIDATE_SESSION_PORT } from "../../app/ports/session.port";
import type { SetActiveOrgPort } from "../../app/ports/organization.port";
import { SET_ACTIVE_ORG_PORT } from "../../app/ports/organization.port";
import type { ListOrgsPort } from "../../app/ports/list-orgs.port";
import { LIST_ORGS_PORT } from "../../app/ports/list-orgs.port";
import type { GetActiveOrgPort } from "../../app/ports/get-active-org.port";
import { GET_ACTIVE_ORG_PORT } from "../../app/ports/get-active-org.port";
import type { ListMembersPort } from "../../app/ports/list-members.port";
import { LIST_MEMBERS_PORT } from "../../app/ports/list-members.port";
import type { InviteMemberPort } from "../../app/ports/invite-member.port";
import { INVITE_MEMBER_PORT } from "../../app/ports/invite-member.port";
import type { AcceptInvitePort } from "../../app/ports/accept-invite.port";
import { ACCEPT_INVITE_PORT } from "../../app/ports/accept-invite.port";
import type { RejectInvitePort } from "../../app/ports/reject-invite.port";
import { REJECT_INVITE_PORT } from "../../app/ports/reject-invite.port";
import type { UpdateMemberRolePort } from "../../app/ports/update-member-role.port";
import { UPDATE_MEMBER_ROLE_PORT } from "../../app/ports/update-member-role.port";
import type { LeaveOrgPort } from "../../app/ports/leave-org.port";
import { LEAVE_ORG_PORT } from "../../app/ports/leave-org.port";

@Controller()
export class AuthRpcController {
  constructor(
    private readonly meUseCase: MeUseCase,
    @Inject(VALIDATE_SESSION_PORT)
    private readonly validateSession: ValidateSessionPort,
    @Inject(SET_ACTIVE_ORG_PORT)
    private readonly setActiveOrg: SetActiveOrgPort,
    @Inject(LIST_ORGS_PORT)
    private readonly listOrgs: ListOrgsPort,
    @Inject(GET_ACTIVE_ORG_PORT)
    private readonly getActiveOrg: GetActiveOrgPort,
    @Inject(LIST_MEMBERS_PORT)
    private readonly listMembers: ListMembersPort,
    @Inject(INVITE_MEMBER_PORT)
    private readonly inviteMember: InviteMemberPort,
    @Inject(ACCEPT_INVITE_PORT)
    private readonly acceptInvite: AcceptInvitePort,
    @Inject(REJECT_INVITE_PORT)
    private readonly rejectInvite: RejectInvitePort,
    @Inject(UPDATE_MEMBER_ROLE_PORT)
    private readonly updateMemberRole: UpdateMemberRolePort,
    @Inject(LEAVE_ORG_PORT)
    private readonly leaveOrg: LeaveOrgPort,
  ) {}

  @MessagePattern(AUTH_ME)
  me(payload: ValidateSessionPayload): Promise<RpcResponse<MeResult>> {
    return this.meUseCase.execute(payload);
  }

  @MessagePattern(AUTH_VALIDATE_SESSION)
  async validate(
    payload: ValidateSessionPayload,
  ): Promise<ValidateSessionRpcResponse> {
    const result = await this.validateSession.execute(payload);
    if (!result.isValid) {
      return {
        ok: false,
        error: { code: "INVALID_SESSION", message: "Invalid session" },
      };
    }
    return { ok: true, data: result };
  }

  @MessagePattern(AUTH_SET_ACTIVE_ORG)
  setActiveOrgHandler(
    payload: SetActiveOrgPayload,
  ): Promise<SetActiveOrgRpcResponse> {
    return this.setActiveOrg.execute(payload);
  }

  @MessagePattern(AUTH_LIST_ORGS)
  listOrgsHandler(payload: ListOrgsPayload): Promise<ListOrgsRpcResponse> {
    return this.listOrgs.execute(payload);
  }

  @MessagePattern(AUTH_GET_ACTIVE_ORG)
  getActiveOrgHandler(
    payload: GetActiveOrgPayload,
  ): Promise<GetActiveOrgRpcResponse> {
    return this.getActiveOrg.execute(payload);
  }

  @MessagePattern(AUTH_LIST_MEMBERS)
  listMembersHandler(
    payload: ListMembersPayload,
  ): Promise<ListMembersRpcResponse> {
    return this.listMembers.execute(payload);
  }

  @MessagePattern(AUTH_INVITE_MEMBER)
  inviteMemberHandler(
    payload: InviteMemberPayload,
  ): Promise<InviteMemberRpcResponse> {
    return this.inviteMember.execute(payload);
  }

  @MessagePattern(AUTH_ACCEPT_INVITE)
  acceptInviteHandler(
    payload: AcceptInvitePayload,
  ): Promise<AcceptInviteRpcResponse> {
    return this.acceptInvite.execute(payload);
  }

  @MessagePattern(AUTH_REJECT_INVITE)
  rejectInviteHandler(
    payload: RejectInvitePayload,
  ): Promise<RejectInviteRpcResponse> {
    return this.rejectInvite.execute(payload);
  }

  @MessagePattern(AUTH_UPDATE_MEMBER_ROLE)
  updateMemberRoleHandler(
    payload: UpdateMemberRolePayload,
  ): Promise<UpdateMemberRoleRpcResponse> {
    return this.updateMemberRole.execute(payload);
  }

  @MessagePattern(AUTH_LEAVE_ORG)
  leaveOrgHandler(payload: LeaveOrgPayload): Promise<LeaveOrgRpcResponse> {
    return this.leaveOrg.execute(payload);
  }
}
