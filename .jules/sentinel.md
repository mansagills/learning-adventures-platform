## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2024-05-24 - [Admin Privilege Escalation] Case-Sensitive Domain Check Bypass
**Vulnerability:** In `app/api/auth/signup/route.ts`, admin domain restriction (`@learningadventures.org`) was checked using case-sensitive `email.endsWith(ADMIN_DOMAIN)`. This allowed attackers to bypass the restriction by registering with mixed-case domains like `Attacker@LearningAdventures.org`.
**Learning:** String comparisons for emails and domains must always account for case-insensitivity because standard email infrastructure treats them interchangeably.
**Prevention:** Always normalize email inputs to lowercase using `.toLowerCase()` before performing domain restriction checks or use case-insensitive matching mechanisms.
