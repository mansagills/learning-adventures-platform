## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Weak Randomness in ID Generation
**Vulnerability:** `Math.random().toString(36)` was being used to generate temporary component IDs and workflow orchestration IDs in `FileUploader.tsx` and `ContentAgentOrchestrator.ts`.
**Learning:** While `Math.random()` isn't inherently exploitable when used for simple UI component keys, it provides extremely weak entropy (predictable sequence, high collision risk over time). Its use for workflow orchestration IDs represents a moderate risk, as predictability could theoretically be used to enumerate or hijack workflows in multi-tenant environments.
**Prevention:**
1. Standardize on cryptographically secure pseudorandom number generators (CSPRNG).
2. Utilize native platform APIs like `crypto.randomUUID()` in both frontend and backend contexts for generating unguessable, universally unique identifiers.
