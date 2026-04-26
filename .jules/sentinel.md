## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Critical RCE via Template Injection in Source Code Modification
**Vulnerability:** The `/api/internal/update-catalog/route.ts` endpoint modified the `lib/catalogData.ts` source file by directly embedding user input into the TypeScript file using raw template literals (e.g., `title: '${newAdventure.title}'`). This created a critical Server-Side Template Injection (SSTI) / Remote Code Execution (RCE) vulnerability, allowing an attacker to inject arbitrary code (e.g., using `', maliciousKey: (function(){ /* payload */ })(), description: '`) into the codebase.
**Learning:** Features that programmatically modify source code files must treat user input with extreme caution. Simple string concatenation or template literals are insufficient because they allow attackers to break out of string boundaries and inject executable syntax.
**Prevention:**
1. Avoid modifying source files programmatically if possible (prefer a database).
2. If source code generation/modification is required, ALWAYS use `JSON.stringify()` on user input to safely encode data, ensuring quotes, newlines, and other special characters are properly escaped, and the payload remains strictly data rather than executable code.
