import { Inject, Injectable, Logger } from "@nestjs/common";
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
  private readonly logger = new Logger(AuthClientService.name);
  private readonly cache = new Map<
    string,
    { expiresAt: number; value: unknown }
  >();
  private readonly cacheTtlMs = 5000;

  constructor(@Inject(AUTH_SERVICE) private readonly client: ClientProxy) {}

  async validateSession(
    payload: ValidateSessionPayload,
  ): Promise<RpcResponse<ValidateSessionResult>> {
    return this.timed("AUTH_VALIDATE_SESSION", payload.requestId, () =>
      firstValueFrom(
        this.client.send<RpcResponse<ValidateSessionResult>>(
          AUTH_VALIDATE_SESSION,
          payload,
        ),
      ),
    );
  }

  async me(
    payload: ValidateSessionPayload,
  ): Promise<RpcResponse<{ context: SessionContext }>> {
    const cacheKey = this.cacheKey("me", payload);
    const cached = this.getCache<RpcResponse<{ context: SessionContext }>>(
      cacheKey,
    );
    if (cached) {
      return cached;
    }
    return this.timed("AUTH_ME", payload.requestId, () =>
      firstValueFrom(
        this.client.send<RpcResponse<{ context: SessionContext }>>(
          AUTH_ME,
          payload,
        ),
      ),
    ).then((result) => this.setCache(cacheKey, result));
  }

  async listOrgs(
    payload: ListOrgsPayload,
  ): Promise<RpcResponse<ListOrgsResult>> {
    const cacheKey = this.cacheKey("organizations", payload);
    const cached = this.getCache<RpcResponse<ListOrgsResult>>(cacheKey);
    if (cached) {
      return cached;
    }
    return this.timed("AUTH_LIST_ORGS", payload.requestId, () =>
      firstValueFrom(
        this.client.send<RpcResponse<ListOrgsResult>>(AUTH_LIST_ORGS, payload),
      ),
    ).then((result) => this.setCache(cacheKey, result));
  }

  async getActiveOrg(
    payload: GetActiveOrgPayload,
  ): Promise<RpcResponse<GetActiveOrgResult>> {
    return this.timed("AUTH_GET_ACTIVE_ORG", payload.requestId, () =>
      firstValueFrom(
        this.client.send<RpcResponse<GetActiveOrgResult>>(
          AUTH_GET_ACTIVE_ORG,
          payload,
        ),
      ),
    );
  }

  async listMembers(
    payload: ListMembersPayload,
  ): Promise<RpcResponse<ListMembersResult>> {
    return this.timed("AUTH_LIST_MEMBERS", payload.requestId, () =>
      firstValueFrom(
        this.client.send<RpcResponse<ListMembersResult>>(
          AUTH_LIST_MEMBERS,
          payload,
        ),
      ),
    );
  }

  async setActiveOrg(
    payload: SetActiveOrgPayload,
  ): Promise<RpcResponse<SetActiveOrgResult>> {
    return this.timed("AUTH_SET_ACTIVE_ORG", payload.requestId, () =>
      firstValueFrom(
        this.client.send<RpcResponse<SetActiveOrgResult>>(
          AUTH_SET_ACTIVE_ORG,
          payload,
        ),
      ),
    );
  }

  async inviteMember(
    payload: InviteMemberPayload,
  ): Promise<RpcResponse<InviteMemberResult>> {
    return this.timed("AUTH_INVITE_MEMBER", payload.requestId, () =>
      firstValueFrom(
        this.client.send<RpcResponse<InviteMemberResult>>(
          AUTH_INVITE_MEMBER,
          payload,
        ),
      ),
    );
  }

  async acceptInvite(
    payload: AcceptInvitePayload,
  ): Promise<RpcResponse<AcceptInviteResult>> {
    return this.timed("AUTH_ACCEPT_INVITE", payload.requestId, () =>
      firstValueFrom(
        this.client.send<RpcResponse<AcceptInviteResult>>(
          AUTH_ACCEPT_INVITE,
          payload,
        ),
      ),
    );
  }

  async rejectInvite(
    payload: RejectInvitePayload,
  ): Promise<RpcResponse<RejectInviteResult>> {
    return this.timed("AUTH_REJECT_INVITE", payload.requestId, () =>
      firstValueFrom(
        this.client.send<RpcResponse<RejectInviteResult>>(
          AUTH_REJECT_INVITE,
          payload,
        ),
      ),
    );
  }

  async updateMemberRole(
    payload: UpdateMemberRolePayload,
  ): Promise<RpcResponse<UpdateMemberRoleResult>> {
    return this.timed("AUTH_UPDATE_MEMBER_ROLE", payload.requestId, () =>
      firstValueFrom(
        this.client.send<RpcResponse<UpdateMemberRoleResult>>(
          AUTH_UPDATE_MEMBER_ROLE,
          payload,
        ),
      ),
    );
  }

  async leaveOrg(
    payload: LeaveOrgPayload,
  ): Promise<RpcResponse<LeaveOrgResult>> {
    return this.timed("AUTH_LEAVE_ORG", payload.requestId, () =>
      firstValueFrom(
        this.client.send<RpcResponse<LeaveOrgResult>>(AUTH_LEAVE_ORG, payload),
      ),
    );
  }

  private cacheKey(
    prefix: string,
    payload: { cookie?: string; authorization?: string },
  ): string | null {
    const key = payload.cookie ?? payload.authorization;
    if (!key) {
      return null;
    }
    return `${prefix}:${key}`;
  }

  private getCache<T>(key: string | null): T | null {
    if (!key) return null;
    const cached = this.cache.get(key);
    if (!cached || cached.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return cached.value as T;
  }

  private setCache<T>(key: string | null, value: T): T {
    if (!key) return value;
    this.cache.set(key, { expiresAt: Date.now() + this.cacheTtlMs, value });
    return value;
  }

  private async timed<T>(
    pattern: string,
    requestId: string | undefined,
    fn: () => Promise<T>,
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      this.logger.log(
        `RPC ${pattern} ok in ${Date.now() - start}ms${
          requestId ? ` requestId=${requestId}` : ""
        }`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `RPC ${pattern} failed in ${Date.now() - start}ms${
          requestId ? ` requestId=${requestId}` : ""
        }`,
      );
      throw error;
    }
  }
}
