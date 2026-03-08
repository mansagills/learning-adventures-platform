## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-03-08 - IDOR in Course Requests
**Vulnerability:** The `/api/course-requests/submit` endpoint allowed an authenticated user to update an existing `CourseRequest` record by providing an `id` in the request body, without verifying if the user owned the record.
**Learning:** Even when endpoints check for valid roles (e.g., PARENT or TEACHER), they must also explicitly verify ownership of the specific resources being modified to prevent Insecure Direct Object Reference (IDOR) vulnerabilities.
**Prevention:**
1. Always query the database to verify the resource belongs to the `session.user.id` before performing an `update` or `delete` operation.
2. If role-based access allows bypassing ownership (e.g., ADMIN), ensure that logic is explicitly and safely handled in the authorization check.
