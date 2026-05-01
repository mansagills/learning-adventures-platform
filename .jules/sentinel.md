## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - SSTI/RCE via Unsafe Code Generation in update-catalog
**Vulnerability:** The `/api/internal/update-catalog` endpoint modifies a `.ts` source file dynamically by directly concatenating user input (`request.json()`) into template literals. This is Server-Side Template Injection (SSTI) and allows arbitrary Code Injection / RCE. An authenticated TEACHER or ADMIN could inject executable JS code by passing payloads like `title: "Malicious', executeCode(), description: '"`.
**Learning:** Whenever an application programmatically generates or modifies executable source code (like `.ts` or `.js` files) based on user input, raw string concatenation is inherently dangerous. Standard input validation is insufficient because quotes and structural characters can break out of the intended string context.
**Prevention:** Always use safe serialization formats (like `JSON.stringify()`) to embed dynamic data into source code templates. This guarantees that strings are properly escaped and treated strictly as literal data, completely preventing injection breakouts.
