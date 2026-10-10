# skills/openai-integration/SKILL.md

# Skill: Connectdesk OpenAI Integration

Version: 1.2

---

# Purpose

This skill provides the AI Agent with the rules required to integrate OpenAI into Connectdesk.

The implementation must follow:

- Connectdesk PRD
- AGENTS.md
- `.agents/rules/architecture.md`
- `.agents/rules/security.md`
- `.agents/rules/code-style.md`
- Existing API route conventions
- Connectdesk multi-tenant architecture

Connectdesk uses AI as part of its AI/Agentic workflow and as an assisting technology.

AI must not replace required human QA, Supervisor, Team Lead, or Admin decisions.

---

# Product Context

Connectdesk is a Customer Support Outsourcing platform operated by First Connect Edge.

Connectdesk is a workspace layer rather than the client's system of record.

Client data remains owned by the client.

Connectdesk connects to external client systems through APIs and allows specialists to perform work inside Connectdesk.

The PRD specifically defines an AI/Agentic and Data Annotation workflow where clients can submit:

- Training data
- Conversations for review
- Annotation tasks
- AI-generated responses for human review

Specialists may:

- Label data
- Review AI-generated responses
- Correct AI-generated responses
- Rate AI-generated responses
- Complete structured annotation tasks

Team Leads and Supervisors can then apply QA to this work.

Completed and QA-approved work can be returned to the client through an API.

---

# OpenAI Integration Architecture

Use the following architecture:

```text
Connectdesk UI
      │
      ▼
Next.js API Route
      │
      ├── Authentication
      │
      ├── Authorization
      │
      ├── Tenant Validation
      │
      ├── Input Validation
      │
      ▼
Connectdesk AI Service
      │
      ├── Context Preparation
      ├── Prompt Construction
      ├── OpenAI Request
      └── Response Validation
      │
      ▼
OpenAI API
      │
      ▼
Validated AI Result
      │
      ▼
Connectdesk Business Logic
```

Never call OpenAI directly from client-side code.

Never expose the OpenAI API key to the browser.

---

# OpenAI API

Use the official OpenAI SDK.

Use the OpenAI Responses API for new OpenAI functionality.

Example SDK pattern:

```typescript
import OpenAI from "openai";
import { env } from "@/lib/env";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const response = await client.responses.create({
  model: env.OPENAI_MODEL,
  input: "...",
});

const output = response.output_text;
```

Never access `process.env` directly — read environment variables through the validated `@/lib/env` module.

Do not build new functionality around deprecated or legacy OpenAI APIs when the Responses API supports the required capability.

---

# Technology

The OpenAI integration should use:

- TypeScript
- OpenAI Node SDK
- OpenAI Responses API
- Next.js Route Handlers
- Zod
- Prisma
- Supabase

Use the existing Connectdesk architecture.

Do not introduce another backend framework solely for OpenAI integration.

---

# Folder Structure

Keep OpenAI-specific implementation isolated.

Recommended structure:

```text
features/
  ai/
    services/
      openai.service.ts
    schemas/
      ai.schema.ts
    types/
      ai.types.ts
    prompts/
      ...
    utils/
      ...
```

API routes should remain inside the application's existing API structure.

Example:

```text
app/
  api/
    v1/
      [tenant]/
        ai/
          ...
          route.ts
```

Do not scatter OpenAI SDK calls throughout the application.

---

# API Route Responsibilities

An OpenAI API route must:

1. Authenticate the request with `auth()`.
2. Authorize the user.
3. Resolve the tenant via `getTenantId()` (from the `x-tenant-id` middleware header).
4. Validate request input with Zod.
5. Apply application-level rate limiting (`@/lib/rate-limit`).
6. Retrieve only authorized data.
7. Call the AI service.
8. Validate the AI response.
9. Return a safe response using the shared `successResponse` / `errorResponse` helpers.

Routes follow the canonical URL pattern `/api/v1/[tenant]/[resource]` and the shared response envelope. Full route scaffolding rules: `.agents/skills/api-route-scaffolder/SKILL.md`.

The route handler must remain thin.

Do not place complex AI logic inside the route handler.

---

# OpenAI Service Responsibilities

The OpenAI service is responsible for:

- Creating OpenAI requests
- Preparing AI context
- Constructing prompts
- Selecting the configured model
- Calling the Responses API
- Processing responses
- Validating structured output
- Handling transient OpenAI errors
- Returning typed results

The rest of Connectdesk should not need to know the implementation details of the OpenAI SDK.

## Service Example

