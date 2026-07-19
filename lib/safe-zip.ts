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

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit to prevent Zip Bomb

  for (const entry of entries) {
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

    // Security check: prevent Zip Bomb by limiting file size
    if (entry.header.size > MAX_FILE_SIZE) {
      throw new Error(`Security Error: File exceeds maximum allowed size (50MB): ${entryName}`);
    }

    // Write file content
    await fs.writeFile(destPath, entry.getData());
  }
}
