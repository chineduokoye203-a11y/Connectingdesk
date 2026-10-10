---
trigger: always_on
---

# Connectdesk Architecture Rules

# Purpose

These rules define the architectural standards for Connectdesk. Every implementation must follow these rules to ensure the application remains modular, scalable, maintainable, secure, and consistent throughout development. Always choose the simplest architecture that satisfies requirements.

---

# Architecture Philosophy

The architecture must be:
- Modular & Feature-based
- Multi-tenant & API-first
- Scalable & Secure

Design for the MVP while enabling future expansion. Avoid over-engineering.

---

# High-Level Architecture

```text
Presentation Layer → Application Layer → Business Logic Layer → Data Access Layer → Database
```

Business rules must exist **only** inside the Business Logic Layer (Services).

---

# Next.js App Router Architecture

## Server Components vs Client Components

Default to **Server Components**. Use a Client Component **only** for:
- User interaction (`onClick`, `onChange`)
- Browser APIs (`localStorage`, geolocation)
- React hooks (`useState`, `useEffect`, `useRef`)
- Context consumers

```text
page.tsx          → Server Component (data fetching, layout)
  ├── Filters     → Client Component (interactive)
  ├── TicketList  → Server Component (renders fetched data)
  │     └── Row   → Client Component (interactive actions)
  └── Sidebar     → Client Component (interactive)
```

Push Client Components as far down the tree as possible. Never fetch data inside Client Components when a Server Component can do it.

## Middleware Pipeline

Next.js middleware (`middleware.ts` at root) handles:
1. Tenant resolution from request (hostname, header, or path segment)
2. Session validation via Auth.js
3. Redirecting unauthenticated users
4. Injecting tenant context (`x-tenant-id`) into request headers

```ts
// middleware.ts
export async function middleware(request: NextRequest) {
  const tenant = resolveTenant(request);
  if (!tenant) return redirectToTenantSelection();

  const session = await auth();
  if (!session) return redirectToLogin(request);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-id", tenant.id);

  return NextResponse.next({ request: { headers: requestHeaders } });
}
```

Keep middleware thin. Do not place business logic in middleware.

---

# Feature-Based Architecture

Organize code by feature under `features/`, and cross-cutting modules under `shared/`:

```text
features/
  auth/ | crm/ | tickets/ | calls/ | chat/ | email/ | social/ | qa/ | reports/ | ai/ | integrations/ | billing/ | settings/
shared/
```

Each feature owns its UI, Business Logic, API, Validation, Types, Hooks, and Tests.

## Dependency Rules & Domain Boundaries
- Features may depend on `shared/`.
- Downward feature dependencies are permitted only where logical: `integrations/` → used by `tickets/`, `calls/`, `chat/`, `email/`, `social/`; `ai/` → used by `tickets/`, `chat/`, `email/`; `qa/` → used by `tickets/`, `calls/`.
- Avoid circular dependencies. Extract cross-cutting shared concerns into `shared/`.

---

# Separation of Responsibilities

- **UI Layer**: Rendering, form state, and interactions only. No business logic.
- **API Layer**: Authentication, authorization, Zod validation, calling services, returning responses. Keep route handlers thin.
- **Service Layer**: All business rules (e.g., ticket assignment, SLA calculations, QA scoring, AI orchestration, CRM sync).
- **Repository Layer**: Prisma CRUD queries and database transactions. No business logic.

---

# Multi-Tenant Architecture

Connectdesk is multi-tenant. Every request executes within the context of a Client Company (tenant). Never trust the frontend for tenant context.

## Tenant Resolution Pattern

```ts
// lib/tenant.ts
export async function getTenantId(): Promise<string> {
  const headersList = await headers();
  const tenantId = headersList.get("x-tenant-id");
  if (!tenantId) throw new TenantNotResolvedError();
  return tenantId;
}
```

All services and repositories accept `tenantId` as their first parameter:

```ts
class TicketService {
  async list(tenantId: string, filters: TicketFilters): Promise<Ticket[]> {
    // tenantId scoped by middleware, never from user input
  }
}
```

Every Prisma query must include a tenant filter. Use Prisma Client Extensions (`$extends`) or database Row Level Security (RLS) policies as an automated safety net:

