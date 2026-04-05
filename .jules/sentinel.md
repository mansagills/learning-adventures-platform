## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2024-10-24 - [Path Traversal in extract-metadata]
**Vulnerability:** A Path Traversal vulnerability existed in `app/api/internal/extract-metadata/route.ts`. The API endpoint accepted a `zipPath` parameter from user input and directly joined it to the `public` directory path. Since `path.join` automatically resolves `../` segments, an attacker could supply a path like `../../../../etc/passwd` to traverse outside the intended directory and potentially read arbitrary system files (if AdmZip parses it or throws an error disclosing file existence).
**Learning:** `path.join` does not inherently protect against path traversal if the input contains `../`. The application must verify the resolved absolute path.
**Prevention:** Always use `path.resolve` after `path.join` to obtain the absolute path, and then strictly verify that the resolved path starts with the intended base directory (including a trailing separator) or exactly matches it.
