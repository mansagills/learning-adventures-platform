## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2024-06-20 - Cross-Platform Path Traversal Validation Vulnerability
**Vulnerability:** Attempting to fix Windows-specific path normalization issues by replacing backslashes with forward slashes (`.replace(/\\/g, '/')`) on untrusted strings before checking them with `.startsWith` introduces a bypass vulnerability on Linux, where backslashes are valid filename characters.
**Learning:** Using string manipulation and regular expressions for path validation is highly error-prone and insecure across different operating systems.
**Prevention:** Always use OS-agnostic library functions like `path.resolve` to calculate true absolute paths, and strictly use those absolute resolved paths against safe bounds (e.g., `path.startsWith(safeRoot + path.sep)`). Never rely on regex to "fix" paths prior to validation.
