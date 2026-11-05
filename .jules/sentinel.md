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

## 2024-05-18 - [Email Validation] Suffix Domain Matching Bypass
**Vulnerability:** A domain matching check for restricting signups used `email.toLowerCase().endsWith('@learningadventures.org')`. This allows attackers to bypass the restriction by using subdomains like `attacker@evil.com.learningadventures.org` or `attacker@sub.learningadventures.org` since they do not end exactly with `@learningadventures.org`.
**Learning:** Checking the end of an email string with an exact domain prefix is brittle and misses subdomains. String operations like `endsWith` are insufficient for accurate domain matching.
**Prevention:** Always extract the domain from the email (`email.split('@').pop()`) and perform an exact match or a proper subdomain check (e.g. `.endsWith('.domain.com')`) rather than just matching a string suffix against the full email address.
