## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2024-05-24 - [Zip Bomb Denial of Service Prevention]
**Vulnerability:** The application was vulnerable to Zip Bomb (Decompression Bomb) Denial-of-Service attacks. It blindly called `entry.getData()` on zip entries (e.g., in `extractZipSafely` and package handlers) without first verifying the uncompressed size of the entry, allowing an attacker to upload a tiny zip file that expands into gigabytes of memory, crashing the Node process (OOM).
**Learning:** Checking file size limits on the uploaded `.zip` archive itself is insufficient because zip bombs achieve massive compression ratios. We must enforce limits on the *uncompressed* size of individual files before extracting them into memory.
**Prevention:** Always validate `entry.header.size` against a reasonable maximum threshold (e.g., 50MB for game files, 1MB for metadata) before calling `entry.getData()` when using libraries like `adm-zip`.
