

# Skill: Connectdesk Database Migration Runner

Version: 1.1

---

# Purpose

This skill guides the AI in designing, generating, reviewing, and applying database schema changes for Connectdesk.

Every migration must preserve data integrity, maintain tenant isolation, and remain consistent with the project's PRD, AGENTS.md, Architecture Rules, and Security Rules.

Database migrations must be safe, repeatable, reversible whenever practical, and suitable for production deployments.

---

# When to Use This Skill

Use this skill whenever you need to:

- Create a new Prisma model
- Modify an existing model
- Add a relationship
- Add a new enum
- Rename a field
- Add an index
- Create a migration
- Apply a migration
- Review a migration
- Seed development data

Do not use this skill for business logic or API development.

---

# Objectives

Every migration should be:

- Safe
- Predictable
- Reversible where possible
- Strongly typed
- Backward compatible whenever practical
- Multi-tenant aware
- Production-ready

---

# Technology Stack

Use:

- Prisma ORM
- PostgreSQL (Supabase)
- TypeScript

Never generate raw SQL unless explicitly requested.

Prefer Prisma Migrate.

---

# Migration Workflow

Every schema change should follow this process:

```text
Business Requirement
        │
        ▼
Update Prisma Schema
        │
        ▼
Validate Relationships
        │
        ▼
Generate Migration
        │
        ▼
Review Migration
        │
        ▼
Run Migration
        │
        ▼
Verify Database
        │
        ▼
Update Seed Data (if required)
```

Commands:

```bash
# Validate the schema and review the diff
npx prisma validate
npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --shadow-database-url "$SHADOW_DATABASE_URL"

# Generate and apply a migration in development
npx prisma migrate dev --name <short_snake_case_name>

# Inspect applied migrations
npx prisma migrate status

# Apply pending migrations (used in CI/production)
npx prisma migrate deploy
```

- Use `prisma migrate dev` in development; use `prisma migrate deploy` in CI and production (Vercel pipeline). Never run `migrate dev` against production.
- Avoid `prisma db push` for schema changes in production — it is for prototyping and does not create a migration history.
- Supabase requires a **shadow database** for `prisma migrate dev` and `migrate diff`. Configure `SHADOW_DATABASE_URL` in the development environment.

Never skip the review step.

---

# Database Principles

The database should be:

- Normalized
- Consistent
- Scalable
- Secure
- Easy to query

Avoid unnecessary duplication.

Use relationships instead of duplicated data whenever possible.

---

# Model Design

The Prisma schema lives in a single file at `prisma/schema.prisma`.

Every model should have:

