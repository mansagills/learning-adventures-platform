## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Zip Bomb Vulnerability Fix
**Vulnerability:** Zip files were being processed without size limits across `gamePackageHandler.ts`, `coursePackageHandler.ts`, and `safe-zip.ts`, potentially leading to Zip Bomb (Decompression Bomb) denial-of-service attacks.
**Learning:** Security fixes that involve mocking default exports or native modules (like `adm-zip` and `fs`) in Vitest require special attention to how tests are constructed. When adding properties expected by the code (e.g. `entry.header.size`), test mocks must be carefully updated. In some cases, hoisting imports and using `vi.hoisted` is necessary when overriding things like `fs.existsSync`. Deleting tests is an incorrect solution.
**Prevention:**
1. Validate size bounds before uncompressing zip entries via `.getData()` to prevent memory exhaustion and DoS.
2. Update associated unit tests mock responses to match expected data structures when introducing new conditions (e.g., adding `.header.size` to mock objects).
