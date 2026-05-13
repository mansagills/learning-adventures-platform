## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2024-05-13 - [CRITICAL] Prevent Server-Side Template Injection (SSTI) / RCE in Catalog Updater
**Vulnerability:** The `app/api/internal/update-catalog/route.ts` endpoint was taking unvalidated `metadata` input from the request body and directly concatenating it using raw template literals into the `lib/catalogData.ts` source code file.
**Learning:** Whenever you programmatically generate or modify executable source code (like `.ts` or `.js` files), you must never use raw string concatenation or template literals to embed user input. Attackers can escape string boundaries (e.g., using `\', maliciousCode() //`) and execute arbitrary Node.js code on the server (RCE).
**Prevention:** Always use `JSON.stringify()` to safely serialize untrusted data before embedding it into source code. Furthermore, enforce strict type coercion (e.g., `String()`, `Boolean()`) before serialization to ensure attackers cannot bypass expected types using crafted objects or arrays.
