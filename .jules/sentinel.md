## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2024-05-27 - [CRITICAL] Prevent Database Connection Pool Exhaustion in Serverless Environments
**Vulnerability:** Direct instantiation of `PrismaClient` in API routes (`new PrismaClient()`) combined with `await prisma.$disconnect()` in a serverless environment (Next.js API routes). This creates new connection pools on every request, which can rapidly exhaust the database connection limits, causing a Denial-of-Service (DoS) condition.
**Learning:** In a serverless architecture like Next.js, each API route invocation may spawn a new execution context. Creating a new PrismaClient instance in each handler leads to uncontrolled connection pooling. The `.disconnect()` method does not resolve this completely and adds overhead.
**Prevention:** Never instantiate `new PrismaClient()` directly inside API route handlers or module scope within API routes. Always import the shared Prisma singleton instance (e.g., `import { prisma } from '@/lib/prisma'`), which reuses a single connection pool across hot reloads in development and execution contexts in production. Remove any manual `prisma.$disconnect()` calls.
## 2025-02-21 - [Zip Bomb Denial-of-Service in metadata extraction]
**Vulnerability:** A zip bomb vulnerability existed in `app/api/internal/extract-metadata/route.ts`. While the individual file size limit was checked against `metadataEntry.header.size` (which an attacker controls), the file was processed via `.getData()` without capping the overall archive size first using `assertArchiveWithinLimits`.
**Learning:** Checking only the individual extracted file size against an attacker-controlled header is insufficient, as the extraction method `getData()` allocates memory first.
**Prevention:** To prevent this, always enforce archive-level bounds immediately after initializing the `AdmZip` parser with `assertArchiveWithinLimits(zip)`, and use `readZipEntry` helper to cap limits on specific entries during expansion.
