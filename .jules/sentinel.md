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

## 2026-02-02 - IDOR and Mass Assignment in Course Requests
**Vulnerability:** The `/api/course-requests/submit` and `draft` endpoints allowed users to provide a `body.id` to update existing records without verifying that the authenticated user actually owned the record. Additionally, the use of spread syntax (`...body`) inside Prisma `update` and `create` operations allowed mass assignment of system-controlled fields like `userId`, `status`, and `isDraft`.
**Learning:** Using `id` from the request body directly in Prisma `where` clauses without also validating the `userId` enables Insecure Direct Object Reference (IDOR). Spreading the entire request body into Prisma `data` objects is a recurring mass assignment risk.
**Prevention:** Always explicitly verify ownership (e.g., `existingRecord.userId === session.user.id`) before updating records based on user-provided IDs. Prevent mass assignment by destructing system-controlled fields (e.g., `const { id, userId, status, ...safeData } = body;`) and only spreading the `safeData` into Prisma operations.
