import { SetMetadata } from "@nestjs/common";

export const TENANT_ARG_KEY = "tenantArgPath";

export const TenantArg = (path: string) => SetMetadata(TENANT_ARG_KEY, path);
