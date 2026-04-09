## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Unauthenticated AI Endpoint in claude-refine
**Vulnerability:** The `/api/internal/claude-refine/route.ts` endpoint lacked any authentication or authorization checks, directly calling the Anthropic API. This allowed unauthenticated actors to exhaust API credits and bypass intended access controls.
**Learning:** Internal tool endpoints, particularly those wrapping paid third-party APIs, must be explicitly secured at the route level rather than relying solely on middleware or client-side UI hiding.
**Prevention:** Always enforce role-based access control (e.g., `getServerSession` checking for `ADMIN` or `TEACHER`) on all backend API routes before interacting with external services.
