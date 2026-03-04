## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2026-03-04 - [Missing Authorization on Internal API Route]
**Vulnerability:** Missing authorization check on `/api/internal/update-catalog/route.ts`.
**Learning:** In Next.js App Router, middleware is not always sufficient for internal API routes. Explicit `getServerSession` checks are required to prevent unauthorized access.
**Prevention:** Always add explicit authorization checks to internal API routes using `getServerSession` and `authOptions` to ensure the user is authenticated and authorized.
