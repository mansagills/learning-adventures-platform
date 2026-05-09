## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - SSTI/RCE via String Interpolation in Catalog Updater
**Vulnerability:** The `/api/internal/update-catalog` endpoint used string interpolation with untrusted user input to programmatically generate TypeScript objects, which were then written directly into `lib/catalogData.ts`. This permitted Server-Side Template Injection (SSTI) and Remote Code Execution (RCE) via malicious payloads (e.g., injecting code inside `metadata.title`).
**Learning:** Even internal tooling workflows that generate source code must sanitize data. Serializing untrusted input via raw string concatenation creates high-severity vectors.
**Prevention:** Always serialize untrusted data into source code files safely using `JSON.stringify()`, which securely escapes quotes and control characters, preventing payload execution.
