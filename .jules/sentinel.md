## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - SSTI/RCE via Unsafe Code Generation in update-catalog
**Vulnerability:** The `/api/internal/update-catalog` endpoint modifies an executable TypeScript file (`lib/catalogData.ts`) by dynamically injecting user-provided input (`metadata`) using raw string interpolation inside template literals (e.g., `id: '${newAdventure.id}'`).
**Learning:** This is a classic Code Injection/Server-Side Template Injection (SSTI) vector. If an attacker passes crafted input (like `\', inject: process.exit(), \n '`), they can break out of the string literal and execute arbitrary code on the server when the file is built/run.
**Prevention:**
1. Never use raw string concatenation or template literals to inject user input into source code files.
2. Always serialize external data safely using `JSON.stringify()` before writing it to a file.
3. Enforce strict type coercion (e.g., `Boolean()`, `String()`) to ensure the payload matches the expected schema and blocks prototype pollution or crafted objects.
