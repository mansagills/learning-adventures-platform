## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Insecure Randomness in Security-Sensitive Fields
**Vulnerability:** `Math.random()` was being used to generate supposedly unguessable values, specifically certificate verification codes and anonymous child usernames.
**Learning:** `Math.random()` uses an insecure PRNG (pseudo-random number generator) that is predictable. In security contexts like verification codes (which prove authenticity) or anonymous usernames (which provide privacy), predictability can lead to enumeration or forgery.
**Prevention:** Always use cryptographically secure methods like Node's `crypto.randomBytes()` or `crypto.randomInt()` when generating tokens, verification codes, or anonymizing identifiers. `crypto.randomInt()` is preferred over modulo arithmetic to avoid modulo bias when picking items from an array.
