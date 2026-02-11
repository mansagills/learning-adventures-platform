## 2026-02-04 - Path Traversal in Package Uploads
**Vulnerability:** Path Traversal via `manifest.id` (games) and `manifest.slug` (courses) in package handlers.
**Learning:** User-provided identifiers from uploaded files (like `metadata.json` in a zip) must be treated as untrusted input, just like request body parameters. Even inside a "package", the metadata is user-controlled.
**Prevention:** Strictly validate all identifiers used for file path construction using an allowlist (e.g., alphanumeric only). Do not rely on `path.basename` alone if the identifier determines a directory name.

## 2026-02-10 - Zip Slip Vulnerability in Content Uploads
**Vulnerability:** Zip Slip vulnerability in `app/api/internal/save-content/route.ts` due to unsafe usage of `adm-zip`'s `extractAllTo` method.
**Learning:** `adm-zip`'s `extractAllTo` does not automatically prevent path traversal (Zip Slip) when extracting files. Attackers can include files with paths like `../../etc/passwd` in a zip archive to overwrite arbitrary files on the server.
**Prevention:** Avoid `extractAllTo`. Instead, iterate through zip entries manually using `getEntries()`. For each entry, resolve the full destination path and verify it starts with the intended target directory path (plus separator) before writing the file.
