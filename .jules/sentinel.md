## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2023-10-27 - Zip Bomb Denial-of-Service in Zip Extraction
**Vulnerability:** The `/api/internal/extract-metadata` endpoint parsed uploaded zip files using `adm-zip` and immediately read `metadataEntry.getData()` without checking the uncompressed file size of the entry. This could lead to memory exhaustion and Denial-of-Service (DoS) attacks if a small zip archive expands to an enormous size in memory (Zip Bomb).
**Learning:** File compression introduces asymmetry between storage and memory requirements. When buffering uncompressed files into memory via methods like `.getData()`, the `header.size` property must always be validated against a strict limit prior to memory allocation.
**Prevention:**
1. Enforce strict size limits on uncompressed file extraction using properties like `header.size` before attempting to buffer or write them.
2. Consider using stream-based parsing for untrusted archive files to avoid buffering the entire file into memory at once.
