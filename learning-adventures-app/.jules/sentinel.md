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

## 2026-03-19 - Unauthenticated File Modification in Catalog

**Vulnerability:** The `app/api/internal/update-catalog/route.ts` endpoint allowed unauthenticated modification of the `lib/catalogData.ts` file via file system writes, allowing data injection and potential denial of service.
**Learning:** Internal API routes that perform file system operations must have explicit authorization checks. Code that relies on "internal" URL paths is not secure by default.
**Prevention:** Ensure `getServerSession` is used to enforce `ADMIN` or `TEACHER` roles on all endpoints performing file system modifications, even if they are intended to be "internal" scripts.
