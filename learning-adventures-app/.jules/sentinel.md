## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-03-29 - Critical Path Traversal / Arbitrary File Read in extract-metadata
**Vulnerability:** The `/api/internal/extract-metadata` endpoint directly joined user-supplied `zipPath` input with `process.cwd()/public` using `path.join()`. By providing paths starting with `../` (e.g. `../../../etc/passwd`), an attacker (even with an authorized role) could bypass the public directory restriction to read any file on the server's filesystem, leading to potential data exposure.
**Learning:** `path.join()` is insufficient for security boundaries. It resolves `../` sequentially but allows resulting paths to escape the intended root directory.
**Prevention:** Always normalize the user input to strip traversal sequences (e.g., `normalize(path).replace(/^(\.\.(\/|\\|$))+/, '')`) OR use `path.resolve()` and explicitly verify that the fully resolved absolute path starts with the intended root directory path using `.startsWith(rootDir)`.
