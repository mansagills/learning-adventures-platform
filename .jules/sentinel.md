## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Critical Mass Assignment / IDOR in Draft Operations
**Vulnerability:** The `/api/course-requests/draft` endpoint used the spread operator (`...body` and `...updateData`) directly into Prisma `create` and `update` queries. Since `userId` and `id` were passed via the `body`, an attacker could overwrite `userId` by supplying `"userId": "hacked"` in the request body, allowing them to assign a draft to another user.
**Learning:** Destructuring and explicitly ignoring sensitive fields (e.g., `const { id: _id, userId: _userId, ...safeData } = body`) before spreading the `safeData` is crucial to preventing mass assignment and Insecure Direct Object Reference (IDOR) vulnerabilities, even in draft APIs.
**Prevention:**
1. Never spread unfiltered `body` objects directly into database queries.
2. Explicitly destructure and exclude sensitive fields (`id`, `userId`, `role`, `status`, etc.) from incoming payloads.
3. Apply explicit and server-validated values (like `apiUser.id` or `new Date()`) *after* any spread operator to guarantee they aren't overwritten.
