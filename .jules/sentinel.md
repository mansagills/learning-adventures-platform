## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Predictable Randomness Vulnerability

**Vulnerability:** The application used `Math.random()` to generate IDs for temporary files (`FileUploader.tsx`) and workflow identifiers (`ContentAgentOrchestrator.ts`).
**Learning:** `Math.random()` is not cryptographically secure and can be predictable. Using it to generate IDs can lead to ID predictability vulnerabilities, such as IDOR (Insecure Direct Object Reference) or session hijacking, depending on how the IDs are used. Even for temporary IDs or internal workflow IDs, a cryptographically secure random number generator should be used to adhere to secure-by-default practices.
**Prevention:**
1. Always use cryptographically secure random number generators for generating IDs, tokens, or any security-sensitive values.
2. In Node.js or modern browsers, use `crypto.randomUUID()` or `crypto.randomBytes()`.
3. Do not rely on `Math.random()` for anything other than non-security-critical randomness (e.g., visual effects, basic games).

## 2025-02-23 - Predictable Randomness Vulnerability (Updated context)
**Vulnerability:** The application used `Math.random()` to generate IDs for temporary files (`FileUploader.tsx`) and workflow identifiers (`ContentAgentOrchestrator.ts`).
**Learning:** While initially flagged as a potential IDOR/predictability risk, further analysis revealed these IDs (`tempId` for in-flight React uploads and workflow IDs for in-memory logs) were not security tokens presented to the server. The actual defect was collision resistance—`Math.random().toString(36)` truncated to ~9 characters could cause collisions for multiple uploads in the same millisecond. Using `crypto.randomUUID()` resolves this collision risk.
**Prevention:**
1. Always use `crypto.randomUUID()` for unique IDs to ensure collision resistance, even if the ID is not used as a security token.
