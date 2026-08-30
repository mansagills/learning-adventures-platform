## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.
## 2025-02-23 - Zip Bomb / DoS Vulnerability in File Upload Handlers
**Vulnerability:** The `AdmZip` package was used to extract zipped game and course packages. The handlers read entire files into memory using `.getData()` without first checking the file size. This could lead to a Denial of Service (DoS) via an Out Of Memory (OOM) crash if an attacker uploads a "Zip bomb" containing highly compressed, massive files.
**Learning:** Checking compression ratio and uncompressed file sizes (`entry.header.size`) *before* extracting contents to memory is a crucial defense against Zip bombs. Memory limits should be enforced proportional to expected file sizes (e.g. 1MB for metadata, 50MB for game assets).
**Prevention:**
1. Always validate `entry.header.size` before calling `entry.getData()` when using libraries like `adm-zip` that buffer entire uncompressed files in memory.
2. Establish and enforce hard limits on uncompressed file sizes based on the application's actual requirements.
