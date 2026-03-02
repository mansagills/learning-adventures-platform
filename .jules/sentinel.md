## 2026-01-31 - Mass Assignment Privilege Escalation
**Vulnerability:** The signup endpoint allowed users to specify their role directly in the request body, which was passed unsanitized to `prisma.user.create`. This allowed attackers to create ADMIN accounts.
**Learning:** Using `req.json()` directly into `prisma.create` is dangerous if the model has sensitive fields like `role`.
**Prevention:** Always validate and sanitize input, especially for sensitive fields. Use a whitelist for allowed values (e.g., allow `STUDENT`, `PARENT`, `TEACHER` but not `ADMIN`). Explicitly construct the `data` object instead of spreading the request body.

## 2026-02-05 - Authenticated Path Traversal Fix
**Vulnerability:** The `/api/internal/save-content` endpoint was missing authentication and allowed path traversal via `fileName` and `uploadedZipPath` parameters, enabling arbitrary file overwrite.
**Learning:** API routes matching `api/` are often excluded from global middleware auth checks. Authentication must be explicitly verified in the route handler using `getServerSession`.
**Prevention:** Added `getServerSession` check for ADMIN role. Enforced `path.basename` for `fileName` and strict `path.resolve` + `.startsWith` validation for `uploadedZipPath` to contain files within the public directory.
