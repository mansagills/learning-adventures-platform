## 2026-02-04 - Path Traversal in Package Uploads
**Vulnerability:** Path Traversal via `manifest.id` (games) and `manifest.slug` (courses) in package handlers.
**Learning:** User-provided identifiers from uploaded files (like `metadata.json` in a zip) must be treated as untrusted input, just like request body parameters. Even inside a "package", the metadata is user-controlled.
**Prevention:** Strictly validate all identifiers used for file path construction using an allowlist (e.g., alphanumeric only). Do not rely on `path.basename` alone if the identifier determines a directory name.

## 2026-02-04 - Zip Slip and Path Traversal in Save Content API
**Vulnerability:** Path Traversal via `fileName` and `uploadedZipPath` parameters, and Zip Slip vulnerability via `extractAllTo` in `app/api/internal/save-content`.
**Learning:** `adm-zip`'s `extractAllTo` can be vulnerable if input paths or zip content paths are not validated. Simply replacing `..` or using `path.join` is insufficient if the root is not strictly enforced.
**Prevention:** Always use `path.resolve()` to check that the destination path starts with the expected root directory. Avoid `extractAllTo` for user-provided zips; manually iterate entries and validate each target path.
