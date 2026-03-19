# Security Fix: Add missing authorization check to `app/api/internal/update-catalog/route.ts`

**Vulnerability:**
The `app/api/internal/update-catalog/route.ts` endpoint is an internal API that updates the `lib/catalogData.ts` file using `fs.writeFile`. However, it completely lacks authentication and authorization checks. An unauthenticated attacker can send a POST request with an arbitrary `metadata` object and modify the application's catalog file. While they can't execute arbitrary code directly via this file due to how it's formatted in the API route, they can inject malicious content into the catalog or cause a denial-of-service by corrupting the file or filling it with garbage data.

**Plan:**
1.  *Add missing `getServerSession` authorization checks to `app/api/internal/update-catalog/route.ts`.*
    - Import `getServerSession` from `next-auth/next` and `authOptions` from `@/lib/auth`.
    - Retrieve the session.
    - Validate that the user is authenticated and has the `ADMIN` or `TEACHER` role (consistent with other internal content APIs like `save-content` and `extract-metadata`).
    - Return a 401 Unauthorized or 403 Forbidden response if the check fails.
2.  *Run the security tests*
    - Ensure tests pass with the new authorization layer.
    - We already created `tests/security/update_catalog_auth.test.ts` to test this fix. I will verify it passes.
3.  *Complete pre-commit steps.*
    - Run formatting, linting, and other checks as required by the environment.
4.  *Commit and push changes.*
    - Submit the PR detailing the security vulnerability and fix.
