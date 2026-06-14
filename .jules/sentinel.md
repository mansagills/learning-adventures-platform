## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2024-06-14 - Replace Insecure Math.random with Crypto
**Vulnerability:** Weak random number generation using `Math.random()`. `Math.random()` is not cryptographically secure and produces predictable outputs. This was used to generate child usernames, certificate verification codes, and workflow IDs, which could theoretically allow predictability or collision attacks.
**Learning:** Even internal workflow IDs and display names benefit from strong entropy to prevent subtle business logic collisions or profiling. Node.js `crypto` module methods (`crypto.randomInt`, `crypto.randomUUID`) provide an easy, secure drop-in replacement.
**Prevention:** Avoid `Math.random()` for any values that require uniqueness, unguessability, or security. Always use `crypto.randomInt` (to avoid modulo bias) or `crypto.randomUUID` in Node.js backend code.
