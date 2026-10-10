

# Skill: Connectdesk Component Builder

Version: 1.2

---

# Purpose

This skill guides the AI in designing and building reusable UI components for Connectdesk.

Every generated component must follow the project's PRD, AGENTS.md, Architecture Rules, Code Style Rules, and Design System Rules.

The goal is to create production-ready, reusable, accessible, and maintainable components.

---

# When to Use This Skill

Use this skill whenever you need to:

- Create a new UI component
- Refactor an existing component
- Extend a reusable component
- Build a new page section
- Build a dashboard widget
- Build forms
- Build tables
- Build dialogs
- Build cards

Do not use this skill for backend logic or API routes.

---

# Objectives

Every generated component should be:

- Reusable
- Responsive
- Accessible
- Strongly typed
- Easy to test
- Consistent with the Connectdesk Design System

---

# Technology Stack

Use:

- Next.js App Router
- React
- TypeScript
- Design tokens from `tokens/variables.css` (no Tailwind, no CSS-in-JS)
- Lucide React (icons)
- React Hook Form (for forms)
- Zod (for validation)

Do not introduce additional UI libraries unless explicitly requested.

All visual values must come from design tokens. Reference the Design System Rules (`.agents/rules/design-system.md`) for tokens, typography, spacing, breakpoints, dark mode, and accessibility.

---

# Component Categories

Build components within one of the following categories.

## Layout Components

Examples:

- App Layout
- Sidebar
- Header
- Top Navigation
- Breadcrumbs
- Section Header
- Page Container

---

## Shared UI Components

Examples:

- Button
- Badge
- Avatar
- Card
- Modal
- Drawer
- Dialog
- Tooltip
- Popover
- Tabs
- Pagination
- Alert
- Empty State
- Skeleton Loader
- Toast

Prefer extending existing Connectdesk components where appropriate.

---

## Form Components

Examples:

- Text Input
- Textarea
- Select
- Multi Select
- Checkbox
- Radio
- Toggle
- Date Picker
- Search Input
- Phone Input
- File Upload

Every form component should integrate cleanly with React Hook Form.

---

## Feature Components

Examples:

CRM

- Customer Card
- Customer Timeline
- Customer Details

Tickets

- Ticket Card
- Ticket List
- Ticket Filters
- Ticket Status Badge

Calls

- Call Controls
- Dial Pad
- Call History
- Active Call Banner

Chat

- Conversation List
- Chat Window
- Message Bubble

QA

- QA Scorecard
- QA Rubric
- QA Review Panel

Reports

- KPI Card
- Chart Card
- Metrics Grid

Integrations

- Integration Card
- Integration Status
- Sync History

---

# Component Structure

Place components in `features/<feature>/components/` or `shared/components/` for cross-cutting UI.

Each component should contain only one responsibility.

Example:

```text
features/tickets/components/ticket-card/
├── ticket-card.tsx
├── ticket-card.types.ts
├── ticket-card.test.tsx
└── index.ts
```

- Default export the component (`ticket-card.tsx`).
- Barrel `index.ts` uses named re-exports only, never `export *`.
- Keep components self-contained where practical.
- Keep component files ≤ 300 lines. Split when a component exceeds this limit.

Do not create a `.stories.tsx` file unless the project has Storybook configured.

---

# Component Rules

Every component should:

- Accept typed props.
- Avoid unnecessary internal state.
- Be composable.
- Avoid business logic.
- Be reusable.
- Handle loading states.
- Handle empty states where applicable.
- Handle error states where applicable.

Business rules belong in services, not components.

---

# Server vs Client Components

Default to **Server Components**.

Use a Client Component (`"use client"`) only when:

- Interactivity is required
- Browser APIs are used
- React hooks are required

Push Client Components as far down the tree as possible.

Never fetch data inside Client Components when a Server Component can do it.

Never add `"use client"` to a component that does not need interactivity.

---

# Props Design

Props should be:

- Minimal
- Explicit
- Strongly typed

Name prop types with a `Props` suffix using `type`:

```ts
type TicketCardProps = {
  ticket: Ticket;
  onOpen: (ticketId: string) => void;
};
```

Avoid passing unnecessary objects.

Prefer:

```ts
<TicketCard
    ticket={ticket}
    onOpen={handleOpen}
/>
```

Avoid excessive prop drilling.

Use composition when appropriate.

---

# State Management

Keep component state local whenever possible.

Use:

- useState
- useMemo
- useCallback

Use React Context only when shared state is required.

Use TanStack Query for server state.

Server-state patterns:

- Fetch server data with `useQuery` inside a `use*Query` hook, never inline in JSX.
- Mutations use `useMutation` with `onSuccess` invalidation (`queryClient.invalidateQueries`).
- Provide `isPending`, `isError`, and `data` states to the component.

Example:

```ts
function useTickets() {
  return useQuery({
    queryKey: ["tickets", tenantId],
    queryFn: () => fetchTickets(),
  });
}
```

In Server Components, prefer server-side data fetching over TanStack Query. TanStack Query is for Client Components that need cached, background-updated, or optimistic server state.

Avoid global state for local UI interactions.

---

# Styling

Use design tokens exclusively:

