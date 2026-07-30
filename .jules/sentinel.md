## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Zip Bomb / Denial-of-Service Vulnerability in Package Handlers
**Vulnerability:** The `AdmZip` library was used to parse user-uploaded zip files without checking the uncompressed file sizes beforehand, leaving the platform vulnerable to Zip bomb (Decompression bomb) attacks which could exhaust server memory and disk space.
**Learning:** Security bounds checks are often overlooked when extracting archives. Files within a zip must have their declared headers validated before buffering them into memory. A malicious zip with a tiny footprint could declare huge files to mount a DoS attack.
**Prevention:**
1. Always validate `entry.header.size` against strict file size limits (e.g., 50MB for general files, 1MB for metadata) before calling `entry.getData()` or extracting entries using `fs.writeFile`.
2. Apply these limits consistently across all zip extraction mechanisms (`safe-zip.ts`, `gamePackageHandler.ts`, `coursePackageHandler.ts`).
3. Ensure mocks in tests reflect this new constraint by supplying `header: { size: X }` where `getData()` is mocked.
