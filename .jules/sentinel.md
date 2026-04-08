## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Unauthenticated Code Modification in update-catalog
**Vulnerability:** The `/api/internal/update-catalog/route.ts` endpoint was completely unauthenticated. It modifies the source code file `lib/catalogData.ts` via regex search and replace based on user-provided JSON. This is an extremely dangerous operation that could lead to Remote Code Execution (RCE), Cross-Site Scripting (XSS), or permanent corruption of the catalog data.
**Learning:** Middleware alone is not sufficient protection for sensitive endpoints, especially those that write directly to the application source code. Any code that modifies source code must have strict, defense-in-depth authentication mechanisms built into the route handler itself.
**Prevention:**
1. Always add `getServerSession` checks explicitly within Next.js API route handlers, even if middleware is configured, especially for high-risk operations.
2. Avoid programmatic modification of source files (`.ts`) in production environments; use a database instead for catalog/inventory data. If file modification is strictly required, it must be gated behind robust admin-only authentication.
