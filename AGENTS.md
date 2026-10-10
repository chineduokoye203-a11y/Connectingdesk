# AGENTS.md

# Connectdesk

Version: 1.0

---

# Project Context

Connectdesk is a cloud-based, multi-tenant Customer Support Outsourcing platform being built for **First Connect Edge**.

Unlike traditional CRMs, Connectdesk is **not** the client's CRM.

Instead, it acts as the operational workspace where First Connect Edge's specialists handle customer support on behalf of multiple client companies.

Client companies retain ownership of their customer data.

Connectdesk integrates with external CRMs through APIs to:

- Pull incoming customer conversations
- Allow specialists to respond inside Connectdesk
- Push resolutions back to the client's CRM

The platform is built around **human-first customer support**, with Artificial Intelligence assisting specialists rather than replacing them.

---

# Product Vision

Build the best AI-assisted Customer Support Outsourcing platform that enables organizations to outsource customer support while maintaining visibility, quality assurance, SLA compliance, and excellent customer experience.

---

# Product Principles

Every implementation must follow these principles.

- Human-first support
- AI assists humans
- Simplicity over complexity
- Security by default
- Multi-tenant architecture
- API-first integrations
- Modular architecture
- MVP before enterprise complexity
- Production-ready code

---

# Product Philosophy

Whenever there are multiple implementation choices:

Prefer

- Simple solutions
- Reusable components
- Consistent UX
- Scalable architecture
- Low maintenance
- Explicit code

Avoid

- Over-engineering
- Premature optimization
- Feature creep
- Duplicate business logic
- Hardcoded values
- Client-specific implementations

---

# Primary Users

The platform contains the following user roles.

## CRM Agent

Responsible for:

- Calls
- Chat
- Email
- Social Messaging
- Ticket Resolution
- Customer Support

---

## Supervisor

Responsible for:

- Call QA
- Live Monitoring
- Recorded Call Review
- Call Scoring
- Escalations
- Ticket QA
- Specialist Coaching
- Ticket Scoring
- SLA Monitoring
- Escalations 
- Agent Management
- Queue Monitoring
- Workload Assignment
- Knowledge Base Management
- AI Supervision
- Performance Reporting

## Client Administrator

Responsible for:

- Company Users
- Company Settings
- Knowledge Base
- Reports
- SLA Monitoring
- Company Administration

---

## Client Company User

Responsible for:

- Viewing reports
- Customer insights
- SLA visibility
- Business dashboards

---

## System Administrator

Responsible for:

- Entire platform
- Companies
- Permissions
- Billing
- Platform configuration
- Security
- Monitoring

---

# Product Scope

The MVP includes

- Authentication
- RBAC
- CRM
- Ticket Management
- Calls
- Live Chat
- Email
- Social Messaging
- Knowledge Base
- AI Assistant
- QA
- Reporting
- Notifications
- Billing foundation
- Client CRM Integrations

---

# Out of Scope (MVP)

Do not build unless explicitly requested.

- Payroll
- Marketing Automation
- Workforce Scheduling
- AI Voice Agents
- Marketplace
- Public API
- Workflow Builder

---

# AI Philosophy

AI is an assistant.

AI never replaces human decisions.

AI may

- Suggest replies
- Summarize conversations
- Detect intent
- Search documentation
- Retrieve CRM context
- Recommend products
- Draft responses

AI must never

- Approve refunds
- Approve compensation
- Override company policy
- Make financial decisions
- Close escalated issues automatically

Human approval is always required.

---

# Quality Assurance Philosophy

Quality Assurance is a core feature.

Never treat QA as an afterthought.

Every QA implementation should support

- Ticket QA
- Call QA
- Client-specific QA Rubrics
- QA Scorecards
- Coaching
- Pass
- Flag
- Escalate
- Quality History

Every Client Company can configure its own QA Rubric.

---

# Specialist Compensation Rules

Connectdesk supports specialist earnings.

Payment should only occur after work satisfies the configured quality requirements.

The system should discourage low-quality responses intended only to increase earnings.

---

# CRM Integration Philosophy

Connectdesk never replaces a client's CRM.

It integrates with it.

Supported integrations should be designed using adapters/connectors rather than hardcoded logic.

The system should support:

- Polling
- Webhooks
- API Authentication
- Retry Logic
- Integration Health Monitoring

Every integration should be isolated from the core application.

---

# Architecture Principles

Prefer

- Feature-based architecture
- Modular services
- Repository pattern
- Service layer
- Domain separation

Avoid

- Business logic inside UI
- Business logic inside controllers
- Tight coupling
- Circular dependencies

---
# Technology Stack

The application should be built using the following technology stack unless explicitly instructed otherwise.

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Lucide React Icons

## Backend

- Next.js Route Handlers (API Routes)
- TypeScript

## Database

- PostgreSQL (Supabase)

## ORM

- Prisma ORM

## Authentication

- Auth
- Auth.js (Next Auth v5)

## AI

- OpenAI API
- Retrieval-Augmented Generation (RAG)

## State Management

- React Context
- TanStack Query

## Forms & Validation

- React Hook Form
- Zod

## File Storage

- Supabase Storage

## Real-Time Features

- Supabase Realtime

## Email

Nodemailer

## Telephony & Communications

The telephony provider should be abstracted behind a provider interface to support multiple integrations.

Potential providers include:

- Twilio
- Vonage
- Genesys Cloud
- Amazon Connect

## CRM Integrations

The system should support integrations through adapters/connectors rather than tightly coupled implementations.

Examples include:

- Salesforce Service Cloud
- Zendesk
- HubSpot
- Freshdesk
- Intercom
- Microsoft Dynamics 365

## Deployment

- Vercel (Application)
- Supabase (Database)
- GitHub (Source Control)
When generating code, architectural decisions, or implementation details, always use this technology stack unless explicitly instructed otherwise.


# Database Principles

Normalize data.

Use soft deletes where appropriate.

Include

- createdAt
- updatedAt
- deletedAt (where applicable)

Prefer enums instead of magic strings.

Create indexes for searchable fields.

Avoid duplicate entities.

---

# API Principles


---

# UI Principles

Every screen should include appropriate states.

Support

- Empty States
- Loading States
- Error States
- Success States
- Permission States

Maintain a consistent design system.

---

# Security Principles

Always enforce RBAC.

Never trust client-side validation.

Validate every request.

Sanitize user input.

Log privileged actions.

Protect sensitive information.

---

# Performance Principles

Prefer

- Lazy loading
- Pagination
- Optimistic UI where appropriate
- Background jobs for long-running tasks
- Efficient database queries

Avoid unnecessary API requests.

---

---

# Decision Framework



Never invent features that are not defined in the PRD unless explicitly requested.

---

# Environment Variables

The application should expect configuration through environment variables.

Examples include:

- Database connection
- Authentication secrets
- OpenAI API key
- CRM integration credentials
- Email provider credentials
- Telephony provider credentials
- Storage provider credentials
- Logging configuration

Never hardcode secrets.



If a feature does not contribute to these goals, reconsider whether it belongs in the MVP.
