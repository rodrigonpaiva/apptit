export interface SessionContext {
  userId: string;
  tenantId: string;
  role: "OWNER" | "ADMIN" | "MANAGER" | "STAFF";
}

export interface ValidateSessionPort {
  execute(input: { cookie?: string; authorization?: string }): Promise<{
    isValid: boolean;
    context?: SessionContext;
  }>;
}
