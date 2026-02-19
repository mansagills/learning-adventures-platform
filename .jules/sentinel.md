## 2026-01-31 - Mass Assignment Privilege Escalation
**Vulnerability:** The signup endpoint allowed users to specify their role directly in the request body, which was passed unsanitized to `prisma.user.create`. This allowed attackers to create ADMIN accounts.
**Learning:** Using `req.json()` directly into `prisma.create` is dangerous if the model has sensitive fields like `role`.
**Prevention:** Always validate and sanitize input, especially for sensitive fields. Use a whitelist for allowed values (e.g., allow `STUDENT`, `PARENT`, `TEACHER` but not `ADMIN`). Explicitly construct the `data` object instead of spreading the request body.

## 2026-02-01 - Internal API Path Traversal & Unauthorized Access
**Vulnerability:** The internal content saving endpoint (`/api/internal/save-content`) lacked authentication checks and did not sanitize the `fileName` parameter, allowing arbitrary file overwrites via path traversal.
**Learning:** Middleware configurations often exclude `/api/` routes by default, leaving them exposed unless explicitly protected within the route handler. Assuming "internal" in the path provides security is a fallacy.
**Prevention:** Always verify authentication (`getServerSession`) and authorization (`role`) at the beginning of sensitive API routes. Use `path.basename()` to sanitize user-provided filenames before using them in file system operations.
