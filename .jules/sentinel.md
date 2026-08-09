## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2024-05-18 - [Testing Patterns with Zip Extraction]
**Vulnerability:** Not a direct security vulnerability, but adding size checks to `adm-zip` parsing breaks existing tests that mock zip entries using `getData()` if they don't also mock the newly required `header: { size: <bytes> }`.
**Learning:** Security fixes often require corresponding updates in mocked dependencies across test suites. If size limitations are enforced, the mock environment must reflect the real structure required for those bounds checks.
**Prevention:** When mocking `AdmZip` entries in Vitest (e.g., for security tests), include `header: { size: <number> }` alongside `getData()` in the mocked entry objects. This prevents size-limit security checks (designed to mitigate Zip bombs) from throwing errors during test execution.
