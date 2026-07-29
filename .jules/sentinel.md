## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Zip Bomb (Decompression Bomb) DoS Risk in AdmZip
**Vulnerability:** Across `safe-zip.ts`, `gamePackageHandler.ts`, and `coursePackageHandler.ts`, the `adm-zip` library was used to call `entry.getData()` on zip file entries without first verifying the uncompressed size (`entry.header.size`). Because `getData()` buffers the entire uncompressed file into memory, an attacker could upload a small zip containing a highly compressed massive file (a Zip Bomb) causing a Denial-of-Service (OOM crash).
**Learning:** Even when protecting against Zip Slip (path traversal), Zip Bombs are a separate attack vector that must be explicitly mitigated. Any library that reads file contents into memory must be gated by a maximum size check.
**Prevention:**
1. Always enforce a reasonable size limit (e.g., 50MB for game/lesson files, 1MB for metadata) by checking `entry.header.size` before calling `.getData()`.
2. When mocking AdmZip entries in tests, include a mock `header: { size: <number> }` so these security limits don't break existing tests.
3. Be aware that the project duplicates some backend logic (like `lib/safe-zip.ts`) into demo apps (`demo/la-campus-demo/lib/safe-zip.ts`), and fixes must be applied to both.
