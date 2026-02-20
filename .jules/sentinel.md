## 2026-01-31 - Mass Assignment Privilege Escalation
**Vulnerability:** The signup endpoint allowed users to specify their role directly in the request body, which was passed unsanitized to `prisma.user.create`. This allowed attackers to create ADMIN accounts.
**Learning:** Using `req.json()` directly into `prisma.create` is dangerous if the model has sensitive fields like `role`.
**Prevention:** Always validate and sanitize input, especially for sensitive fields. Use a whitelist for allowed values (e.g., allow `STUDENT`, `PARENT`, `TEACHER` but not `ADMIN`). Explicitly construct the `data` object instead of spreading the request body.

## 2026-02-01 - Path Traversal in File Upload/Creation
**Vulnerability:** The `save-content` API endpoint accepted a `fileName` parameter and used it directly in `path.join` to create directories. This allowed attackers to use `..` to traverse outside the intended directory and write files anywhere on the system (RCE).
**Learning:** `path.join` and `path.resolve` DO NOT prevent path traversal; they merely resolve the path. Validating the INPUT string itself (e.g., ensuring no `/` or `..`) is critical before passing to file system operations.
**Prevention:** Always validate user-provided filenames against a strict whitelist (e.g., alphanumeric only) using `validateIdentifier` or similar. Do not rely on file extensions or path joining to sanitize input.
