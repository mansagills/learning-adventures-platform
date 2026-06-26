## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2024-06-26 - [Predictable ID Generation]
**Vulnerability:** Weak Random Number Generation (`Math.random()`) used for generating temporary file IDs and Agent Workflow IDs.
**Learning:** Even for identifiers that aren't cryptographic keys (like temporary upload IDs or internal system workflow IDs), predictability allows potential attackers to guess these identifiers. In the case of agent workflows or uploads, predicting these could theoretically allow an attacker to hijack a session, view another user's content, or perform denial-of-service by pre-creating IDs.
**Prevention:** Use natively supported Cryptographically Secure Pseudo-Random Number Generators (CSPRNGs) like `crypto.randomUUID()` in both browser (`window.crypto`) and Node.js environments.
