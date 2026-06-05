## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Insecure Randomness in Certificate Verification Codes
**Vulnerability:** The `generateVerificationCode` function in `lib/certificates/certificateUtils.ts` used `Math.random()` to generate a 12-character alphanumeric code for course certificates. `Math.random()` is not cryptographically secure and can be predicted, potentially allowing attackers to forge or guess verification codes.
**Learning:** Functions that generate sensitive or unguessable values (tokens, passwords, verification codes) often mistakenly rely on standard `Math.random()` rather than a secure RNG.
**Prevention:** Always use Node.js `crypto` module (e.g., `crypto.randomInt()`, `crypto.randomBytes()`) or the Web Crypto API for generating tokens that are used for verification or authentication.
