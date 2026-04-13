## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Path Traversal in extract-metadata, agent-files upload, publish, and update-catalog endpoints
**Vulnerability:** Several endpoints like `/api/internal/extract-metadata` read files based on `zipPath` without fully checking path traversal patterns (it replaced initial slashes but did not validate the resolved path). Also, `publicPath`, `UPLOAD_DIR`, and `catalogDataPath` lacked proper boundary checking with `path.resolve` to verify they remain in the intended subdirectories or directories.
**Learning:** Normalizing or prefix checking without fully resolving the path with `path.resolve` leaves code vulnerable to path traversal (e.g. `../` payloads traversing out of expected directories). `path.resolve()` with `startsWith()` validation against the intended base directory is a necessary pattern to prevent path traversal when using file paths.
**Prevention:**
1. Always resolve paths completely before verifying directory constraints using `path.resolve()`.
2. Compare the `resolvedPath` against the intended `baseDir` using `startsWith()` (or exact match).
