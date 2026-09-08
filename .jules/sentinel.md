## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-21 - [Replaced predictable Math.random() with crypto.randomUUID()]
**Vulnerability:** Predictable pseudo-random number generator (`Math.random()`) used for generating security-sensitive IDs like `workflowId` and `tempId`.
**Learning:** This could lead to Insecure Direct Object Reference (IDOR) vulnerabilities or enumeration attacks if predictable IDs are exposed in API endpoints, database schemas or local state tracking. The `demo` folder components often get out of sync with fixes in root.
**Prevention:** Always use cryptographically secure functions (`crypto.randomUUID()`) when generating unique IDs for tokens, session trackers or any logic sensitive workflows on the frontend and backend.
