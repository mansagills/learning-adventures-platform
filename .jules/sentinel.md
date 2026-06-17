## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Critical RCE/SSTI in update-catalog
**Vulnerability:** The `/api/internal/update-catalog` endpoint was vulnerable to Server-Side Template Injection (SSTI) and Remote Code Execution (RCE). It used a raw template literal to construct JavaScript code dynamically from user input, which was then appended directly to the `lib/catalogData.ts` file.
**Learning:** Any endpoint that writes code or modifies server-side files must never use string concatenation or template literals with raw user input.
**Prevention:**
1. Always use `JSON.stringify(data, null, 2)` when embedding untrusted object data into generated JSON, JS, or TS files. It safely escapes quotes and handles formatting naturally.
2. Validate incoming payloads with strict type schemas (e.g. Zod) to ensure types don't manipulate logic constraints.
