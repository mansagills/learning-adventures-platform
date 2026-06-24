## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2024-05-18 - [Cryptographically Weak Randomness]
**Vulnerability:** Weak random number generation using `Math.random()` to generate workflow IDs and temporary file IDs.
**Learning:** In Next.js client/server environments, predictability in generated IDs (like those returned from `Math.random()`) could potentially allow ID collision attacks or predictability vectors across the platform. Using `Math.random()` in places like workflow IDs or file uploaders bypasses secure requirements.
**Prevention:** Use `crypto.randomUUID()` in the frontend and `crypto.randomUUID()` or `randomInt` in Node.js for generating secure unique identifiers instead of using `Math.random()`.
