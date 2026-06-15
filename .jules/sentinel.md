## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2024-05-18 - Prevented Insecure Randomness\n**Vulnerability:** Weak random number generation (`Math.random()`) was used for sensitive values like verification codes, workflow IDs, and anonymous child usernames.\n**Learning:** In Node.js, `Math.random()` is not cryptographically secure and can be predicted, opening vectors for brute-force attacks on verification mechanisms or session/workflow manipulation.\n**Prevention:** Always use the built-in `crypto` module (e.g., `crypto.randomInt()`, `crypto.randomUUID()`) when generating unguessable strings, codes, or identifiers. `crypto.randomInt()` is preferred over `crypto.randomBytes() % n` to avoid modulo bias when picking from arrays.
