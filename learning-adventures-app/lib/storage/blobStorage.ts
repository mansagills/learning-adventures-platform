import { put, del, list } from '@vercel/blob';

/**
 * Upload a file to Vercel Blob Storage
 * @param file - The File object to upload
 * @param path - The path/name for the blob (e.g., 'videos/my-video.mp4')
 * @returns Object with url and downloadUrl
 */
export async function uploadToBlob(
  file: File,
  path: string
): Promise<{ url: string; downloadUrl: string }> {
  const blob = await put(path, file, {
    access: 'public',
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
  };
}

/**
 * Delete a file from Vercel Blob Storage
 * @param url - The blob URL to delete
 */
export async function deleteFromBlob(url: string): Promise<void> {
  await del(url);
}

/**
 * List files in Vercel Blob Storage with a given prefix
 * @param prefix - The prefix to filter blobs (e.g., 'videos/')
 * @returns Array of blob objects
 */
export async function listBlobFiles(prefix: string) {
  const { blobs } = await list({ prefix });
  return blobs;
}
