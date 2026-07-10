## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Predictable Randomness in Core Generators
**Vulnerability:** Core workflow ID generation in `lib/agents/ContentAgentOrchestrator.ts` and temporary file ID generation in `components/agents/FileUploader.tsx` were using `Math.random().toString(36)`. `Math.random()` is not cryptographically secure and can produce predictable outcomes, potentially leading to ID collisions or predictability attacks.
**Learning:** Even for non-secret IDs (like workflow IDs or UI temporary IDs), predictable generation can expose internal state or cause collisions. The Web Crypto API provides `crypto.randomUUID()` natively which should be the standard across both frontend and backend for any unique ID generation unless specific formats dictate otherwise.
**Prevention:**
1. Universally enforce `crypto.randomUUID()` (or `crypto.randomInt()`) over `Math.random()` for any ID, token, or security-sensitive generation logic.
2. Ensure both server-side orchestrators and client-side components adhere to this standard to maintain defense in depth across environments.
