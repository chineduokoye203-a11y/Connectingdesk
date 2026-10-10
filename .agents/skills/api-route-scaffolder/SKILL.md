# skills/api-route-scaffolder/SKILL.md

# Skill: Connectdesk API Route Scaffolder

Version: 1.4

---

# Purpose

This skill provides a consistent approach for generating production-ready API routes for Connectdesk.

Every API endpoint must follow the project's:

- PRD
- AGENTS.md
- Architecture Rules
- Security Rules
- Code Style Rules
- Multi-Tenant Rules

API routes should remain lightweight and delegate business logic to services.

---

# When to Use This Skill

Use this skill whenever you need to:

- Create a new API route
- Extend an existing endpoint
- Build CRUD endpoints
- Build search endpoints
- Build reporting endpoints
- Build integration endpoints
- Build AI endpoints
- Build authentication-protected routes
- Connect Connectdesk to OpenAI
- Connect external services to Connectdesk

Do not use this skill for UI components or database migrations.

---

# Objectives

Every generated API route should be:

- RESTful
- Secure
- Strongly typed
- Multi-tenant aware
- Validated
- Easy to maintain
- Consistent across the application

---

# Technology Stack

Use:

- Next.js App Router
- Next.js Route Handlers
- TypeScript
- Prisma ORM
- Supabase
- Zod
- Auth.js (Next Auth v5)
- OpenAI Node SDK when AI functionality is required

Do not introduce additional backend frameworks unless explicitly requested.

---

# API Design Principles

Every endpoint should:

- Follow REST conventions.
- Validate all input.
- Authenticate requests.
- Authorize users.
- Respect tenant isolation.
- Delegate business logic to services.
- Return consistent responses.
- Handle errors gracefully.

Business logic must not be placed directly inside route handlers.

---

# Folder Structure

Route handlers live physically in the Next.js App Router at `app/api/v1/[tenant]/[resource]/route.ts`.

Feature logic (services, repositories, schemas, types) lives in `features/`. The `api/` folder under a feature represents its API concerns logically, not the physical route location:

```text
app/
    api/
        v1/
            [tenant]/
                tickets/
                    route.ts
features/
    tickets/
        api/            (logical grouping, not physical route location)
        services/
        repositories/
        schemas/
        types/
```

For AI functionality:

```text
features/
    ai/
        services/
            openai.service.ts
        schemas/
        types/
        utils/
```

Keep OpenAI-specific implementation inside the AI service layer.

---

# URL Pattern

Use the URL conventions defined in the Architecture Rules:

```text
/api/v1/[tenant]/[resource]
/api/v1/[tenant]/[resource]/[id]
/api/v1/[tenant]/[resource]/[id]/[sub-resource]
```

---

# Tenant Resolution

Tenant context is resolved in `middleware.ts` and injected as an `x-tenant-id` request header (see Architecture Rules).

Within route handlers, obtain the tenant through the shared tenant utility:

```ts
import { getTenantId } from "@/lib/tenant";

const tenantId = getTenantId();
```

Never trust a client-supplied `tenantId` or route parameter as the tenant source of truth. The middleware-resolved tenant is authoritative.

---

# Standard Request Flow

Every request should follow this sequence:

```text
Incoming Request
        │
        ▼
Authentication
        │
        ▼
Authorization
        │
        ▼
Tenant Validation
        │
        ▼
Request Validation
        │
        ▼
Business Service
        │
        ▼
Repository / External Service
        │
        ▼
Database / External API
        │
        ▼
Response
```

Never skip authentication, authorization, tenant validation, or input validation.

---

# Responsibilities

## Route Handler

Responsible for:

- Authentication
- Authorization
- Tenant context
- Request parsing
- Input validation
- Calling services
- Returning responses

Must not:

- Contain complex business logic
- Query Prisma directly
- Call OpenAI directly
- Build complex AI prompts
- Contain provider-specific integration logic

---

## Service Layer

Responsible for:

- Business rules
- Workflow execution
- Domain validation
- AI orchestration
- External API coordination
- Integration logic

---

## Repository Layer

Responsible only for:

- Prisma queries
- CRUD operations
- Database transactions

Repositories should never contain business rules.

---

# Authentication

All protected routes must verify the authenticated user.

Use Auth.js (Next Auth v5). Call `auth()` in middleware and route handlers.

Reject unauthenticated requests.

