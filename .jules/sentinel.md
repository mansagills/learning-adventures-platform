## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Cross-Platform Path Traversal Prevention
**Vulnerability:** The `/api/internal/save-content` endpoint attempted to prevent path traversal by checking `!pathToCheck.startsWith('uploads/temp/')`. However, on Windows, `path.normalize` converts forward slashes to backslashes (`\`), causing this check to always fail and reject valid file uploads.
**Learning:** Hardcoded path separators in `.startsWith()` checks are not cross-platform safe when used in conjunction with `path.normalize()`.
**Prevention:** Always normalize slashes to a consistent format (e.g., `.replace(/\\/g, '/')`) before performing string-based path prefix validation.
