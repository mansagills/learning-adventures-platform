## 2026-01-31 - Mass Assignment Privilege Escalation
**Vulnerability:** The signup endpoint allowed users to specify their role directly in the request body, which was passed unsanitized to `prisma.user.create`. This allowed attackers to create ADMIN accounts.
**Learning:** Using `req.json()` directly into `prisma.create` is dangerous if the model has sensitive fields like `role`.
**Prevention:** Always validate and sanitize input, especially for sensitive fields. Use a whitelist for allowed values (e.g., allow `STUDENT`, `PARENT`, `TEACHER` but not `ADMIN`). Explicitly construct the `data` object instead of spreading the request body.

## 2026-02-01 - Admin Domain Privilege Escalation
**Vulnerability:** The application logic automatically upgraded any user with an `@learningadventures.org` email to ADMIN role upon sign-in. However, the public signup endpoint did not restrict registration of emails with this domain, allowing an attacker to register as an admin simply by using that email domain.
**Learning:** Domain-based role mapping is convenient but dangerous if email ownership is not strictly verified or if the domain is not restricted in public registration endpoints. Security checks in one layer (middleware/signin) can be bypassed if the entry point (signup) is not equally secured.
**Prevention:** Block registration of sensitive domains in public signup forms. Alternatively, strictly enforce email verification before granting privileges based on email domain.