- Colors: `--color-*` tokens (Material Design 3 naming)
- Typography: `--font-*` tokens
- Spacing: `--spacing-*` tokens (8-point system)
- Radii: `--radius-*` tokens
- Elevation/shadows: `--elevation-*`, `--shadow-*` tokens

Reference tokens as CSS custom properties, e.g. `background: var(--color-surface-color)`.

Avoid:

- Inline styles
- Hardcoded colors, radii, shadows, or typography values
- Tailwind classes or utility class frameworks
- Repeated CSS blocks

Write CSS Modules or plain component-scoped CSS. Never hardcode values that a token already defines.

Example:

```css
/* ticket-card.module.css */
.card {
  background: var(--color-surface-color);
  color: var(--color-on-surface-color);
  border-radius: var(--radius-medium);
  padding: var(--spacing-4);
  box-shadow: var(--elevation-1);
}
```

Use semantic tokens (`--color-on-surface-color`) rather than direct palette colors so components adapt automatically in dark mode.

---

# Accessibility

Every component must:

- Support keyboard navigation
- Use semantic HTML
- Include accessible labels
- Include visible focus states
- Support screen readers where applicable
- Meet WCAG AA contrast standards

Focus states: use a visible outline or glow. Default focus indicator uses `--color-primary-color` with `--shadow-glow-primary`. Never remove focus outlines without providing an equally visible alternative.

Accessibility is mandatory.

---

# Responsiveness

Use the Design System breakpoints:

- Mobile: 0px
- Tablet: 640px
- Desktop: 1024px
- Large Desktop: 1440px

Design mobile-first. Components must work on mobile, tablet, and desktop.

Avoid layouts that break on smaller screens. Prioritize touch-friendly targets (minimum 44px).

---

# Dark Mode

Components must render correctly in both light and dark themes.

Dark mode uses the `[data-theme="dark"]` attribute on the root element. All color tokens switch automatically.

Never use hardcoded colors. Always reference CSS custom properties so components adapt to theme changes.

Test every component in both light and dark themes before considering it complete.

---

# Icons

Use **Lucide React** icons.

Icons should:

- Include accessible labels
- Support recognition
- Remain visually consistent

Avoid decorative icons. Every icon should convey meaning.

---

# Loading States

Every asynchronous component should include:

- Skeleton Loader
- Loading Spinner
- Disabled Actions

Avoid blank screens during loading.

---

# Empty States

Provide meaningful empty states.

Include:

- Title
- Description
- Primary Action (if applicable)

Example:

"No tickets found."

"Create your first ticket."

---

# Error States

Display clear, user-friendly messages.

Example:

"Unable to load customer information."

Provide retry actions where appropriate.

Never expose technical errors.

---

# Forms

Forms should:

- Use React Hook Form.
- Use Zod validation via a resolver (`@hookform/resolvers/zod`).
- Share the same Zod schema used by the API route so client and server validation stay in sync.
- Display inline validation messages.
- Disable submit while processing.
- Prevent duplicate submissions.

Example:

```ts
type CreateTicketFormProps = {
  onSubmit: (data: CreateTicketInput) => void;
  isPending: boolean;
};
```

Never rely solely on client-side validation — the server must always re-validate.

---

# Tables

Tables should support:

- Sorting
- Filtering
- Pagination
- Search
- Empty States
- Loading States

Use reusable table components.

---

# Dashboard Components

Dashboard widgets should:

- Display one primary metric.
- Include optional secondary information.
- Support loading.
- Support empty states.
- Avoid excessive information.

Examples:

- Open Tickets
- SLA Compliance
- QA Score
- Average Resolution Time

---

# Testing

Components must be tested with:

- **Vitest** (test runner)
- **React Testing Library** (component rendering)
- **jest-dom** (assertions)

Test behavior, not implementation:

- Render the component and assert visible output.
- Simulate user interactions (`fireEvent` / `userEvent`).
- Test loading, empty, and error states.
- Mock server data (`vi.mock`) — never make real API calls in tests.
- Test in light and dark themes where theme affects output.

Every component should have a test file. If a component is purely presentational and stateless, a minimal render test is sufficient.

---

# Component Naming

Use PascalCase.

Examples:

- CustomerCard
- TicketTable
- KPIWidget
- ConversationPanel

Use kebab-case for filenames.

Examples:

```text
customer-card.tsx
ticket-table.tsx
```

---

# Component Checklist

Before completing a component, verify:

- Single responsibility
- Strong typing (`Props` suffix)
- Responsive layout (mobile-first)
- Accessible with visible focus states
- Works in both light and dark themes
- Correct Server vs Client Component boundary
- Loading state
- Empty state
- Error state
- Reusable
- Consistent with the Design System tokens
- No business logic
- No duplicated UI
- File size ≤ 300 lines

---

# Output Expectations

When generating a new component, provide:

1. Folder location
2. Component name
3. Type definitions
4. Component implementation
5. Example usage (if helpful)

Do not generate placeholder code unless explicitly requested.

Generate production-ready implementations.

---

# Final Rule

Every component must improve consistency across Connectdesk.

If an existing reusable component can be extended instead of creating a new one, always extend the existing component.

Never create duplicate components that solve the same problem.