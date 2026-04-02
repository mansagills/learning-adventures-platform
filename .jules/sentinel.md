## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Unauthenticated RCE via internal API source modification
**Vulnerability:** The `/api/internal/update-catalog` endpoint modifies the `lib/catalogData.ts` source file without requiring authentication. Additionally, `/api/internal/claude-refine` was unauthenticated and exposed internal Claude proxy.
**Learning:** Internal tooling endpoints that programmatically modify source code (`fs/promises`) or expose expensive LLM features are frequently omitted from middleware rules and must have explicit `getServerSession` checks. The absence of `update-catalog` and `claude-refine` security test files prior to the fix confirms they were overlooked.
**Prevention:**
1. All internal routes (under `/api/internal/`) must strictly verify authentication with `getServerSession`.
2. Endpoints performing file system operations (`fs` or `fs/promises`) must have explicit security audits and dedicated auth tests.
