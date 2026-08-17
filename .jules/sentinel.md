## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - [Critical] Zip Bomb Denial of Service in safe-zip.ts
**Vulnerability:** The `extractZipSafely` function in both `lib/safe-zip.ts` and `demo/la-campus-demo/lib/safe-zip.ts` failed to enforce size limitations on uncompressed zip entries before allocating large memory buffers with `entry.getData()`. This allowed Zip Bombs (e.g., a tiny zip file expanding to gigabytes) to cause an Out-Of-Memory (OOM) crash and Denial-of-Service.
**Learning:** Checking file paths for directory traversal is not sufficient for secure zip extraction. You must also defend against malicious decompression sizes. Relying solely on the zip header size is also insecure because zip headers are easily spoofed, allowing an attacker to bypass header checks and crash the application when `getData()` actually decompresses the payload.
**Prevention:**
1. Implement a maximum uncompressed file size check on the reported header (`entry.header.size`).
2. Implement a secondary validation after calling `getData()` to verify the true decompressed buffer size does not exceed the limit, defeating spoofed headers.
3. Enforce a total maximum extracted byte size limit and maximum file count limit across the entire archive extraction loop.
