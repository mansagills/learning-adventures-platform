## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Path Traversal Prefix Matching Bypass in storageRouter
**Vulnerability:** The `routeFileUpload` function in `lib/storage/storageRouter.ts` used `!resolvedTarget.startsWith(publicDir)` to prevent path traversal when saving files. This is vulnerable to a prefix-matching bypass. If an attacker provides a path like `../public_keys/secret.pem`, it resolves to `/app/public_keys/secret.pem`. This path starts with `/app/public` (assuming `publicDir` is `/app/public`), bypassing the check and allowing arbitrary file write outside the intended directory.
**Learning:** `startsWith` on file paths without trailing slashes is dangerous and a common source of bypasses in path traversal checks. It strictly checks string prefixes, not path boundaries.
**Prevention:**
1. When checking if a path is inside a directory using string manipulation, always append the path separator (`path.sep`) to the directory path (e.g., `!resolvedTarget.startsWith(publicDir + path.sep)`).
2. Handle the edge case where the resolved target is exactly the directory itself (`resolvedTarget !== publicDir`).
