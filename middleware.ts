import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Tenant resolution from subdomain, header, or query
  const host = request.headers.get("host") || "";
  let tenantId = request.headers.get("x-tenant-id");

  if (!tenantId) {
    const subdomain = host.split(".")[0];
    if (subdomain && subdomain !== "localhost" && subdomain !== "www") {
      tenantId = subdomain;
    } else {
      tenantId = request.nextUrl.searchParams.get("tenant") || "default-tenant";
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-id", tenantId);

  // 2. Pass along request with x-tenant-id header injected
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/v1/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
