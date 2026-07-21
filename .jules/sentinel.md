## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Zip Bomb / Denial-of-Service Vulnerability in AdmZip Extraction
**Vulnerability:** Zip extraction and file parsing routines (`extractZipSafely.ts`, `gamePackageHandler.ts`, `coursePackageHandler.ts`) loaded uncompressed zip entry contents into memory via `.getData()` without prior bounds checking on the uncompressed size.
**Learning:** `adm-zip` buffers entire uncompressed file contents in memory when `.getData()` is called. Maliciously crafted zip files (Zip Bombs) with extremely high compression ratios can cause Node.js processes to quickly run out of memory (OOM), leading to Denial of Service (DoS), even if the original zip file size is small. Memory usage must be restricted based on uncompressed size, not just file existence.
**Prevention:**
1. Always enforce maximum uncompressed size limits on Zip entries (e.g., checking `entry.header.size`) *before* invoking `.getData()` or extracting to disk.
2. Establish strict size quotas based on expected file types (e.g., 1MB for `metadata.json`, 50MB for game or lesson files).
