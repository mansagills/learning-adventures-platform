## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Mass Assignment in Prisma course-requests
**Vulnerability:** The API routes for `/api/course-requests/draft` and `/api/course-requests/submit` spread the request `...body` directly into Prisma `create` and `update` queries. This is a Mass Assignment vulnerability, allowing users to potentially modify `id`, `userId`, `createdAt`, etc., by injecting them into the request payload.
**Learning:** Prisma does not automatically filter out extra properties from a data spread if they match schema fields. If `id` or `userId` is passed in `...body` when updating an existing record, Prisma could attempt to overwrite it, potentially enabling attackers to overwrite other users' records or hijack existing ones.
**Prevention:** Always place security-critical fields (`id`, `userId`) *after* the user-supplied data spread in the Prisma `data` object, or explicitly extract them out using destructuring (`const { id, userId, ...safeData } = body`). When explicitly placed after the spread, `id: undefined` ensures Prisma completely ignores it and won't overwrite existing primary keys.
