## 2026-02-04 - Path Traversal in Package Uploads
**Vulnerability:** Path Traversal via `manifest.id` (games) and `manifest.slug` (courses) in package handlers.
**Learning:** User-provided identifiers from uploaded files (like `metadata.json` in a zip) must be treated as untrusted input, just like request body parameters. Even inside a "package", the metadata is user-controlled.
**Prevention:** Strictly validate all identifiers used for file path construction using an allowlist (e.g., alphanumeric only). Do not rely on `path.basename` alone if the identifier determines a directory name.

## 2026-02-04 - Mass Assignment in Auth Signup
**Vulnerability:** Privilege Escalation via Mass Assignment in `app/api/auth/signup/route.ts`. The `role` field was accepted directly from the request body, allowing any user to register as 'ADMIN'.
**Learning:** Direct mapping of request bodies to database models (`...req.body`) or implicit inclusion of sensitive fields skips business logic validation.
**Prevention:** Always use an explicit allowlist for sensitive fields (like `role`) in public-facing endpoints. Default to the least privileged role (e.g., 'STUDENT') if an invalid role is requested.
