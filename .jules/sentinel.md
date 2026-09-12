## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Database Connection Pool Exhaustion (DoS)
**Vulnerability:** Several API routes (`/api/progress/*`, `/api/user/profile`, `/api/achievements/user`) instantiated a `new PrismaClient()` on every incoming request and manually called `await prisma.$disconnect()`. Under heavy load, this pattern quickly exhausts the connection pool to the database, causing the application and database to become unresponsive (Denial of Service).
**Learning:** In Next.js and serverless environments, module resolution caches standard singleton instances (e.g., `globalForPrisma`). Creating a new client per request bypasses this cache, scaling connections linearly with concurrent requests.
**Prevention:**
1. Always import the shared singleton `prisma` instance from `@/lib/prisma`.
2. Do not instantiate `new PrismaClient()` directly in route handlers or API endpoints.
3. Do not manually call `await prisma.$disconnect()`, as it destroys the shared connection pool.