```typescript
import OpenAI from "openai";
import { env } from "@/lib/env";
import type { AiService } from "./ai.types";
import { classificationSchema, type Classification } from "./ai.schema";

export class OpenAiService {
  private client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  async classify(input: string, taskContext: string): Promise<Classification> {
    const response = await this.client.responses.create({
      model: env.OPENAI_MODEL,
      input: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildTaskPrompt(taskContext, input) },
      ],
    });

    const parsed = classificationSchema.safeParse(JSON.parse(response.output_text));
    if (!parsed.success) {
      throw new InvalidAiOutputError(parsed.error);
    }

    return parsed.data;
  }
}
```

The service:

- Constructs the OpenAI client once.
- Wraps the OpenAI SDK so no other module imports `openai`.
- Validates output with Zod before returning.
- Throws typed errors the route layer converts into safe responses.

Keep the client behind an interface so tests can inject a mock without calling the real API:

```typescript
export type AiService = {
  classify(input: string, taskContext: string): Promise<Classification>;
};
```

Tests mock `AiService` (or `vi.mock` the OpenAI SDK) — never call the real OpenAI API in unit tests.

---

# Connectdesk AI Use Cases

Only implement AI functionality required by the PRD or explicitly requested.

The current PRD supports AI/Agentic workflows including:

## AI/Agentic Training Tasks

Clients can submit tasks through an API.

Tasks may contain:

- Training data
- Conversations
- AI-generated responses
- Annotation instructions
- Task-specific rubrics

Connectdesk routes these tasks into the specialist workspace.

---

## AI Response Review

A specialist may review an AI-generated response.

The specialist can:

- Review it
- Correct it
- Rate it

The human output becomes part of the completed task.

---

## Data Annotation

AI may be used as part of tasks requiring:

- Classification
- Labelling
- Review
- Correction
- Rating

The exact output format must be determined by the task instructions and client-specific rubric.

---

## AI/Agentic QA

Team Leads/Supervisors review completed AI/Agentic tasks using the applicable project rubric.

The QA flow must support:

```text
Completed Task
      ↓
QA Review
      ↓
Pass / Flag / Escalate
```

AI must not bypass the QA process.

---

# Human-in-the-Loop Rule

Connectdesk is human-first.

AI may assist with processing, generation, classification, or analysis.

Human specialists and reviewers remain responsible for the final work where the PRD requires human review.

Never automatically mark a task as QA-passed simply because OpenAI returned a successful response.

Never automatically approve a task for payment solely because an AI request succeeded.

---

# Prompt Construction

Prompts should be constructed from clearly separated context.

Where applicable:

```text
System Instructions
        +
Task Instructions
        +
Client/Project Instructions
        +
Relevant Input Data
        +
Relevant Rubric
        ↓
OpenAI
```

Do not rely on user-provided instructions to enforce application security.

Security and authorization must be enforced by Connectdesk application code.

---

# Client-Specific Instructions

AI/Agentic tasks may have client-specific instructions and rubrics.

The AI service must receive only the instructions belonging to the current authorized task/client.

Never mix instructions between clients.

Never use one client's private task instructions as context for another client.

---

# Multi-Tenant Data Isolation

Connectdesk is multi-tenant.

Every OpenAI request must respect tenant isolation.

Resolve the tenant from server-side context (`getTenantId()`) — never from client-supplied values.

Before sending data to OpenAI:

1. Authenticate the user.
2. Resolve the tenant via `getTenantId()`.
3. Verify access to the requested task.
4. Retrieve only authorized data.
5. Build the AI context from that data.

Never trust a client-supplied `tenantId` without authorization checks.

---

# Data Minimization

Connectdesk should store only the data needed to complete the work.

The same principle applies when sending information to OpenAI.

Send only the data required for the current AI operation.

Avoid unnecessarily sending:

- Entire customer histories
- Unrelated conversations
- Unrelated CRM records
- Unrelated client documents
- Unnecessary personal information

---

# Structured Outputs

Use structured outputs whenever the application needs predictable AI-generated fields.

Examples:

```text
classification
label
rating
correction
summary
reason
confidence
```

Define the expected structure before making the request.

Validate the returned structure before using it in application logic.

Never assume AI-generated data is valid merely because the API request succeeded.

Validate with Zod before writing to the database:

```typescript
const classificationSchema = z.object({
  classification: z.enum(["BILLING", "SUPPORT", "SALES", "OTHER"]),
  confidence: z.number().min(0).max(1),
  summary: z.string().max(500),
});
type Classification = z.infer<typeof classificationSchema>;

const parsed = classificationSchema.safeParse(aiOutput);
if (!parsed.success) {
  throw new InvalidAiOutputError();
}
```

