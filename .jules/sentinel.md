## 2025-02-18 - Path Traversal in Package Uploads
**Vulnerability:** User-supplied IDs in `metadata.json` were used directly to construct file paths in `gamePackageHandler.ts` and `coursePackageHandler.ts`, allowing path traversal (Zip Slip variant).
**Learning:** Never trust IDs or slugs provided in uploaded manifest files to be safe file system paths. `path.join` does not sanitize against `..`.
**Prevention:** Strictly sanitize all user-provided identifiers that are used for file paths. Use whitelisting (alphanumeric only) and explicitly reject any input containing path separators or traversal sequences.
