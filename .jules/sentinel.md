## 2026-02-04 - Path Traversal in Package Uploads
**Vulnerability:** Path Traversal via `manifest.id` (games) and `manifest.slug` (courses) in package handlers.
**Learning:** User-provided identifiers from uploaded files (like `metadata.json` in a zip) must be treated as untrusted input, just like request body parameters. Even inside a "package", the metadata is user-controlled.
**Prevention:** Strictly validate all identifiers used for file path construction using an allowlist (e.g., alphanumeric only). Do not rely on `path.basename` alone if the identifier determines a directory name.
