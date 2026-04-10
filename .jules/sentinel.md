## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2024-05-20 - Path Traversal in extract-metadata route
**Vulnerability:** The `/api/internal/extract-metadata` endpoint allowed an attacker to read arbitrary zip files anywhere on the system (e.g. `../../../../etc/passwd` ending in .zip) by not securely checking the bounds of the resolved file path against the expected `public` directory.
**Learning:** `path.join()` inherently resolves `../` tokens but does not guarantee the resulting path stays within a safe root directory. This makes it unsafe to use with user-provided path segments unless followed by an explicit prefix check.
**Prevention:**
Always use `path.resolve` to get the absolute target path, resolve the allowed root directory, and verify the target path strictly starts with `rootDir + path.sep` (or equals the `rootDir`). Do not use relative `path.join` for untrusted path construction.
