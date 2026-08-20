## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2023-10-25 - [Zip Bomb DoS Prevention]
**Vulnerability:** Zip files extracted using `adm-zip` were loaded into memory via `getData()` before checking their size. This could lead to a Denial-of-Service (DoS) condition if a malicious user uploaded a highly compressed "Zip Bomb", causing Out-Of-Memory (OOM) crashes.
**Learning:** `adm-zip` decompresses the entire entry into memory when `getData()` is called. Size checks must be performed using `entry.header.size` *before* decompression. Test mocks for `adm-zip` must include `header: { size: ... }` to avoid breaking tests when this security check is added.
**Prevention:** Always check `entry.header.size` against a reasonable maximum (e.g., 50MB for general files, 1MB for manifests) before calling `entry.getData()` or extracting file contents.
## 2025-02-23 - [TypeScript Syntax Error in NPC class]
**Vulnerability:** A duplicate constructor parameter `onFinalDialogLine?: () => void` in `game/entities/NPC.ts` caused a syntax error (`,` expected) preventing the codebase from compiling, resulting in GitHub CI failures during the `tsc` check.
**Learning:** Duplicate, poorly formatted parameters in TypeScript classes can easily go unnoticed locally if `tsc --noEmit` isn't run regularly, but will consistently fail CI pipelines.
**Prevention:** Always run `npx tsc --noEmit` or rely on strict ESLint checking before submitting PRs to catch basic syntax and type errors early.
