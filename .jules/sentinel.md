## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Code Injection / SSTI in app/api/internal/update-catalog/route.ts
**Vulnerability:** The API endpoint dynamically wrote user-provided content into `lib/catalogData.ts` using raw template literal concatenation. This meant attackers could use unescaped quotes (`'`) to escape the JS object literal context and execute arbitrary JS payloads or break the syntax.
**Learning:** Programmatic modification of source code files (`.ts`, `.js`) should never rely on raw string building with untrusted user input, as it acts as a vector for Code Injection/Server-Side Template Injection.
**Prevention:**
1. Always use standard serialization methods like `JSON.stringify()` when generating executable code blocks based on user data to safely encode string boundaries and malicious payloads.
