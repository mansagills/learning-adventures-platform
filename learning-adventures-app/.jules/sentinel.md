## 2025-03-01 - [Vulnerability: Path traversal in save-content]
**Vulnerability:** Path traversal in `app/api/internal/save-content/route.ts` via `uploadedZipPath` where the validation was checking if `uploadedZipPath.includes("..") || !normalizedZipPath.startsWith("uploads/temp/")` but `normalizedZipPath` could bypass the check. Wait, I should add that `uploadedZipPath` was checked but the test `save_content_path_traversal.test.ts` had a failing assertion since the error message returned was different.
**Learning:** The check `uploadedZipPath.includes("..")` or the regex to sanitize the `normalizedZipPath` was sufficient, but the test `save_content_path_traversal.test.ts` was passing `fileName` and the code returned `Invalid filename: contains path traversal characters` while the test expected `/contains invalid characters/`.
**Prevention:** Update tests to match the code or update code to match tests.

## 2025-03-01 - [Vulnerability: Missing sanitization in content-upload route]
**Vulnerability:** Path traversal and file upload vulnerability in `app/api/internal/content-upload/route.ts` because it used the unsanitized `fileName` variable to define the `targetPath`.
**Learning:** File names obtained directly from user input (like FormData) need to be sanitized because they can include characters that result in escaping expected directories.
**Prevention:** Sanitize the file name using `.replace(/[^a-zA-Z0-9.\-_]/g, "")` to restrict allowable characters before assigning them to target paths.
