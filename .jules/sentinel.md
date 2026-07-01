## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Zip Bomb / DoS via AdmZip getData()
**Vulnerability:** The `/api/internal/extract-metadata` endpoint was vulnerable to Zip Bomb DoS attacks. It read the uncompressed contents of `metadata.json` directly into memory using `AdmZip`'s `metadataEntry.getData()` without checking the uncompressed file size first.
**Learning:** Using `adm-zip` safely requires validating uncompressed file sizes (`entry.header.size`) before attempting to buffer them into memory. The application's architecture handles arbitrary user-uploaded zip files, making this a critical defense point.
**Prevention:** Always enforce a strict maximum size limit (e.g., 1MB) on individual files before calling `entry.getData()` or extracting them to disk.
