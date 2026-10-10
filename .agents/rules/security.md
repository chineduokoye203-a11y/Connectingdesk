---
trigger: always_on
---


# Connectdesk Security Rules

---

# Purpose

These rules define the security standards for Connectdesk.

Every AI-generated implementation must follow these rules to ensure the platform is secure, compliant, and suitable for handling sensitive customer support data across multiple client companies.

Security is a core architectural requirement and must never be treated as an optional feature.

---

# Security Principles

Every implementation should follow these principles:

- Security by Default
- Least Privilege Access
- Defense in Depth
- Zero Trust
- Secure by Design
- Privacy First
- Auditability
- Multi-Tenant Isolation

Never sacrifice security for convenience.

---

# Authentication

Authentication is handled through **Auth.js (Next Auth v5)**.

Requirements:

- Authenticate every protected request.
- Require authenticated sessions before accessing protected resources.
- Support secure password reset.
- Support email verification.
- Support Multi-Factor Authentication (MFA) when enabled.
- Expire inactive sessions automatically (default: 30 minutes of inactivity).
- Use JWT sessions or database sessions as appropriate.
- Set secure cookie flags on session cookies: `HttpOnly`, `Secure`, and `SameSite=Lax` (or `SameSite=Strict` for sensitive actions).
- Call `auth()` in middleware and route handlers to gate protected resources.

Never create a custom authentication system.

---

# Authorization

Authorization must use **Role-Based Access Control (RBAC).**

Supported roles include:

- CRM Agent
- Supervisor
- Client Administrator
- Client Company User
- System Administrator

Authorization checks must be performed on the server.

Never rely on frontend permissions.

---

# Secrets and Configuration

Never hardcode:

- API Keys
- Database URLs
- Authentication Secrets
- Tokens
- Encryption Keys
- Service Credentials

All secrets must come from environment variables.

Example:

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=
OPENAI_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

Never commit secrets to version control.

---

# Password Security

If passwords are ever managed directly by the application:

- Never store plaintext passwords.
- Use secure hashing algorithms.
- Enforce minimum password requirements.
- Prevent password reuse where applicable.

For Connectdesk, authentication should remain delegated to Auth.js with a secure provider configuration.

---

# Multi-Tenant Security

Connectdesk is a multi-tenant platform.

Every request must execute within the context of the authenticated Client Company.

Requirements:

- Never expose data across tenants.
- Scope every database query by tenant.
- Validate tenant ownership before returning data.
- Prevent cross-tenant access even when IDs are guessed.

Tenant isolation is mandatory.

---

# Input Validation

Validate all external input.

Validate:

- Request Body
- Route Parameters
- Query Parameters
- File Upload Metadata

Use **Zod** for validation.

Reject invalid requests before business logic executes.

---

# Output Validation

Only return the fields required by the client.

Never expose:

- Internal IDs when unnecessary
- Password hashes
- API secrets
- Tokens
- Database implementation details
- Internal system configuration

Use DTOs or serializers where appropriate.

---

# SQL Injection

All database operations must use **Prisma ORM**.

Never construct SQL queries using string concatenation.

Always:

- Use Prisma query methods.
- Validate input before querying.
- Parameterize raw SQL if raw queries are unavoidable.

---

# Cross-Site Scripting (XSS)

Treat all user-generated content as untrusted.

Requirements:

- Escape rendered content.
- Sanitize rich text before storage or rendering.
- Never render raw HTML unless it has been explicitly sanitized.
- Set a Content-Security-Policy (CSP) header via Next.js middleware or `next.config.js` to block unauthorized scripts.

Avoid using `dangerouslySetInnerHTML`.

---

# Cross-Site Request Forgery (CSRF)

Protect state-changing operations.

Requirements:

- Validate authenticated sessions.
- Verify request origin where applicable.
- Use secure CSRF protection for cookie-based authentication flows.

Auth.js (Next Auth v5) provides built-in CSRF protection for its authentication flows. Do not disable it. For any custom cookie-based flows, maintain explicit CSRF protection.

