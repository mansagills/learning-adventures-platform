## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Weak PRNG Usage in Core Utilities
**Vulnerability:** Core utilities (`lib/usernameGenerator.ts`, `lib/certificates/certificateUtils.ts`, and `lib/agents/ContentAgentOrchestrator.ts`) were using `Math.random()` to generate unique, sensitive, and pseudo-random values (verification codes, workflows IDs, and usernames). `Math.random()` is not cryptographically secure, making these values predictable and potentially guessable by an attacker.
**Learning:** It is common for developers to reach for `Math.random()` when building features quickly, overlooking the security implications for unique IDs, verification codes, or tokens. This codebase uses it heavily in game logic, but it leaked into sensitive utilities.
**Prevention:**
1. Always use Node's `crypto` module (e.g., `crypto.randomInt()`, `crypto.randomUUID()`, `crypto.randomBytes()`) for generating secure, unpredictable values.
2. Ensure that any utility generating verification codes or user-facing IDs relies on cryptographically secure pseudo-random number generators (CSPRNGs).
3. Use linter rules (like `@typescript-eslint/no-restricted-syntax` or `eslint-plugin-security`) to block the use of `Math.random()` in specific sensitive directories.
