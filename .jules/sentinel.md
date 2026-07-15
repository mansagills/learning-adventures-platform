## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Zip Bomb / Denial-of-Service Vulnerabilities
**Vulnerability:** Zip files were being extracted or read directly into memory (`getData()`) without checking the uncompressed file sizes first, making the system vulnerable to Zip Bombs.
**Learning:** `adm-zip` loads the entire uncompressed file content into memory when `getData()` is called. If the zip contains highly compressed but massive files (Zip Bombs), this can exhaust server memory and cause a Denial of Service.
**Prevention:** Always validate `entry.header.size` against a reasonable upper limit (e.g., 50MB for game assets, 1MB for metadata) BEFORE calling `entry.getData()` or writing it to disk.
