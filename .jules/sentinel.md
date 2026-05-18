## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - SSTI/RCE via Programmatic Code Generation in update-catalog
**Vulnerability:** The `/api/internal/update-catalog` endpoint modifies the `lib/catalogData.ts` file programmatically. It was constructing the object string by interpolating raw string literals containing user-provided metadata without strict typing or stringification (e.g. `id: '${newAdventure.id}'`), creating a Server-Side Template Injection (SSTI) and Remote Code Execution (RCE) risk.
**Learning:** Whenever modifying source code programmatically, unescaped string interpolation from user-provided data is extremely dangerous because an attacker can break out of string literals and inject executable JavaScript/TypeScript.
**Prevention:**
1. Use `JSON.stringify()` for all values (strings, arrays) serialized into source code files, which automatically handles proper escaping and quote enclosures.
2. Explicitly coerce types (e.g., `String()`, `Boolean()`, `Array.isArray()`) before `JSON.stringify()` to prevent attackers from bypassing expected structures using crafted objects.
3. Treat any programmatic code generation feature with extreme scrutiny during security reviews.
