## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2026-06-23 - [Weak RNG for Temporary IDs]
**Vulnerability:** Using Math.random() to generate temporary file IDs in client-side components and workflow IDs in server-side orchestrators.
**Learning:** Math.random() is predictable and vulnerable to seed recovery. Using it for any form of unique identifier creation breaks defense-in-depth principles, even in low-risk scenarios like temporary frontend IDs.
**Prevention:** Standardize on cryptographically secure UUIDs natively available in the environment: crypto.randomUUID() for browsers and randomUUID() from 'crypto' module for Node.js backends.
