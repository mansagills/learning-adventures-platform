## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - SSTI / Code Injection in API source code modification
**Vulnerability:** The `/api/internal/update-catalog/route.ts` endpoint generated TypeScript code (`lib/catalogData.ts`) by directly concatenating user input (`metadata.title`, `metadata.description`, etc.) into a string template without any escaping. This allowed attackers to inject raw JavaScript into the generated file, leading to Server-Side Template Injection (SSTI) and Remote Code Execution (RCE).
**Learning:** When APIs programmatically modify source code, using string templates (`\``) is inherently dangerous as it bypasses standard serialization safety.
**Prevention:** Always use `JSON.stringify()` when generating JS/TS source code containing untrusted user data. It provides automatic escaping of characters like quotes and newlines, ensuring the data remains safely contained as string literals within the generated object syntax.
