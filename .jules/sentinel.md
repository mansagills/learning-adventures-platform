## 2026-02-04 - Path Traversal in Package Uploads
**Vulnerability:** Path Traversal via `manifest.id` (games) and `manifest.slug` (courses) in package handlers.
**Learning:** User-provided identifiers from uploaded files (like `metadata.json` in a zip) must be treated as untrusted input, just like request body parameters. Even inside a "package", the metadata is user-controlled.
**Prevention:** Strictly validate all identifiers used for file path construction using an allowlist (e.g., alphanumeric only). Do not rely on `path.basename` alone if the identifier determines a directory name.

## 2026-02-05 - Path Traversal in File Upload Storage Router
**Vulnerability:** Path Traversal in `routeFileUpload` in `lib/storage/storageRouter.ts`. The function blindly joined user-provided paths with the public directory, allowing writes outside the intended directory.
**Learning:** `path.join` is insufficient for preventing path traversal when user input contains `..`. Even if `path.resolve` is used, one must explicitly check that the resolved path is still within the intended root directory using `startsWith`.
**Prevention:** Always resolve the target path relative to the intended root and verify `resolvedPath.startsWith(intendedRoot)`.
