## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2024-05-18 - [Weak PRNG]
**Vulnerability:** Weak Random Number Generation in `generateWorkflowId()` (`lib/agents/ContentAgentOrchestrator.ts`) and `uploadFile()` (`components/agents/FileUploader.tsx`) using `Math.random()`.
**Learning:** `Math.random()` generates predictable values. Using it to generate workflow or temporary IDs can lead to enumeration or collisions.
**Prevention:** Use natively supported secure pseudorandom number generators like `crypto.randomUUID()` in the Web Crypto API or Node's `crypto` module to ensure unique unguessable values.
