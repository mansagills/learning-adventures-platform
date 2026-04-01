## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Critical RCE via Unauthenticated Code Modification in update-catalog
**Vulnerability:** The `/api/internal/update-catalog` endpoint lacked authentication checks completely. Since this endpoint modifies `lib/catalogData.ts` (a source code file) programmatically, an attacker could exploit this to inject arbitrary Javascript/TypeScript code into the source base. This leads to Remote Code Execution (RCE). Additionally, the `/api/internal/claude-refine` endpoint was unauthenticated, leading to resource exhaustion.
**Learning:** Endpoints that do programmatic modification of source code files MUST be tightly authenticated and authorized (e.g., ADMIN only). Internal endpoints often bypass middleware checks, and when they lack route-level checks like `getServerSession`, they expose massive vulnerabilities.
**Prevention:**
1. Avoid modifying source code directly in production; use a database.
2. If programmatic modification is strictly required, require `ADMIN` authentication at the very top of the route handler.
3. Validate user inputs thoroughly to prevent injection inside the templated source code write.
