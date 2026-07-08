## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2024-07-08 - [Zip Bomb DoS]
**Vulnerability:** Memory exhaustion Denial-of-Service (Zip Bomb) possible when extracting `metadata.json` from ZIP files in `app/api/internal/extract-metadata/route.ts` because the uncompressed size wasn't checked before calling `.getData()`.
**Learning:** `adm-zip`'s `.getData()` reads the entire uncompressed file contents into a memory buffer. If an attacker provides a highly compressed file that expands to gigabytes, the Node.js process will crash with an out-of-memory error.
**Prevention:** Always check `entry.header.size` against a reasonable limit (e.g., 1MB) before buffering uncompressed ZIP entry contents.
