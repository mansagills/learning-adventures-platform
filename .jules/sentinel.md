## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Critical RCE/SSTI in update-catalog
**Vulnerability:** The `/api/internal/update-catalog` endpoint was vulnerable to Server-Side Template Injection (SSTI) and Remote Code Execution (RCE). It dynamically updated the `lib/catalogData.ts` source code file by appending user-supplied strings directly into the file without escaping them. An attacker could inject arbitrary TypeScript/JavaScript code by ending a string literal and executing commands.
**Learning:** Writing user input directly into executable source code files is inherently dangerous. When string interpolation or template literals are used to generate code, characters like quotes and newlines must be strictly escaped.
**Prevention:**
1. Never use string interpolation directly for user data when generating executable source code.
2. Always use `JSON.stringify()` to safely serialize user input into valid, escaped JSON strings before embedding them into JavaScript/TypeScript.
