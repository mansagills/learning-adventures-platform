## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2024-06-25 - [Zip Bomb DoS]
**Vulnerability:** Zip Bomb Denial-of-Service via Unbounded Memory Allocation
**Learning:** When using `adm-zip`, calling `entry.getData()` fully extracts the compressed entry into memory. Without file size checks before extraction, uploading heavily compressed malicious zip files (Zip Bombs) causes severe memory exhaustion, crashing the Node.js backend.
**Prevention:** Always enforce file size limits based on `entry.header.size` before reading data from zip entries, using thresholds appropriate to the file type (e.g. 50MB for game assets and 1MB for configuration JSON).
