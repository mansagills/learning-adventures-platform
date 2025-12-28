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
    const publicPath = path.join(process.cwd(), 'public', targetPath);
    await fs.mkdir(path.dirname(publicPath), { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(publicPath, buffer);

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
