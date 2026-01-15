import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import type {
  AcceptInvitePayload,
  AcceptInviteResult,
  GetActiveOrgPayload,
  GetActiveOrgResult,
  InviteMemberPayload,
  InviteMemberResult,
  LeaveOrgPayload,
  LeaveOrgResult,
  ListMembersPayload,
  ListMembersResult,
  ListOrgsPayload,
  ListOrgsResult,
  RejectInvitePayload,
  RejectInviteResult,
  RpcResponse,
  SessionContext,
  SetActiveOrgPayload,
  SetActiveOrgResult,
  UpdateMemberRolePayload,
  UpdateMemberRoleResult,
  ValidateSessionPayload,
  ValidateSessionResult,
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
import { AUTH_SERVICE } from "./auth.constants";

@Injectable()
export class AuthClientService {
  constructor(@Inject(AUTH_SERVICE) private readonly client: ClientProxy) {}

  async validateSession(
    payload: ValidateSessionPayload,
  ): Promise<RpcResponse<ValidateSessionResult>> {
    return firstValueFrom(
      this.client.send<RpcResponse<ValidateSessionResult>>(
        AUTH_VALIDATE_SESSION,
        payload,
      ),
    );
  }

  async me(
    payload: ValidateSessionPayload,
  ): Promise<RpcResponse<{ context: SessionContext }>> {
    return firstValueFrom(
      this.client.send<RpcResponse<{ context: SessionContext }>>(
        AUTH_ME,
        payload,
      ),
    );
  }

  async listOrgs(
    payload: ListOrgsPayload,
  ): Promise<RpcResponse<ListOrgsResult>> {
    return firstValueFrom(
      this.client.send<RpcResponse<ListOrgsResult>>(AUTH_LIST_ORGS, payload),
    );
  }

  async getActiveOrg(
    payload: GetActiveOrgPayload,
  ): Promise<RpcResponse<GetActiveOrgResult>> {
    return firstValueFrom(
      this.client.send<RpcResponse<GetActiveOrgResult>>(
        AUTH_GET_ACTIVE_ORG,
        payload,
      ),
    );
  }

  async listMembers(
    payload: ListMembersPayload,
  ): Promise<RpcResponse<ListMembersResult>> {
    return firstValueFrom(
      this.client.send<RpcResponse<ListMembersResult>>(
        AUTH_LIST_MEMBERS,
        payload,
      ),
    );
  }

  async setActiveOrg(
    payload: SetActiveOrgPayload,
  ): Promise<RpcResponse<SetActiveOrgResult>> {
    return firstValueFrom(
      this.client.send<RpcResponse<SetActiveOrgResult>>(
        AUTH_SET_ACTIVE_ORG,
        payload,
      ),
    );
  }

  async inviteMember(
    payload: InviteMemberPayload,
  ): Promise<RpcResponse<InviteMemberResult>> {
    return firstValueFrom(
      this.client.send<RpcResponse<InviteMemberResult>>(
        AUTH_INVITE_MEMBER,
        payload,
      ),
    );
  }

  async acceptInvite(
    payload: AcceptInvitePayload,
  ): Promise<RpcResponse<AcceptInviteResult>> {
    return firstValueFrom(
      this.client.send<RpcResponse<AcceptInviteResult>>(
        AUTH_ACCEPT_INVITE,
        payload,
      ),
    );
  }

  async rejectInvite(
    payload: RejectInvitePayload,
  ): Promise<RpcResponse<RejectInviteResult>> {
    return firstValueFrom(
      this.client.send<RpcResponse<RejectInviteResult>>(
        AUTH_REJECT_INVITE,
        payload,
      ),
    );
  }

  async updateMemberRole(
    payload: UpdateMemberRolePayload,
  ): Promise<RpcResponse<UpdateMemberRoleResult>> {
    return firstValueFrom(
      this.client.send<RpcResponse<UpdateMemberRoleResult>>(
        AUTH_UPDATE_MEMBER_ROLE,
        payload,
      ),
    );
  }

  async leaveOrg(
    payload: LeaveOrgPayload,
  ): Promise<RpcResponse<LeaveOrgResult>> {
    return firstValueFrom(
      this.client.send<RpcResponse<LeaveOrgResult>>(AUTH_LEAVE_ORG, payload),
    );
  }
}
