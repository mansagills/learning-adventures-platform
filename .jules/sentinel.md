## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-28 - Insecure Randomness in Security-Sensitive Functions
**Vulnerability:** Found `Math.random()` being used to generate cryptographically sensitive values like verification codes, workflow IDs, and username identifiers in multiple backend files (`certificateUtils.ts`, `ContentAgentOrchestrator.ts`, `usernameGenerator.ts`).
**Learning:** Using `Math.random()` produces predictable values (CWE-338) that attackers can potentially guess or brute-force, leading to security bypasses (e.g. forging verification codes) or account enumeration.
**Prevention:** Always use Node's built-in `crypto` module (`crypto.randomInt()`, `crypto.randomBytes()`) for generating any sensitive or unique identifiers in backend code instead of PRNGs like `Math.random()`.