---

# AI Output Validation

AI output is untrusted input.

Validate:

- Required fields
- Data types
- Allowed enum values
- String lengths
- Numeric ranges
- Required business constraints

Never directly write unvalidated AI output into critical database fields.

---

# Function Calling

Use function calling only when Connectdesk needs the model to request an application-defined action.

Functions must:

- Have explicit schemas
- Validate all arguments
- Check authorization
- Check tenant ownership
- Execute application logic on the server

Never allow the model to directly execute privileged operations.

The application remains responsible for deciding whether a requested action is permitted.

---

# Tool Use

Only expose tools that are required for the current AI workflow.

Do not expose unrestricted database access.

Do not expose unrestricted CRM access.

Do not expose administrative operations to the model.

Each tool must have:

- A narrow purpose
- Typed input
- Authorization checks
- Tenant checks
- Safe error handling

---

# Retrieval and RAG

Use retrieval when the AI needs access to external knowledge or client-specific information.

Potential Connectdesk sources include:

- Client-provided task instructions
- Project rubrics
- Knowledge documents
- Training material
- Relevant task context

Retrieved information must be scoped to the current authorized client/project.

Never retrieve content across tenants.

---

# File Inputs and Documents

If an AI/Agentic task contains documents or files:

1. Validate the file.
2. Verify the user has permission to access it.
3. Determine whether the file is required for the task.
4. Send only the required content to OpenAI.
5. Do not expose files belonging to another client.

Use OpenAI-supported file input/retrieval capabilities where they provide a simpler and safer implementation than manually embedding large documents into prompts.

---

# Streaming

Use streaming only when it provides a meaningful UX benefit.

Do not use streaming merely because it is available.

For short structured AI operations such as:

- Classification
- Labelling
- Rating

prefer a normal response.

For longer human-facing generation tasks, streaming may be appropriate.

---

# Model Configuration

Keep model configuration in environment variables, exposed through the validated `@/lib/env` module.

Example:

```env
OPENAI_API_KEY=
OPENAI_MODEL=
```

Do not hardcode the model name throughout the codebase.

The configured model must support the capabilities required by the specific feature.

Do not automatically select a more expensive model when a simpler model is sufficient.

---

# API Key Security

The OpenAI API key must:

- Remain server-side
- Be stored in environment variables
- Be accessed only through `@/lib/env`
- Never be committed to Git
- Never be returned by an API route
- Never be exposed in browser code
- Never be written into logs

Use:

```env
OPENAI_API_KEY=
```

---

# Error Handling

Handle at minimum:

- Invalid requests
- Authentication errors
- Authorization failures
- Rate limits
- Timeouts
- Network failures
- OpenAI service errors
- Invalid AI output

Return safe application-level errors.

Example:

```text
Something went wrong. Please try again later.
```

Never expose raw OpenAI errors, API keys, stack traces, or internal prompts to users.

---

# Retry Logic

Only retry transient failures.

Use controlled exponential backoff where appropriate.

Do not retry:

- Invalid requests
- Authentication failures
- Authorization failures
- Invalid input
- Invalid application state

Retries must not create duplicate business operations.

---

# Rate Limits

OpenAI rate limits must be treated as expected operational conditions.

The application should:

- Handle rate-limit responses
- Avoid uncontrolled retries
- Provide a safe fallback
- Log the failure appropriately
- Prevent unnecessary duplicate requests

---

# Background Processing

Use background processing when an AI task:

- Is long-running
- Does not require an immediate response
- Processes a large amount of data
- Can safely complete asynchronously

Use the project's background job infrastructure (Inngest or BullMQ, per architecture.md).

Every job payload must carry `tenantId` for scoping.

Do not block a user request unnecessarily for long-running AI processing.

---

# Cost Control

AI usage should be cost-conscious.

Prefer:

- Small relevant contexts
- Appropriate models
- Structured outputs
- Limited output sizes
- Retrieval instead of unnecessarily large prompts
- Avoiding duplicate requests

Do not reduce AI quality where it would negatively affect the required task.

---

# Logging and Auditability

AI operations that affect Connectdesk workflows should be traceable.

Where appropriate, record:

- AI feature
- Task ID
- Client/project ID
- Request ID
- Model used
- Timestamp
- Success/failure
- Processing duration
- Token usage where available

Do not log:

