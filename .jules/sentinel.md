## 2026-01-31 - Mass Assignment Privilege Escalation
**Vulnerability:** The signup endpoint allowed users to specify their role directly in the request body, which was passed unsanitized to `prisma.user.create`. This allowed attackers to create ADMIN accounts.
**Learning:** Using `req.json()` directly into `prisma.create` is dangerous if the model has sensitive fields like `role`.
**Prevention:** Always validate and sanitize input, especially for sensitive fields. Use a whitelist for allowed values (e.g., allow `STUDENT`, `PARENT`, `TEACHER` but not `ADMIN`). Explicitly construct the `data` object instead of spreading the request body.

## 2026-02-01 - Admin Domain Privilege Escalation
**Vulnerability:** The authentication system automatically promotes users with `@learningadventures.org` emails to ADMIN upon login. However, the signup endpoint did not restrict registration with these emails, allowing anyone to register as an attacker and gain ADMIN privileges.
**Learning:** Security logic in one component (auth provider callbacks) can create vulnerabilities if assumptions (e.g., "only admins have these emails") are not enforced in other components (signup).
**Prevention:** Implement defense-in-depth by validating sensitive domains at the signup stage. Ensure that "trusted" identifiers like email domains are actually verified or restricted before granting privileges based on them.

## 2026-02-02 - Missing Defense-in-Depth on Internal APIs
**Vulnerability:** Critical internal API endpoints (e.g., `save-content`) relied solely on middleware for authentication. A bug in the implementation (missing imports) caused security checks to crash, potentially leading to DoS or bypass if fail-open.
**Learning:** Middleware is a good first line of defense, but API routes must also verify authentication explicitly (`getServerSession`). Relying on a single layer is risky. Also, runtime errors in security code can mask vulnerabilities or cause instability.
**Prevention:** Always implement authentication checks inside the API handler for sensitive operations (Defense in Depth). Ensure security-critical code paths are covered by tests that verify they don't crash (Runtime Safety).

## 2026-02-05 - Insecure Direct Object Reference and Mass Assignment in Course Requests
**Vulnerability:** Course request submission and draft endpoints accepted `id` and `userId` directly from the request body without validation, allowing users to modify or reassign other users' requests (IDOR and Mass Assignment).
**Learning:** When using object spread syntax (`...body`) for database updates or creations, any fields present in the body will overwrite target fields, leading to privilege escalation or data corruption if not carefully controlled.
**Prevention:** Always verify object ownership against the authenticated session before updating. Explicitly sanitize payloads by appending `id: undefined` and `userId: undefined` (or `userId: session.user.id`) *after* the spread operator to ensure sensitive fields cannot be manipulated.
