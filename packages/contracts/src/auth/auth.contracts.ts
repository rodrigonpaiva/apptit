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
}

export interface ValidateSessionResult {
  isValid: boolean;
  context?: SessionContext;
}

export interface MeResult {
  context: SessionContext;
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
