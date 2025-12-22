export interface ValidateSessionPayload {
  cookie?: string;
  authorization?: string;
}

export interface ValidateSessionResult {
  isValid: boolean;
  context?: {
    userId: string;
    tenantId: string;
    role: string;
  };
}
