## 2026-02-04 - Path Traversal in Package Uploads
**Vulnerability:** Path Traversal via `manifest.id` (games) and `manifest.slug` (courses) in package handlers.
**Learning:** User-provided identifiers from uploaded files (like `metadata.json` in a zip) must be treated as untrusted input, just like request body parameters. Even inside a "package", the metadata is user-controlled.
**Prevention:** Strictly validate all identifiers used for file path construction using an allowlist (e.g., alphanumeric only). Do not rely on `path.basename` alone if the identifier determines a directory name.

## 2026-02-05 - Mass Assignment in User Signup
**Vulnerability:** User role (e.g., ADMIN) could be set via POST request body during signup because `role` was directly passed to `prisma.user.create`.
**Learning:** Never trust request payloads when creating user records, especially for privileged fields like `role`. ORM methods like `create` can implicitly accept sensitive fields if not explicitly filtered.
**Prevention:** Use an explicit allowlist (e.g., `['STUDENT', 'PARENT', 'TEACHER']`) for public endpoints. Always sanitize or ignore sensitive fields from user input before database operations.
