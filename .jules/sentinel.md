## 2025-02-23 - Zip Slip & Path Traversal in File Uploads
**Vulnerability:** Found Path Traversal in `uploadedZipPath` input and Zip Slip vulnerability in `adm-zip` extraction logic in `app/api/internal/save-content/route.ts`.
**Learning:** `adm-zip`'s `extractAllTo` method does not automatically prevent Zip Slip attacks (writing files outside target directory). User input for file paths was trusted without sanitization.
**Prevention:** Always sanitize file path inputs using `path.normalize` and strict directory checks. For zip extraction, iterate entries manually and verify the destination path starts with the intended directory.
