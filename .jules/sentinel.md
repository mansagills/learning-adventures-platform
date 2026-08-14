## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Zip Bomb / Denial-of-Service Risk in adm-zip extraction
**Vulnerability:** The `extractZipSafely` function in `lib/safe-zip.ts` did not check the size of individual uncompressed files inside the Zip archive before extracting them into memory using `entry.getData()`. This could lead to a Zip Bomb Denial-of-Service (DoS) attack, where an attacker uploads a highly compressed file that expands to gigabytes of data, exhausting server memory.
**Learning:** Even when guarding against Zip Slip (path traversal), processing untrusted compressed files still carries memory exhaustion risks if uncompressed sizes are not validated before buffering.
**Prevention:**
1. Always enforce maximum uncompressed size limits (e.g. 50MB) on individual Zip entries using `entry.header.size`.
2. Evaluate and enforce these limits before calling `.getData()` which buffers the entire uncompressed file into memory.