```ts
prisma.ticket.findMany({
  where: { tenantId, ...filters },
});
```

---

# State Management

- Default to Server Components.
- Use Client Components only for interactivity.
- Use React Context for shared app state and TanStack Query for server state.

---

# API Design

Follow REST conventions, validate inputs with Zod, and return consistent responses.

## URL Structure & Envelopes
- URLs: `/api/v1/[tenant]/[resource]` and `/api/v1/[tenant]/[resource]/[id]`
- Methods: GET (List/Get), POST (Create), PATCH (Partial Update), PUT (Replace), DELETE (Soft delete)

**Response Envelope**:
```json
{
  "data": { ... },
  "meta": { "page": 1, "pageSize": 20, "total": 150, "totalPages": 8 }
}
```

**Error Envelope**:
```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "Human-readable message", "details": [] }
}
```

**Route Handler Pattern**:
```ts
export async function GET(request: NextRequest, { params }: { params: { tenant: string } }) {
  const session = await auth();
  if (!session) return errorResponse(401, "UNAUTHORIZED");

  const validated = searchSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const tickets = await ticketService.list(params.tenant, validated);

  return successResponse(tickets, meta);
}
```

---

# Database Architecture

- ORM: **Prisma** (PostgreSQL via Supabase).
- Primary keys: UUIDs.
- Required fields on all entities: `id`, `createdAt`, `updatedAt`.
- Soft deletes where appropriate (`deletedAt`).
- Use enums instead of magic strings. Normalize data by default.

---

# AI & Integration Architecture

## AI Architecture
AI is a supporting service. It may suggest replies, summarize conversations, detect intent, retrieve docs (RAG), and recommend responses.
**AI must never**: approve refunds, override human decisions, or modify customer records without human confirmation.

## CRM Integrations
All external CRM integrations (Salesforce, Zendesk, HubSpot, Freshdesk) must use adapter patterns (`CRMAdapter`). Interacts only through the adapter interface.

## Telephony Abstraction
Telephony must be abstracted behind an interface (`TelephonyProvider` with Twilio, Vonage, Genesys, Amazon Connect implementations) and configured per tenant.

---

# Background Jobs

Move long-running tasks (CRM sync, AI processing, email delivery, reports) into background jobs.

Use **Inngest** as the standard serverless-native queue provider for Vercel. (BullMQ may be used if complex Redis queuing is explicitly required).

```ts
await inngest.send({
  name: "crm.sync",
  data: { tenantId, integrationId, direction: "pull" },
});

export const syncCRM = inngest.createFunction(
  { id: "crm-sync" },
  { event: "crm.sync" },
  async ({ event }) => {
    const { tenantId, integrationId } = event.data;
    // long-running sync logic
  }
);
```

Every job payload must carry `tenantId` for scoping.

---

# Platform Infrastructure

- **Real-Time**: **Supabase Realtime** for chat, ticket updates, agent status, and notifications. Channels must be tenant-scoped (`tenant:${tenantId}:tickets`).
- **File Storage**: **Supabase Storage**. Tenant-isolated buckets (`tenant-{tenantId}/`). Generate unique filenames. Access restricted via authenticated API routes.
- **Email**: Nodemailer via background jobs (Resend/SendGrid transport). Never block API responses.
- **Caching**: Deduplicate via Next.js `fetch` cache & React `cache()`. Cache CRM responses at API layer. Never cache cross-tenant data together.

---

# Security & Operations

- **Security & Logging**: Enforce authentication, authorization (RBAC), and tenant scoping on every request. Refer to `security.md` for full details. Structured logging only; never log PII, tokens, or secrets.
- **Environment Configuration**: Validate startup variables using Zod schemas (`DATABASE_URL`, `AUTH_SECRET`, `OPENAI_API_KEY`, etc.). Never hardcode secrets.
- **Deployment**: Vercel (App), Supabase (Database), GitHub (CI/CD). Migrations run via `prisma migrate deploy` in CI pipeline.
- **Feature Flags**: Tenant-scoped feature flags to control rollouts.

---

# Decision Rules

When generating architecture:
- Always prioritize simplicity, readability, reusability, scalability, and consistency.
- If a conflict arises, resolve in order: **PRD** > **AGENTS.md** > **architecture.md**.