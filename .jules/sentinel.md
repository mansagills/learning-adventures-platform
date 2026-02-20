## 2026-01-31 - Mass Assignment Privilege Escalation
**Vulnerability:** The signup endpoint allowed users to specify their role directly in the request body, which was passed unsanitized to `prisma.user.create`. This allowed attackers to create ADMIN accounts.
**Learning:** Using `req.json()` directly into `prisma.create` is dangerous if the model has sensitive fields like `role`.
**Prevention:** Always validate and sanitize input, especially for sensitive fields. Use a whitelist for allowed values (e.g., allow `STUDENT`, `PARENT`, `TEACHER` but not `ADMIN`). Explicitly construct the `data` object instead of spreading the request body.

## 2026-03-01 - Internal API Authentication Bypass
**Vulnerability:** Internal API routes (e.g., `/api/internal/claude-generate`) were not protected by Next.js middleware (which excludes `/api` paths by default) and lacked individual authentication checks.
**Learning:** Middleware regex exclusions can create a false sense of security. API routes in Next.js App Router must explicitly check `getServerSession` if they are not covered by global middleware.
**Prevention:** Implement a `requireAuth` helper or explicitly check `getServerSession(authOptions)` at the beginning of sensitive API route handlers. Ensure `middleware.ts` configuration clearly defines what is and isn't protected.
