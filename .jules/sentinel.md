## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Critical RCE/SSTI in update-catalog
**Vulnerability:** The `/api/internal/update-catalog` endpoint directly interpolated untrusted user input from an API payload into a template string, which was then written directly into a TypeScript source file (`lib/catalogData.ts`). This allowed Server-Side Template Injection (SSTI) and Remote Code Execution (RCE) via malicious string payloads (e.g., closing quotes and injecting arbitrary JS functions or objects).
**Learning:** Programmatically modifying executable source code (`.ts` or `.js` files) is inherently dangerous. Standard template strings offer zero protection against string escapes that break the code structure.
**Prevention:** Always serialize untrusted data into a safe format, like `JSON.stringify()`, before injecting it into source code. JSON is natively compatible with JavaScript object syntax and correctly escapes quotes, newlines, and malicious JS code blocks.