```prisma
id        String   @id @default(uuid())
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

Use:

- UUID primary keys (`@default(uuid())`)
- Foreign keys
- Prisma relations
- Enums where appropriate

Avoid magic strings.

---

# Soft Deletes

Use soft deletes where appropriate.

Example:

```prisma
deletedAt DateTime?
```

Never permanently delete important business data unless explicitly required.

Examples:

- Tickets
- Customers
- QA Reviews
- Companies

---

# Multi-Tenant Rules

Connectdesk is a multi-tenant platform.

Every tenant-owned entity should contain a tenant reference.

Example:

```prisma
tenantId String
```

Every query should filter by tenant.

Never create shared tenant data unless explicitly defined.

Add a composite index for tenant-scoped queries:

```prisma
@@index([tenantId, createdAt])
```

Tenant isolation is enforced at the database level. Configure **Row Level Security (RLS)** policies or a **Prisma Client Extension** (`$extends`) as an automated safety net so no query can cross tenant boundaries, even when the tenant filter is forgotten.

Never name the field `companyId` — the platform standard is `tenantId`.

---

# Naming Conventions

Models

Use PascalCase.

Example:

```text
Customer
Ticket
Conversation
QAReview
```

Fields

Use camelCase.

Example:

```text
customerName
ticketStatus
assignedAgentId
```

Enums

Use PascalCase.

Enum values should be uppercase.

Example:

```prisma
enum TicketStatus {
  OPEN
  IN_PROGRESS
  ESCALATED
  RESOLVED
  CLOSED
}
```

---

# Relationships

Use explicit Prisma relationships.

Examples:

One-to-One

```text
Company → CompanySettings
```

One-to-Many

```text
Company → Agents
```

Many-to-Many

Use junction tables when required.

Avoid duplicated relationships.

---

# Indexing

Create indexes for fields commonly used in:

- Search
- Filtering
- Sorting
- Foreign keys
- Reporting

Examples:

```text
tenantId
email
ticketStatus
assignedAgentId
createdAt
```

Composite indexes on `[tenantId, ...]` pairs are preferred for tenant-scoped queries:

```prisma
model Ticket {
  ...
  @@index([tenantId, status])
  @@index([tenantId, createdAt])
}
```

Avoid unnecessary indexes.

---

# Constraints

Use database constraints whenever possible.

Examples:

- Unique
- Foreign Key
- Not Null
- Default Values

Enforce data integrity at the database level.

---

# Migration Safety

Before creating a migration:

Verify:

- Existing relationships
- Foreign keys
- Cascade behavior
- Default values
- Nullable fields
- Index impact

Never generate destructive migrations without explicit approval.

---

# Schema Evolution

Prefer additive changes.

Safe changes include:

- Adding nullable fields
- Adding new tables
- Adding indexes
- Adding enums
- Adding enum values
- Adding relationships

Avoid:

- Dropping tables
- Removing columns
- Removing enum values (breaks existing data)
- Renaming columns without migration planning
- Breaking existing relationships

For non-additive changes that existing rows depend on:

- Add the new column/table as nullable first.
- Backfill data in a separate step (seed script or data migration).
- Add the constraint or make the column required only after data is verified.

---

# Cascade Rules

Define cascade behavior explicitly.

Examples:

```text
Company
    ├── Agents
    ├── Customers
    ├── Tickets
```

Avoid accidental cascading deletes.

Use `Restrict` or `SetNull` where appropriate.

---

# Audit Fields

Business-critical models should include:

```text
createdBy
updatedBy
```

When applicable:

```text
deletedBy
```

These fields support auditing and traceability.

---

# Timestamps

Always use:

```prisma
createdAt DateTime @default(now())

updatedAt DateTime @updatedAt
```

Avoid manually managing timestamps.

---

# Seed Data

Create development seed data only.

Examples:

- System Administrator
- Demo Company
- Demo Agents
- Demo Customers
- Demo Tickets
- Demo QA Rubrics

Seed scripts live at `prisma/seed.ts` and run via `npx prisma db seed`.

Configure the seed command in `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Never seed production secrets.

Keep seed data idempotent so it can be re-run safely.

---

# Environment Awareness

Support separate environments.

Examples:

- Development
- Staging
- Production

Never apply experimental migrations directly to production.

---

# Rollback Strategy

Whenever practical:

Document how a migration can be rolled back.

Avoid irreversible migrations.

If irreversible changes are necessary:

- Document the impact.
- Require explicit approval.

---

# Performance Considerations

Avoid:

- Duplicate indexes
- Excessive joins
- Overly wide tables
- Large text fields used in filtering

Prefer efficient schema design.

---

# Data Integrity

Protect:

- Foreign key relationships
- Unique constraints
- Required fields
- Enum consistency

Never bypass validation.

---

# Migration Review Checklist

Before applying a migration, verify:

- Model names are consistent.
- Field names follow conventions.
- Relationships are valid.
- Indexes are appropriate.
- Constraints are correct.
- Tenant isolation is preserved.
- Existing data will not be lost.
- Prisma schema validates successfully.
- The migration file matches the schema diff.
- Migration is reversible where practical, or the rollback plan is documented.

---

# Output Expectations

When generating a migration, provide:

1. Business reason
2. Updated Prisma schema
3. Migration summary
4. Data impact assessment
5. Rollback considerations
6. Required seed updates (if any)

Avoid generating incomplete schema changes.

---

# Final Rule

Every database migration must:

- Preserve existing data whenever possible.
- Maintain tenant isolation.
- Be compatible with Prisma.
- Follow PostgreSQL best practices.
- Remain consistent with the Connectdesk PRD and AGENTS.md.

If a migration introduces a risk of data loss or downtime, clearly explain the risk and recommend a safer migration strategy before proceeding.