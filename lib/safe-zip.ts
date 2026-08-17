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

  // Ensure target directory exists
  if (!existsSync(targetDirResolved)) {
    await fs.mkdir(targetDirResolved, { recursive: true });
  }

  // Security checks against Zip Bombs
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file
  const MAX_TOTAL_SIZE = 250 * 1024 * 1024; // 250MB total extracted size
  const MAX_FILE_COUNT = 1000; // 1000 files total
  let totalSize = 0;
  let fileCount = 0;

  for (const entry of entries) {
    fileCount++;
    if (fileCount > MAX_FILE_COUNT) {
      throw new Error('Security Error: Too many files in zip archive (Zip Bomb protection)');
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

    // Rely on header size for an initial check
    if (entry.header.size > MAX_FILE_SIZE) {
        throw new Error(`Security Error: File exceeds maximum allowed size: ${entryName}`);
    }

    // Write file content
    const data = entry.getData();

    // Verify actual decompressed size to prevent header spoofing
    if (data.length > MAX_FILE_SIZE) {
        throw new Error(`Security Error: Decompressed file exceeds maximum allowed size: ${entryName}`);
    }

    totalSize += data.length;
    if (totalSize > MAX_TOTAL_SIZE) {
        throw new Error('Security Error: Total extracted size exceeds limit (Zip Bomb protection)');
    }

    await fs.writeFile(destPath, data);
  }
}