Never trust client-supplied user IDs.

Never create a custom authentication system.

---

# Authorization

Always verify user permissions before executing the requested operation.

Supported roles include:

- CRM Agent
- Supervisor
- Client Administrator
- Client Company User
- System Administrator

Permission checks must occur before business logic executes.

---

# Tenant Isolation

Connectdesk is a multi-tenant platform.

Every request must execute within the authenticated tenant/company context.

Requirements:

- Scope database queries by tenant.
- Scope AI context by tenant.
- Scope knowledge-base retrieval by tenant.
- Scope CRM data by tenant.
- Verify ownership of requested resources.
- Prevent cross-tenant access.

Never trust a client-supplied `tenantId` without verifying access.

---

# Validation

Validate:

- Request Body
- Route Parameters
- Query Parameters

Use Zod schemas.

Reject invalid requests before business logic executes.

Never rely only on frontend validation.

---

# HTTP Methods

Use standard REST methods.

GET

Retrieve resources.

POST

Create resources.

PUT

Replace resources.

PATCH

Partially update resources.

DELETE

Delete or soft-delete resources where appropriate.

---

# Response Format

Use the consistent response structure defined in the Architecture Rules.

Success:

```json
{
  "data": {}
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": []
  }
}
```

Maintain the same response structure throughout the application. Collection endpoints include `meta` (see Pagination).

---

# Status Codes

Use appropriate HTTP status codes.

Examples:

- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Unprocessable Entity
- 429 Too Many Requests
- 500 Internal Server Error
- 502 Bad Gateway
- 503 Service Unavailable

Avoid returning `200` for failed operations.

---

# Pagination

Collection endpoints should support, where appropriate:

- Page
- Page Size
- Search
- Sort
- Filter

Return pagination metadata in the `meta` envelope.

Example:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 250,
    "totalPages": 13
  }
}
```

---

# Filtering

Support filtering where appropriate.

Examples:

Tickets:

- Status
- Priority
- Assigned Agent
- Customer
- Date Range

Calls:

- Agent
- Queue
- Duration

QA:

- Reviewer
- Score
- Result

---

# Searching

Search endpoints should support partial matching where appropriate.

Avoid loading unnecessary records.

Use indexed database fields whenever possible.

---

# Sorting

Allow sorting only on approved fields.

Never allow unrestricted sorting against arbitrary database columns.

---

# Error Handling

Handle:

- Validation failures
- Authentication failures
- Authorization failures
- Database failures
- Integration failures
- AI failures
- Rate-limit failures
- Timeout failures

Return safe user-facing messages.

Never expose:

- Stack traces
- Database errors
- API keys
- Provider credentials
- Internal implementation details

---

# Logging

Log:

- Failed authentication
- Authorization failures
- Critical API failures
- Integration failures
- AI failures
- Request IDs where available

Never log:

- Passwords
- Tokens
- Secrets
- API keys
- Sensitive customer information unnecessarily

---

# Rate Limiting

Protect sensitive endpoints (login, password reset, AI endpoints, file uploads).

Use **`@upstash/ratelimit`** (serverless-friendly for Vercel).

Return `429 Too Many Requests` when thresholds are exceeded. See the Route Handler Template for the integration pattern.

---

# External API Integrations

External integrations must use service or adapter layers.

Do not place provider-specific logic directly inside route handlers.

External API integrations should support where appropriate:

- Authentication
- Timeouts
- Retry logic
- Error handling
- Request validation
- Response validation
- Logging
- Integration health monitoring

Provider credentials must remain server-side.

---

# OpenAI API Integration

OpenAI is an external AI service used by Connectdesk to assist CRM Agents and Supervisors.

AI must remain a supporting capability.

It must not replace required human decisions.

---

## OpenAI Architecture

Use the following flow:

```text
Client
  ↓
Next.js API Route
  ↓
Authentication
  ↓
Authorization
  ↓
Tenant Validation
  ↓
Zod Validation
  ↓
AI Service
  ↓
OpenAI Node SDK
  ↓
OpenAI Responses API
  ↓
Validated AI Result
  ↓
