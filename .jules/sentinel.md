## 2025-02-23 - Critical RCE/Path Traversal in save-content
**Vulnerability:** The `/api/internal/save-content` endpoint was completely unauthenticated and contained multiple bugs preventing safe file operations. It allowed arbitrary file writing and zip extraction to the public directory, potentially leading to Remote Code Execution (RCE) via HTML/JS upload or Zip Slip.
**Learning:** Internal APIs are often overlooked in security reviews. Missing imports (`normalize`, `extractZipSafely`) and undefined variables (`zipFullPath`) indicated untested/broken code that was likely copy-pasted or incomplete. The presence of `normalizedZipPath` logic that would block valid uploads suggests lack of testing with real data.
**Prevention:**
1. Always enforce authentication on ALL API routes, especially "internal" ones.
2. Use strict type checking and linting to catch undefined variables and missing imports.
3. Test security controls with valid AND invalid data to ensure they don't break functionality.
4. Use established libraries/helpers (like `extractZipSafely`) instead of ad-hoc implementation.

## 2025-02-23 - Critical RCE via Template Injection in Source Code Generation
**Vulnerability:** The `/api/internal/update-catalog` endpoint dynamically modified the source code file `lib/catalogData.ts`. It used template literals to directly inject user input into a TypeScript file, expecting single quotes around strings. If a user provided input containing single quotes and newline characters (e.g., `', \n }\n]; \n require('child_process').execSync('malicious_command'); \n const foo = [\n {`), they could escape the string context and inject arbitrary executable TypeScript code, leading to Remote Code Execution (RCE) during build or when the updated file is evaluated.
**Learning:** Programmatic modification of source code files using direct string concatenation is highly prone to injection vulnerabilities. Even if an endpoint requires an `ADMIN` or `TEACHER` role, defense-in-depth demands safe encoding of inputs when generating code to protect against compromised high-privilege accounts.
**Prevention:**
1. Whenever dynamically generating or modifying code, strictly encode all user-provided strings and structures using `JSON.stringify()`.
2. Explicitly type-cast booleans and numbers rather than concatenating them.
3. If possible, decouple data storage from source code (e.g., use a database or a separate JSON/YAML file) to avoid programmatic modification of executable source files entirely.
