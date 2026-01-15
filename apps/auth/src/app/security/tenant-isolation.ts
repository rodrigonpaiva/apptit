import type {
  RpcErr,
  SessionContext,
  ValidateSessionPayload,
} from "@apptit/contracts";

export function assertTenantIsolation(
  payload: ValidateSessionPayload,
  context: SessionContext,
): RpcErr | null {
  const tenantHint = (payload as Record<string, unknown>).tenantId;
  if (tenantHint === undefined || tenantHint === null) {
    return null;
  }
  if (tenantHint === context.tenantId) {
    return null;
  }
  return {
    ok: false,
    error: { code: "TENANT_MISMATCH", message: "Tenant mismatch" },
  };
}