API Response
```

Never call OpenAI directly from:

- React components
- Client-side JavaScript
- Browser code

Never call the OpenAI SDK directly from the route handler.

The route handler only orchestrates the flow above:

- Authenticate and authorize the user.
- Validate the request with Zod.
- Retrieve only authorized CRM and knowledge-base context.
- Call the OpenAI service.
- Validate the returned result.
- Return a safe response.

The API route must not contain complex prompt construction.

---

## OpenAI Service

All OpenAI operations should be handled by a dedicated service (`features/ai/services/openai.service.ts`, see Folder Structure).

The OpenAI service is responsible for:

- Preparing requests
- Building authorized context
- Calling OpenAI
- Handling responses
- Validating structured output
- Handling transient failures
- Returning typed results

The service must hide OpenAI SDK implementation details from the rest of the application.

---

## OpenAI Responses API

Use the OpenAI Responses API for new OpenAI functionality.

Do not introduce legacy completion APIs for new Connectdesk features.

Use the official OpenAI Node SDK.

---

# OpenAI Use Cases

The API architecture should support the AI capabilities defined in the Connectdesk PRD.

Examples include:

- AI reply suggestions
- Conversation summaries
- Customer intent detection
- Conversation classification
- Knowledge-base assistance
- Customer sentiment analysis
- QA assistance
- SLA risk identification
- Coaching suggestions

Do not create additional AI capabilities unless explicitly requested.

---

# AI Context

Only send context necessary for the requested AI operation.

Potential context includes:

- Customer profile
- Conversation history
- CRM records
- Ticket information
- Relevant knowledge-base content
- Company policies
- Previous interactions

Do not send unnecessary customer data.

---

# Retrieval-Augmented Generation

Use RAG when AI needs company-specific information.

Potential sources:

- Knowledge Base
- FAQs
- Company Manuals
- Policies
- Product Documentation

Retrieval must always be scoped to the authenticated Client Company.

Never retrieve or pass another tenant's information into an OpenAI request.

---

# AI Structured Output

Use structured output whenever an AI response will be consumed by application logic.

Examples:

```text
summary
intent
sentiment
suggestedReply
confidence
tags
```

Validate structured AI responses before using them.

Never treat AI output as trusted application data.

---

# AI Business Rules

AI must never independently:

- Approve refunds
- Approve compensation
- Make financial decisions
- Override company policies
- Close escalated issues
- Bypass RBAC
- Access another tenant
- Perform privileged actions without authorization

Application-level business rules must enforce these restrictions.

Do not rely solely on an AI prompt to enforce security or authorization.

---

# OpenAI Environment Variables

Use server-side environment variables.

Example:

```env
OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_PROJECT=
```

Never:

- Hardcode API keys
- Expose API keys to the frontend
- Commit secrets to source control
- Return credentials in API responses

---

# OpenAI Error Handling

Handle:

- Invalid requests
- Authentication errors
- Rate limits
- Timeouts
- Network failures
- OpenAI service failures
- Invalid model output

Return a safe fallback response.

Example:

```text
Something went wrong. Please try again later.
```

Never expose raw OpenAI errors to the user.

---

# OpenAI Retry Logic

Retry only transient failures.

Use controlled exponential backoff.

Do not retry:

- Authentication failures
- Validation failures
- Permission failures
- Invalid requests

Retries must not create duplicate business actions.

---

# OpenAI Logging

Log operational metadata where appropriate:

- Request ID
- AI feature
- Model
- Duration
- Success/failure
- Token usage where available

Do not unnecessarily log:

- Full customer conversations
- Sensitive customer information
- API keys
- Secrets
- Internal system instructions

---

# OpenAI Cost Management

Control AI costs by:

- Sending only relevant context
- Using RAG
- Limiting output size
- Selecting appropriate models
- Avoiding duplicate requests
- Monitoring token usage

Do not compromise security or required product functionality solely to reduce cost.

---

# File Upload Endpoints

Validate:

- File type
- File size (maximum 5MB for CRM support attachments)
- MIME type

Store files using approved storage providers.

Never trust uploaded filenames.

Example schema:

```ts
const uploadSchema = z.object({
  file: z.instanceof(File).refine((f) => f.size <= 5 * 1024 * 1024, {
    message: "File must be 5MB or smaller.",
  }),
});
```

---

# Transactions

Use Prisma transactions for operations affecting multiple database records.

Ensure failed operations are rolled back where appropriate.

Do not place database transactions directly in route handlers when the operation belongs in a service.

---

# Performance

Avoid:

- N+1 queries
- Unnecessary database calls
- Large API payloads
- Duplicate OpenAI requests

Prefer:

- Pagination
- Efficient indexes
- Optimized queries
- Background jobs for long-running operations
- Streaming where appropriate for AI responses

---

# Testing

Every endpoint should support appropriate testing for:

- Authentication
- Authorization
- Tenant isolation
- Input validation
- Business rules
- Error handling

AI endpoints should additionally test:

- Prompt/context construction
- Structured output validation
- OpenAI failures
- Rate limits
- Retry behavior
- Unauthorized tenant context

Mock OpenAI responses during automated tests.

Do not use production OpenAI API calls in unit tests.

---

# Route Handler Template

Follow this scaffold for every new route handler:

```ts
// app/api/v1/[tenant]/tickets/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getTenantId } from "@/lib/tenant";
import { createTicketSchema, listTicketsSchema } from "@/features/tickets/schemas/ticket.schema";
import { TicketService } from "@/features/tickets/services/ticket.service";
import { ApiError, errorResponse, successResponse } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return errorResponse(401, "UNAUTHORIZED", "Authentication required.");

  const allowed = await rateLimit({ key: `tickets:list:${session.user.id}`, limit: 100 });
  if (!allowed) return errorResponse(429, "RATE_LIMITED", "Too many requests.");

  const query = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = listTicketsSchema.safeParse(query);
  if (!parsed.success) return errorResponse(422, "VALIDATION_ERROR", "Invalid request.", parsed.error);

  try {
    const tenantId = getTenantId();
    const tickets = await TicketService.list(tenantId, parsed.data);
    return successResponse(tickets.data, tickets.meta);
  } catch (err) {
    if (err instanceof ApiError) return errorResponse(err.status, err.code, err.message);
    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong. Please try again later.");
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return errorResponse(401, "UNAUTHORIZED", "Authentication required.");

  const allowed = await rateLimit({ key: `tickets:create:${session.user.id}`, limit: 30 });
  if (!allowed) return errorResponse(429, "RATE_LIMITED", "Too many requests.");

  const parsed = createTicketSchema.safeParse(await request.json());
  if (!parsed.success) return errorResponse(422, "VALIDATION_ERROR", "Invalid request.", parsed.error);

  try {
    const tenantId = getTenantId();
    const ticket = await TicketService.create(tenantId, parsed.data);
    return successResponse(ticket, undefined, 201);
  } catch (err) {
    if (err instanceof ApiError) return errorResponse(err.status, err.code, err.message);
    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong. Please try again later.");
  }
}
```

Shared helpers live in `lib/`:

- `@/auth` — Auth.js session helper
- `@/lib/tenant` — `getTenantId()` from the `x-tenant-id` middleware header
- `@/lib/api-response` — `successResponse`, `errorResponse`, `ApiError`
- `@/lib/rate-limit` — wraps `@upstash/ratelimit`
- `@/lib/env` — validated environment variables (never read `process.env` directly)

Keep the handler thin. All business logic lives in the service.

The template above authenticates and rate-limits. Add an authorization check after authentication when the operation is restricted to specific roles:

```ts
if (!hasRole(session.user, "SUPERVISOR")) {
  return errorResponse(403, "FORBIDDEN", "Insufficient permissions.");
}
```

Use a shared `hasRole` / `requireRole` helper rather than inline checks.

---

# Output Expectations

When generating a new API route, provide:

1. Folder location
2. Route definition
3. Request schema
4. Response schema
5. Service method
6. Repository method, if required
7. Authorization requirements
8. Tenant isolation logic
9. Error handling
10. Tests where appropriate

For OpenAI routes, additionally include:

1. OpenAI service method
2. AI request schema
3. Authorized context assembly
4. Prompt/context builder
5. Structured output schema, where required
6. AI response validation
7. OpenAI error handling

Generate production-ready implementations.

Do not generate placeholder implementations unless explicitly requested.

---

# Final Rule

Every generated API route must be:

- Secure
- RESTful
- Multi-tenant aware
- Strongly typed
- Validated
- Consistent with Connectdesk architecture
- Consistent with the PRD

For OpenAI integrations, the implementation must additionally be:

- Server-side
- Secure
- Tenant-isolated
- Structured where appropriate
- RAG-enabled where required
- Cost-conscious
- Human-controlled

If an existing service can be reused, extend it instead of creating duplicate integration logic.