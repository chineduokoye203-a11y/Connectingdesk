import { headers } from "next/headers";

export class TenantNotResolvedError extends Error {
  constructor() {
    super("Tenant context could not be resolved from request headers.");
    this.name = "TenantNotResolvedError";
  }
}

export async function getTenantId(): Promise<string> {
  const headersList = await headers();
  const tenantId = headersList.get("x-tenant-id");
  if (!tenantId) {
    // Default fallback tenant for dev testing if header is missing
    return process.env.DEFAULT_TENANT_ID || "default-tenant";
  }
  return tenantId;
}
