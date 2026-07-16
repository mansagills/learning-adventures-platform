## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Zip Bomb DoS in Package Extractors
**Vulnerability:** The application was vulnerable to Zip Bomb (Decompression Bomb) Denial-of-Service attacks when parsing uploaded zip files (`metadata.json`, game files, lesson files) because `adm-zip` buffers extracted file content into memory and no uncompressed file size validation was enforced before calling `.getData()`.
**Learning:** Security mitigations in extraction libraries are often missing. Even with maximum upload payload limits (e.g. 100MB), highly compressed zip files can unpack to gigabytes of data, leading to instant application crashes (Out-Of-Memory) during buffer creation.
**Prevention:**
1. Always evaluate compression ratios during archive extraction.
2. Ensure strict limits on individual entry sizes before extraction by inspecting `entry.header.size`.
3. During test mock creation, ensure you mock `entry.header: { size: N }` appropriately to satisfy these limits.
