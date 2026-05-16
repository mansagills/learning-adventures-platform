## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - SSTI / RCE via String Concatenation in update-catalog
**Vulnerability:** The `/api/internal/update-catalog/route.ts` API dynamically generates TypeScript code (`lib/catalogData.ts`) by concatenating raw user input (`metadata.title`, `metadata.description`, etc.) directly into a template literal. An attacker could inject arbitrary JavaScript code (Server-Side Template Injection) leading to Remote Code Execution when the file is executed by the server.
**Learning:** Programmatically updating source code files (e.g., `.ts` files) using string concatenation with user-supplied data is inherently dangerous and bypasses normal input validation layers.
**Prevention:** Always serialize untrusted user data using `JSON.stringify()` when generating or updating source code files. This treats the input purely as data, correctly escaping quotes and special characters, and prevents arbitrary code execution.
