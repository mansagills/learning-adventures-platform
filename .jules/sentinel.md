## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - [Denial of Service (DoS)] Zip Bomb Vulnerability
**Vulnerability:** The codebase processed user-uploaded zip files across multiple endpoints using `AdmZip`. The `getData()` method buffers the *entire* uncompressed file entry into memory. A malicious user could upload a highly compressed "Zip Bomb" (e.g., a 10KB zip containing a 4GB dummy file) to exhaust server memory and trigger a Denial of Service (DoS).
**Learning:** `AdmZip` does not protect against excessive uncompressed size inherently. When processing user-uploaded archives, you must always evaluate the uncompressed size via the file headers *before* allocating buffers.
**Prevention:** Always enforce a file size check on `entry.header.size` before calling `entry.getData()`. For configuration/JSON metadata files, a strict limit like 1MB is recommended. For heavier assets (media, game files), higher limits (e.g., 50MB) are acceptable but still necessary to prevent unbounded memory allocation.