- API keys
- Secrets
- Unnecessary customer data
- Full sensitive conversations
- Internal security instructions

For QA-related AI operations, preserve sufficient metadata to support the PRD's auditability requirements.

---

# Security Rules

Never allow AI to:

- Bypass RBAC
- Access another client's data
- Modify permissions
- Approve payments
- Approve compensation
- Override QA decisions
- Override client-specific rules
- Directly execute unrestricted database operations
- Directly access arbitrary external systems

AI output must always pass through normal application authorization and validation.

---

# Testing

Every OpenAI integration must test:

## Authentication

- Unauthenticated requests
- Authenticated requests

## Authorization

- Correct role
- Incorrect role
- Unauthorized resource

## Tenant Isolation

- Correct client
- Different client
- Invalid client context

## Input Validation

- Missing fields
- Invalid fields
- Oversized input
- Invalid task data

## OpenAI Integration

- Successful response
- Invalid response
- Rate limit
- Timeout
- Network failure
- API failure

## Output Validation

- Valid structured output
- Missing fields
- Invalid enum
- Invalid data type
- Unexpected output

Mock OpenAI responses during unit tests.

Do not use production OpenAI requests in automated unit tests.

---

# API Route Example Structure

For an AI task endpoint:

```text
POST /api/v1/[tenant]/ai/tasks/[taskId]/process
```

The route should:

```text
Authenticate (auth())
    ↓
Authorize
    ↓
Resolve Tenant (getTenantId())
    ↓
Rate Limit
    ↓
Verify Task Ownership
    ↓
Validate Request (Zod)
    ↓
Load Task Context
    ↓
Build AI Request
    ↓
Call OpenAI Service
    ↓
Validate AI Result
    ↓
Persist Result if required
    ↓
Return Response (successResponse / errorResponse)
```

Do not place the OpenAI SDK call directly inside the route.

---

# AI Integration with the Existing Connectdesk Workflow

The AI layer must fit into the existing workflow:

```text
Client
   ↓
API
   ↓
AI/Agentic Task
   ↓
Specialist Workspace
   ↓
Specialist Completes / Reviews Task
   ↓
Team Lead / Supervisor QA
   ↓
Pass / Flag / Escalate
   ↓
Approved Output
   ↓
Client API
```

AI must not bypass the Specialist or QA workflow defined by the PRD.

---

# Performance

AI processing must not unnecessarily slow down specialist work.

The PRD states that QA should operate as a parallel process and should not meaningfully slow down specialist productivity, except where a flag requires payment to be held.

Design AI operations accordingly.

---

# Multilingual Support

Connectdesk is expected to support expansion into multilingual teams.

Do not hardcode English-only assumptions into AI workflows.

Where a task requires a specific language:

- Pass the required language explicitly.
- Preserve the client's requested language.
- Validate output where language-specific requirements exist.

---

# What the Agent Must Not Do

Do not:

- Add AI features that are not required.
- Build an autonomous customer-service agent unless explicitly requested.
- Replace human QA with AI.
- Allow AI to make payment decisions.
- Create unrestricted AI tools.
- Store unnecessary client data.
- Mix client contexts.
- Put OpenAI credentials in frontend code.
- Put OpenAI SDK calls inside React components.
- Put complex AI logic inside route handlers.
- Hardcode model names or API keys.

---

# Implementation Checklist

Before completing an OpenAI feature, verify:

- [ ] The feature is defined in the PRD or explicitly requested.
- [ ] The API route authenticates the user.
- [ ] Authorization is enforced.
- [ ] Tenant isolation is enforced (`getTenantId()`).
- [ ] Application-level rate limiting is applied.
- [ ] Input is validated with Zod.
- [ ] OpenAI calls occur server-side.
- [ ] OpenAI SDK logic is inside the AI service.
- [ ] The Responses API is used for new functionality.
- [ ] AI output is validated with Zod.
- [ ] Client-specific data is isolated.
- [ ] Errors are handled safely.
- [ ] Rate limits are handled.
- [ ] Secrets are not exposed.
- [ ] AI does not bypass human QA.
- [ ] Appropriate tests exist.
- [ ] No unnecessary AI functionality was introduced.

---

# Final Rule

The OpenAI integration must remain a supporting layer inside Connectdesk.

The agent must always prioritize:

1. Connectdesk PRD
2. Security and tenant isolation
3. Human QA and operational control
4. Simplicity
5. Reliable API integration
6. Appropriate OpenAI capabilities

Do not introduce complexity simply because the OpenAI platform supports it.

Build only what Connectdesk needs.