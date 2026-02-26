## 2026-01-31 - Mass Assignment Privilege Escalation
**Vulnerability:** The signup endpoint allowed users to specify their role directly in the request body, which was passed unsanitized to `prisma.user.create`. This allowed attackers to create ADMIN accounts.
**Learning:** Using `req.json()` directly into `prisma.create` is dangerous if the model has sensitive fields like `role`.
**Prevention:** Always validate and sanitize input, especially for sensitive fields. Use a whitelist for allowed values (e.g., allow `STUDENT`, `PARENT`, `TEACHER` but not `ADMIN`). Explicitly construct the `data` object instead of spreading the request body.

## 2026-02-01 - Admin Domain Privilege Escalation
**Vulnerability:** The authentication system automatically promotes users with `@learningadventures.org` emails to ADMIN upon login. However, the signup endpoint did not restrict registration with these emails, allowing anyone to register as an attacker and gain ADMIN privileges.
**Learning:** Security logic in one component (auth provider callbacks) can create vulnerabilities if assumptions (e.g., "only admins have these emails") are not enforced in other components (signup).
**Prevention:** Implement defense-in-depth by validating sensitive domains at the signup stage. Ensure that "trusted" identifiers like email domains are actually verified or restricted before granting privileges based on them.

## 2026-02-02 - Implicit Admin Role Assignment Removal
**Vulnerability:** Despite signup restrictions, the `lib/auth.ts` and `middleware.ts` still contained logic to automatically grant `ADMIN` privileges to any user with a `@learningadventures.org` email address (e.g. via OAuth). This bypasses signup checks and relies on weak domain verification.
**Learning:** Hardcoded "magic" privileges based on email domains are a persistent security risk. Even if registration is blocked, other vectors (OAuth, spoofing) might exist.
**Prevention:** Remove implicit privilege escalation logic entirely. Role assignment should always be explicit (database field) and never inferred from user attributes like email address in the application code.
