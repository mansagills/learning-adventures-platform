## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Zip Bomb / Denial-of-Service Vulnerability in Package Handlers
**Vulnerability:** The `lib/upload/coursePackageHandler.ts` and `lib/upload/gamePackageHandler.ts` files were calling `getData()` on zip entries (e.g. `metadata.json`, `lessonEntry`, `gameEntry`, `thumbnailEntry`) without first enforcing size limits based on `entry.header.size`. If an attacker uploaded a highly compressed zip file containing extremely large files (a "Zip bomb"), calling `getData()` would buffer the uncompressed contents into memory, potentially leading to memory exhaustion and Denial-of-Service (DoS).
**Learning:** Even when parsing zip files internally for metadata validation, extracting the contents into memory without size constraints exposes the server to Zip bomb attacks. Vulnerabilities often manifest in duplicated files across different paths (e.g., `lib/` vs `demo/la-campus-demo/lib/`).
**Prevention:**
1. Always enforce specific size limits on individual uncompressed files via `entry.header.size` (e.g., 50MB for general files, 1MB for metadata files) before calling `.getData()` or extracting them.
2. Ensure size constraint logic is applied symmetrically across all processing and validation functions that attempt to read file contents from a Zip.
