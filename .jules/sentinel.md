## 2024-05-22 - Mass Assignment in Role Assignment
**Vulnerability:** The signup API allowed arbitrary role assignment (e.g., 'ADMIN') via the request body because it blindly passed the `role` input to `prisma.user.create`.
**Learning:** Next.js API routes receiving JSON bodies need explicit validation. Trusting `request.json()` directly into an ORM create method is dangerous for sensitive fields.
**Prevention:** Always use an explicit whitelist for sensitive fields (e.g., `SAFE_ROLES`). Ensure default behavior falls back to the least privileged role (e.g., 'STUDENT').
