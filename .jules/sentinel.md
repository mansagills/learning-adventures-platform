## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2026-05-15 - Prevent SSTI/RCE in update-catalog
**Vulnerability:** The `/api/internal/update-catalog` API endpoint was vulnerable to Server-Side Template Injection (SSTI) leading to potential Remote Code Execution (RCE). User-provided input was directly interpolated into raw template strings before being written to a server-side TypeScript source file (`lib/catalogData.ts`).
**Learning:** When programmatically modifying executable code files, utilizing template literals or raw string concatenation with unvalidated user input creates a severe security risk. Attackers can escape string boundaries (e.g., using quotes) and inject arbitrary code that gets executed by the server.
**Prevention:** Never use raw string concatenation or template literals for user input when generating code. Always use robust serialization methods like `JSON.stringify()` combined with strict type coercion (e.g., `String()`, `Boolean()`) to safely escape all control characters, quotes, and newlines.
