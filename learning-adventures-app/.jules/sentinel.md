## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-03-01 - Path Traversal in extract-metadata API
**Vulnerability:** The `/api/internal/extract-metadata` endpoint was vulnerable to Path Traversal. The `zipPath` parameter from the JSON body was directly concatenated using `path.join` and passed into `AdmZip` without any validation against traversal sequences (`../`). This allowed an attacker to read/parse arbitrary files on the system outside the intended `public` directory.
**Learning:** `path.join` does not inherently prevent path traversal when user input contains `../`.  APIs that instantiate `AdmZip` (or perform file reads) using user-provided paths must strictly validate those paths.
**Prevention:** Always normalize the user-provided path, explicitly reject inputs containing traversing sequences like `..`, use `path.resolve()` to generate the absolute path, and verify that the resolved path strictly `.startsWith()` the expected base directory (e.g., `public`).
