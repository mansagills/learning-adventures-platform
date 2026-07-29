## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-27 - [Zip Bomb DoS]
**Vulnerability:** Unconstrained calls to `AdmZip.getData()` and `entry.getData()` allowed for Zip Bomb Denial-of-Service (DoS) attacks by buffering arbitrarily large uncompressed files into memory.
**Learning:** Checking the zip archive's overall size is insufficient if the compression ratio is extremely high. The individual uncompressed files inside the archive must have size limits enforced before extraction or reading.
**Prevention:** Always enforce size limits on individual uncompressed files (e.g., `entry.header.size > MAX_SIZE`) before buffering their contents into memory via methods like `.getData()` or during extraction.
