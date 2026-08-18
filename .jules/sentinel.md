## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Zip Bomb / Resource Exhaustion via adm-zip
**Vulnerability:** Zip extraction code throughout the project (e.g., `safe-zip.ts`, `gamePackageHandler.ts`, `coursePackageHandler.ts`) lacked pre-extraction size validation when calling `entry.getData()`. This allowed attackers to upload highly compressed Zip bombs that would decompress to massive sizes in memory, causing Out-Of-Memory (OOM) crashes and Denial of Service (DoS).
**Learning:** Checking the physical zip file size during upload is insufficient if the internal compression ratio is massive. Individual uncompressed file entries must be validated *before* being buffered into memory.
**Prevention:**
Always enforce size limits on individual uncompressed files via `entry.header.size` (e.g., 50MB for general files, 1MB for manifests) before calling `.getData()` or extracting via libraries like `adm-zip`.