Do not disable CSRF protections without documented justification.

---

# File Upload Security

Only allow approved file types.

Requirements:

- Validate MIME type.
- Validate file extension.
- Enforce a maximum file size of **5MB** for CRM support attachments.
- Scan uploaded files where supported.
- Store files securely.
- Generate unique filenames.

Never trust filenames supplied by users.

---

# API Security

Every API route must:

1. Authenticate the request.
2. Authorize the user.
3. Validate the input.
4. Execute business logic.
5. Return a sanitized response.

Never expose stack traces or internal errors.

---

# Rate Limiting

Protect sensitive endpoints.

Examples:

- Login
- Password Reset
- AI Endpoints
- File Uploads
- Public APIs

Use **`@upstash/ratelimit`** (Redis-based, serverless-friendly for Vercel) or an equivalent provider.

Return appropriate rate-limit responses when thresholds are exceeded.

---

# AI Security

AI should only access information that the authenticated user is authorized to view.

Requirements:

- Respect tenant boundaries.
- Respect role permissions.
- Filter retrieved documents before passing them to the model.
- Log AI failures.

AI must never:

- Leak data between tenants.
- Invent permissions.
- Override business rules.
- Make financial or policy decisions.

---

# CRM Integration Security

Every external integration must:

- Use secure authentication.
- Encrypt credentials.
- Retry safely.
- Log failures without exposing secrets.

Never store credentials in plaintext.

Support secure credential rotation.

---

# Data Encryption

Sensitive data should be protected.

Requirements:

- Encrypt data in transit using HTTPS/TLS.
- Encrypt sensitive data at rest where appropriate.
- Encrypt PII fields (e.g., customer contact details, notes) at the application level where required by data sensitivity.
- Never transmit secrets over unsecured connections.

---

# Logging

Log security-relevant events.

Examples:

- Login attempts
- Permission failures
- Role changes
- Data exports
- Integration failures
- Suspicious activity

Never log:

- Passwords
- Tokens
- Secrets
- API Keys
- Full payment information
- Sensitive personal information unless required for auditing

---

# Audit Logging

Maintain immutable audit logs for privileged actions.

Log:

- User ID
- Tenant ID
- Role
- Action
- Entity
- Entity ID
- Timestamp
- IP Address (where available)
- Device Information (where available)

Audit logs should be searchable by authorized administrators.

---

# Error Handling

Return generic error messages to clients.

Example:

```text
Something went wrong. Please try again later.
```

Log detailed errors internally.

Never expose:

- Stack traces
- Database errors
- Internal service names
- File paths

---

# Dependencies and Incident Response

Keep project dependencies up to date.

Requirements:

- Regularly update packages.
- Monitor dependency vulnerabilities.
- Remove unused packages.
- Pin dependency versions where appropriate.

If a security vulnerability is discovered:

1. Assess impact.
2. Patch affected dependencies.
3. Test affected functionality.
4. Deploy the fix.
5. Document the incident.
6. Notify affected stakeholders immediately.

---

# Privacy

Only collect information required for business operations.

Requirements:

- Minimize personal data collection.
- Respect user permissions.
- Support data retention policies.
- Support data deletion requests where legally applicable.

---

# Backups and Recovery

The platform should support:

- Automated backups.
- Point-in-time recovery where available.
- Disaster recovery procedures.
- Recovery testing.

Backups should be encrypted and access-controlled.

---

# Secure Development

Before generating code, always verify:

- Authentication is enforced.
- Authorization is enforced.
- Validation is complete.
- Secrets are not exposed.
- Tenant isolation is preserved.
- Sensitive data is protected.
- Error responses are safe.

Security should never be added later—it must be built into every feature from the beginning.

---

# Final Rule

Every generated feature must satisfy this checklist:

- Secure by default
- Multi-tenant safe
- Authenticated
- Authorized
- Validated
- Auditable
- Resilient
- Compliant with the Connectdesk PRD and AGENTS.md

If a security decision conflicts with convenience, always choose the more secure implementation.
