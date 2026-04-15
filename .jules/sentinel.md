## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Path Traversal in extract-metadata API route
**Vulnerability:** The `app/api/internal/extract-metadata/route.ts` API route directly used `path.join` with user-supplied relative path (`zipPath`), without sufficiently verifying if the resolved path was within the intended directory (`publicDir`). This allowed directory traversal attacks via `AdmZip` leading to arbitrary filesystem reads (e.g. `../../../../etc/passwd`).
**Learning:** `path.join` automatically resolves relative paths like `../` and can inadvertently escape boundaries if not checked against a fixed prefix. The existing code missed validating the path bounds before feeding it into the file system or archive extraction libraries.
**Prevention:**
1. Convert user paths to absolute paths using `path.resolve` with an explicit base directory.
2. Validate that the resolved absolute path starts exactly with the expected directory path prefix (`publicDir + path.sep`) and check for strict equality to the directory.
3. Reject any operations when path bounds are escaped with a 400 Bad Request error.
