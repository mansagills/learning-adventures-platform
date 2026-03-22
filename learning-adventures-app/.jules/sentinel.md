## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-24 - Critical Zip Slip and Path Traversal in save-content fix
**Vulnerability:** The fix to prevent Zip Slip and path traversal in `/api/internal/save-content` was fundamentally broken due to a typo. The code attempted to check for the existence of an undefined variable `resolvedZipPath` instead of using the correctly constructed `zipFullPath`.
**Learning:** Security fixes must be carefully tested in full. Even with the best intentions, referencing an undefined variable completely breaks the intended security checks, allowing the application to crash or behave unpredictably.
**Prevention:**
1. Always use strict TypeScript configurations (`strict: true`, `noUnusedLocals: true`, etc.) to catch undefined variables at compile time.
2. Ensure that unit tests cover both positive and negative scenarios, and actually exercise the vulnerable code path to confirm the vulnerability is fixed and no regression is introduced.
