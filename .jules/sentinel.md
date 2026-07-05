## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2024-05-18 - [Secure Randomness] Replace Math.random() with crypto.randomUUID()
**Vulnerability:** Weak pseudo-random number generator (CWE-338) used for ID generation in FileUploader.tsx and ContentAgentOrchestrator.ts. `Math.random()` generates predictable values.
**Learning:** Temporary IDs and workflow IDs were generated using `Math.random().toString(36)`. While often benign for frontend component keys, using predictable IDs in security contexts (like file uploads or workflow management) can lead to vulnerabilities like Insecure Direct Object Reference (IDOR).
**Prevention:** Always use cryptographically secure random number generators like `crypto.randomUUID()` (available in both Web Crypto API and Node.js) for generating any form of identifier, token, or temporary key to enforce a defense-in-depth posture.
