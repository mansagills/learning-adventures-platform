## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Zip Bomb Denial-of-Service in Zip Extraction
**Vulnerability:** Zip extraction operations using AdmZip across `lib/safe-zip.ts`, `lib/upload/gamePackageHandler.ts`, and `lib/upload/coursePackageHandler.ts` did not limit file sizes or entry counts prior to extraction. A malicious user could upload a small, highly-compressed zip file that expands into gigabytes of data when buffered into memory using `.getData()` or during writing, causing an out-of-memory error and denying service.
**Learning:** Checking the physical file upload size limit (e.g. 100MB max) is insufficient because decompression happens in-memory. Libraries like AdmZip load whole files into Buffer objects, making memory exhaustion a major vector.
**Prevention:** Always enforce size limits on the decompressed file sizes by checking `entry.header.size` against acceptable bounds before calling `.getData()`. Additionally, enforce a maximum total uncompressed size and a maximum limit on the total number of entries during a full zip extraction operation to safeguard the process against decompression bombs.
