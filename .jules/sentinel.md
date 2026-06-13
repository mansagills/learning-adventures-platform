## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## $(date +%Y-%m-%d) - [CRITICAL] Fixed Server-Side Template Injection (SSTI) in update-catalog API
**Vulnerability:** The `app/api/internal/update-catalog/route.ts` API endpoint, designed to programmatically update `lib/catalogData.ts`, constructed TypeScript object literals manually using template strings. Attackers could inject arbitrary code or break the source file structure by including unescaped characters (like single quotes) in JSON fields.
**Learning:** Whenever dynamically writing source code to a `.ts` file, never construct strings manually via interpolation for complex nested user objects. Code generation is inherently dangerous and must rely on standard safe serialization.
**Prevention:** Use `JSON.stringify(object)` to convert data into syntactically valid JSON (and thus TypeScript) literals securely.
