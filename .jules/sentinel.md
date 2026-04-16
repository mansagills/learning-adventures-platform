## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Path Traversal in extract-metadata API
**Vulnerability:** The `/api/internal/extract-metadata` endpoint instantiated `AdmZip` using a path directly concatenated from user input (`zipPath`), allowing arbitrary file reads and path traversal.
**Learning:** Even if an API only reads files to extract metadata, passing raw, unsanitized paths to file system or zip libraries can lead to Local File Inclusion (LFI) or information disclosure. The `join` function alone is insufficient for security; it resolves paths but doesn't restrict the boundary.
**Prevention:**
1. Always fully resolve absolute paths using `path.resolve`.
2. Enforce explicit directory boundaries using strict string prefix matching: `!fullPath.startsWith(publicDir + path.sep) && fullPath !== publicDir`.
