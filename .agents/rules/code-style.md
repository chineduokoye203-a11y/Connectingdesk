---
trigger: always_on
---

# Connectdesk Code Style Guide

---

# Purpose

These rules define the coding standards for Connectdesk.

Every AI-generated file must follow these conventions. Code should always prioritize readability over cleverness.

---

# General Principles

Write code that is:

- Simple
- Readable
- Modular
- Predictable
- Maintainable
- Strongly typed
- Easy to test

Avoid unnecessary abstractions. Prefer explicit code over implicit behavior.

---

# TypeScript

Always use TypeScript. Never use `any` — use `unknown` when the type is truly uncertain.

Prefer explicit interfaces, type aliases, and utility types. Use strict typing throughout.

Use `as const` for literal types:

```ts
const TICKET_STATUS = { OPEN: "OPEN", IN_PROGRESS: "IN_PROGRESS", CLOSED: "CLOSED" } as const;
type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];
```

Use `satisfies` for type-checking without widening. Use `readonly` for immutable arrays and objects.

Default to `type` for props and Zod-inferred types. Use `interface` for public API shapes that consumers may augment.

---

# Naming Conventions

## Components

PascalCase: `CustomerCard`, `TicketTable`, `AgentProfile`

Component props: use a `Props` suffix. Default to `type`:

```ts
type TicketCardProps = { ticket: Ticket; onAssign: (agentId: string) => void };
```

## Files

kebab-case: `customer-card.tsx`, `call-service.ts`, `ticket.schema.ts`

Next.js special files use exact names: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`, `middleware.ts`.

Never use `.tsx` for `route.ts` — it exports functions, not components.

## Variables

camelCase: `customerName`, `ticketStatus`, `activeConversation`. Use descriptive names. Avoid abbreviations.

## Functions

camelCase, describing an action: `createTicket()`, `assignAgent()`, `calculateSla()`.

Avoid generic names: `handleData()`, `processItem()`, `runTask()`.

## Constants

UPPER_SNAKE_CASE: `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE`, `SESSION_TIMEOUT`

## Enums / Status Values

Prefer string literal unions with `as const` over TypeScript enums — they work better with Prisma enums and Zod validation.

---

# Components

Each component should have one responsibility. Break large components into smaller reusable pieces.

Server Components by default. Add `"use client"` only when interactivity, browser APIs, or hooks are required. Push Client Components as far down the tree as possible.

Never fetch data inside Client Components when a Server Component can do it.

JSX: keep clean. Maximum 4 levels of nesting. Extract repeated UI into reusable components.

---

# Functions

Functions should perform one task, be easy to understand, have descriptive names, and return predictable results.

Prefer short functions (≤ 50 lines). Extract repeated logic into reusable utilities or services.

Avoid premature optimization. Only use `useMemo` or `useCallback` when the computation is measurably expensive, reference stability is required by a dependency array, or the component renders 100+ items.

---

# File Size

Recommended limits:

- Component: ≤ 300 lines
- Service: ≤ 300 lines
- API Route: ≤ 150 lines
- Utility: ≤ 200 lines

Split by responsibility when a file exceeds its limit.

---

# Folder Organization

Group by feature. Use `features/` for feature modules and `shared/` for cross-cutting code.

```
features/
  tickets/
    components/
    services/
    hooks/
    schemas/
    types/
    api/
```

Never group the entire project by file type.

---

# Imports

Order consistently:

1. External libraries
2. Internal shared modules (`@/components`, `@/lib`)
3. Feature modules (`@/features/...`)
4. Relative imports (`./`)
5. Types (`import type { ... }`)

Remove unused imports. Avoid circular imports.

---

# Comments

Write self-explanatory code. Only add comments for business rules, non-obvious decisions, or complex algorithms.

Bad: `// Increment count` → `count++`
Good: `// Retry only for transient integration failures.`

---

# Formatting

Use Prettier. Consistent indentation, spacing, one statement per line, trailing commas. Never format manually.

---

# Exports

- **Default exports** for pages, layouts, and components.
- **Named exports** for utilities, services, hooks, types, and actions.
- Barrel files (`index.ts`) use named re-exports only. Never use `export *`.

---

# Async Code

Prefer `async/await`. Avoid nested Promise chains. Always handle rejected promises.

---

# Custom Hooks

Start with `use`, encapsulate one concern, be reusable. Avoid business logic unrelated to UI state.

```ts
useCustomerSearch()
useTicketFilters()
useConversationHistory()
```

---

# Server Actions

Server Actions (`"use server"`) belong in `features/*/actions/` files. Name files with a verb: `create-ticket.ts`, `assign-ticket.ts`. Export named functions.

```ts
// features/tickets/actions/create-ticket.ts
"use server";

export async function createTicket(data: CreateTicketInput): Promise<Ticket> {
  // validate → business logic → return
}
```

---

# Database Access

Only repositories communicate directly with Prisma. UI components and API routes never query the database directly.

The Prisma schema lives at `prisma/schema.prisma`. Keep it as a single file.

Model names: **singular**, **PascalCase** (`model Ticket`, `model Customer`). Field names: **camelCase** in the schema. Every model includes `id`, `createdAt`, `updatedAt`.

---

# Validation

Use Zod. Validate request body, route params, and query params. Never rely on client-side validation alone.

Schema names: camelCase. Derive types with `z.infer` — let Zod be the single source of truth:

```ts
const createTicketSchema = z.object({
  subject: z.string().min(1),
  status: z.enum(["OPEN", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"]),
});
type CreateTicketInput = z.infer<typeof createTicketSchema>;
```

For shared enum values, define the array with `as const` and use `z.enum`:

```ts
const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"] as const;
// z.enum(TICKET_STATUSES)
```

---

# Styling

Use design tokens from `tokens/variables.css` exclusively. Never hardcode colors, radii, shadows, or typography values. No Tailwind CSS.

Standards: `.agents/rules/design-system.md` (Styling section).

Prefer component-scoped CSS over inline styles. Order CSS properties logically: layout → sizing → spacing → typography → visual → misc.

---

# Environment Variables

Access through a single validated module (`lib/env.ts`). Never use `process.env` directly in components, services, or routes.

---

# Error Handling

Standards: `.agents/rules/architecture.md` (Error Handling section).

Handle expected failures gracefully. Never silently ignore errors. Return appropriate responses without exposing internals.

---

# Logging

Never use `console.log` in production paths. Use a structured logger.

Standards: `.agents/rules/security.md` (Logging section).

Log meaningful events. Never log passwords, secrets, tokens, or sensitive PII.

---

# Reusability

Before creating something new, check if it already exists. Prefer reuse over duplication.

---

# Git Practices

Each commit should solve one logical problem, be small and focused, and avoid unrelated changes. Write clear commit messages.

---

# AI Code Generation Rules

- Follow existing project conventions.
- Reuse existing components and utilities.
- Avoid introducing new libraries unless explicitly requested.
- Generate production-ready code.
- Never invent behavior not defined in the PRD, AGENTS.md, or architecture rules.

---

# Final Checklist

Every piece of generated code must be:

- Readable
- Strongly typed
- Modular
- Reusable
- Tested or testable
- Consistent with project structure, PRD, and AGENTS.md
- Production-ready
