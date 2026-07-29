import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

/**
 * Safely extracts a zip file to a target directory, preventing Zip Slip vulnerabilities.
 * @param zip The AdmZip instance
 * @param targetDir The directory to extract to
 */
export async function extractZipSafely(zip: AdmZip, targetDir: string): Promise<void> {
  const entries = zip.getEntries();
  const targetDirResolved = path.resolve(targetDir);

  const MAX_FILES = 10000;
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB

  if (entries.length > MAX_FILES) {
    throw new Error(`Security Error: Zip file contains too many entries (max ${MAX_FILES})`);
  }

  // Ensure target directory exists
  if (!existsSync(targetDirResolved)) {
    await fs.mkdir(targetDirResolved, { recursive: true });
  }

  let fileCount = 0;
  let totalSize = 0;

  for (const entry of entries) {
    fileCount++;
    if (fileCount > MAX_FILES) {
      throw new Error(`Security Error: Zip file contains too many entries (max ${MAX_FILES})`);
    }

    if (!entry.isDirectory) {
      if (entry.header.size > MAX_FILE_SIZE) {
        throw new Error(`Security Error: Individual file exceeds maximum allowed size (max 100MB): ${entry.entryName}`);
      }

      totalSize += entry.header.size;
      if (totalSize > MAX_TOTAL_SIZE) {
        throw new Error(`Security Error: Total extracted size exceeds maximum allowed size (max 500MB)`);
      }
    }

    // Skip if entry is a directory - we'll create directories as needed for files
    // or if it's an explicit directory entry, we validate and create it
    if (entry.isDirectory) {
      const dirPath = path.resolve(targetDirResolved, entry.entryName);

      // Security check
      const relative = path.relative(targetDirResolved, dirPath);
      const isSafe = !relative.startsWith('..') && !path.isAbsolute(relative);

      if (!isSafe) {
        throw new Error(`Security Error: Malicious zip entry detected: ${entry.entryName}`);
      }

      if (!existsSync(dirPath)) {
        await fs.mkdir(dirPath, { recursive: true });
      }
      continue;
    }

    const entryName = entry.entryName;
    const destPath = path.resolve(targetDirResolved, entryName);

    // Security check: prevent Zip Slip
    const relative = path.relative(targetDirResolved, destPath);
    const isSafe = !relative.startsWith('..') && !path.isAbsolute(relative);

    if (!isSafe) {
      throw new Error(`Security Error: Malicious zip entry detected: ${entryName}`);
    }

    const parentDir = path.dirname(destPath);
    if (!existsSync(parentDir)) {
      await fs.mkdir(parentDir, { recursive: true });
    }

    // Write file content
    await fs.writeFile(destPath, entry.getData());
  }
}
