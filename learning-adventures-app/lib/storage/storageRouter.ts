import { uploadToBlob } from './blobStorage';
import fs from 'fs/promises';
import path from 'path';

const STORAGE_RULES = {
  LOCAL_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  LOCAL_TYPES: ['.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg'],
  BLOB_TYPES: ['.mp4', '.webm', '.mov', '.avi', '.mkv'],
};

/**
 * Route file upload to appropriate storage location (local vs cloud)
 * @param file - The File object to upload
 * @param targetPath - The desired path/filename (e.g., 'games/math-adventure.html')
 * @returns Object with url and storageType
 */
export async function routeFileUpload(
  file: File,
  targetPath: string
): Promise<{ url: string; storageType: 'LOCAL' | 'BLOB' }> {
  // Security check: Prevent path traversal
  // Resolve the absolute path of where we want to store things
  const publicDir = path.resolve(process.cwd(), 'public');
  // Resolve the absolute path of the requested target
  const resolvedTarget = path.resolve(publicDir, targetPath);

  // Check if the resolved target is still inside the public directory
  if (!resolvedTarget.startsWith(publicDir)) {
    throw new Error('Security Error: Path traversal detected');
  }

  const fileExt = path.extname(file.name).toLowerCase();
  const useBlob =
    file.size > STORAGE_RULES.LOCAL_MAX_SIZE ||
    STORAGE_RULES.BLOB_TYPES.includes(fileExt);

  if (useBlob) {
    // Upload to Vercel Blob Storage
    const { url } = await uploadToBlob(file, targetPath);
    return { url, storageType: 'BLOB' };
  } else {
    // Save to local /public directory
    // Use resolvedTarget which we know is safe
    await fs.mkdir(path.dirname(resolvedTarget), { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(resolvedTarget, buffer);

    // Return relative URL (accessible via /public)
    return { url: `/${targetPath}`, storageType: 'LOCAL' };
  }
}

/**
 * Determine if a file should use blob storage based on size/type
 * @param file - The File object to check
 * @returns True if file should use blob storage
 */
export function shouldUseBlobStorage(file: File): boolean {
  const fileExt = path.extname(file.name).toLowerCase();
  return (
    file.size > STORAGE_RULES.LOCAL_MAX_SIZE ||
    STORAGE_RULES.BLOB_TYPES.includes(fileExt)
  );
}
