//---VALIDATION---//
export const AUTH_ROLES = ["OWNER", "ADMIN", "MANAGER", "STAFF"] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export interface SessionContext {
  userId: string;
  tenantId: string;
  role: AuthRole;
}
export interface ValidateSessionPayload {
  cookie?: string;
  authorization?: string;
  requestId?: string;
}

export interface ValidateSessionResult {
  isValid: boolean;
  context?: SessionContext;
}

export interface MeResult {
  context: SessionContext;
}

export interface SetActiveOrgPayload {
  cookie?: string;
  authorization?: string;
  organizationId?: string | null;
  organizationSlug?: string;
  requestId?: string;
}

export interface SetActiveOrgResult {
  activeOrganizationId: string | null;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface AuthMember {
  id: string;
  userId: string;
  role: string;
}

export interface AuthInvitation {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  status: string;
}

export interface ListOrgsPayload {
  cookie?: string;
  authorization?: string;
  requestId?: string;
}

export interface ListOrgsResult {
  organizations: OrganizationSummary[];
}

export interface GetActiveOrgPayload {
  cookie?: string;
  authorization?: string;
  requestId?: string;
}

export interface GetActiveOrgResult {
  organization: OrganizationSummary | null;
}

export interface ListMembersPayload {
  cookie?: string;
  authorization?: string;
  organizationId?: string;
  organizationSlug?: string;
  requestId?: string;
}

export interface ListMembersResult {
  members: AuthMember[];
  total?: number;
}

export interface InviteMemberPayload {
  cookie?: string;
  authorization?: string;
  organizationId?: string;
  email: string;
  role: string | string[];
  requestId?: string;
}

export interface InviteMemberResult {
  invitationId: string;
}

export interface AcceptInvitePayload {
  cookie?: string;
  authorization?: string;
  invitationId: string;
  requestId?: string;
}

export interface AcceptInviteResult {
  status: "accepted";
}

export interface RejectInvitePayload {
  cookie?: string;
  authorization?: string;
  invitationId: string;
  requestId?: string;
}

export interface RejectInviteResult {
  status: "rejected";
}

export interface UpdateMemberRolePayload {
  cookie?: string;
  authorization?: string;
  organizationId?: string;
  memberId: string;
  role: string | string[];
  requestId?: string;
}

export interface UpdateMemberRoleResult {
  memberId: string;
}

export interface LeaveOrgPayload {
  cookie?: string;
  authorization?: string;
  organizationId: string;
  requestId?: string;
}

export interface LeaveOrgResult {
  left: true;
}

//---ERROR---//
export type AuthErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID_SESSION"
  | "TENANT_MISMATCH"
  | "INTERNAL_ERROR";

export interface AuthErrorPayload {
  code: AuthErrorCode;
  message: string;
}

//---RPC RESPONSE---//

export type RpcOk<T> = {
  ok: true;
  data: T;
};
export type RpcErr = { ok: false; error: AuthErrorPayload };

export type RpcResponse<T> = RpcOk<T> | RpcErr;

//---SIGNATURE---//
export type ValidateSessionRpcResponse = RpcResponse<ValidateSessionResult>;

export type SetActiveOrgRpcResponse = RpcResponse<SetActiveOrgResult>;

export type ListOrgsRpcResponse = RpcResponse<ListOrgsResult>;
export type GetActiveOrgRpcResponse = RpcResponse<GetActiveOrgResult>;
export type ListMembersRpcResponse = RpcResponse<ListMembersResult>;
export type InviteMemberRpcResponse = RpcResponse<InviteMemberResult>;
export type AcceptInviteRpcResponse = RpcResponse<AcceptInviteResult>;
export type RejectInviteRpcResponse = RpcResponse<RejectInviteResult>;
export type UpdateMemberRoleRpcResponse = RpcResponse<UpdateMemberRoleResult>;
export type LeaveOrgRpcResponse = RpcResponse<LeaveOrgResult>;
