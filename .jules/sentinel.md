## 2026-02-04 - Path Traversal in Package Uploads
**Vulnerability:** Path Traversal via `manifest.id` (games) and `manifest.slug` (courses) in package handlers.
**Learning:** User-provided identifiers from uploaded files (like `metadata.json` in a zip) must be treated as untrusted input, just like request body parameters. Even inside a "package", the metadata is user-controlled.
**Prevention:** Strictly validate all identifiers used for file path construction using an allowlist (e.g., alphanumeric only). Do not rely on `path.basename` alone if the identifier determines a directory name.

## 2026-02-04 - Zip Slip Vulnerability in Content Uploads
**Vulnerability:** Zip Slip vulnerability in `adm-zip` usage via `extractAllTo` in `save-content` API.
**Learning:** `adm-zip`'s `extractAllTo` method does not protect against malicious zip entries containing `../` or absolute paths.
**Prevention:** Use manual entry iteration with strict path validation (checking against target directory) or a safe wrapper like `extractZipSafely` for all zip extractions.
