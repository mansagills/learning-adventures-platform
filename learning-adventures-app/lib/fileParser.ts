/**
 * File Parser Utilities
 *
 * Extract text content from various file formats (MD, PDF, DOCX)
 * Store metadata for image files (PNG, JPG, JPEG, GIF, WEBP)
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Parse markdown file
 */
export async function parseMarkdown(filePath: string): Promise<string> {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to parse markdown: ${error}`);
  }
}

/**
 * Parse PDF file
 * Uses pdf-parse library
 */
export async function parsePDF(filePath: string): Promise<string> {
  try {
    // Dynamic import to avoid issues if package not installed
    const pdfParse = (await import('pdf-parse' as any)).default as any;
    const dataBuffer = await fs.promises.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    // Return placeholder if pdf-parse is not installed
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      return '[PDF content extraction requires pdf-parse package. Please install: npm install pdf-parse]';
    }
    throw new Error(`Failed to parse PDF: ${error}`);
  }
}

/**
 * Parse DOCX file
 * Uses mammoth library
 */
export async function parseDOCX(filePath: string): Promise<string> {
  try {
    // Dynamic import to avoid issues if package not installed
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    // Return placeholder if mammoth is not installed
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      return '[DOCX content extraction requires mammoth package. Please install: npm install mammoth]';
    }
    throw new Error(`Failed to parse DOCX: ${error}`);
  }
}

/**
 * Parse image file
 * Returns metadata about the image
 */
export async function parseImage(filePath: string): Promise<string> {
  try {
    const stats = await fs.promises.stat(filePath);
    const filename = path.basename(filePath);
    const extension = getFileExtension(filename);

    // For now, just return metadata
    // In the future, we could integrate Claude's vision API to describe the image
    return `[Image file: ${filename}, Format: ${extension.toUpperCase()}, Size: ${formatFileSize(stats.size)}]`;
  } catch (error) {
    throw new Error(`Failed to parse image: ${error}`);
  }
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Parse file based on extension
 */
export async function parseFile(filePath: string, fileType: string): Promise<string> {
  const extension = fileType.toLowerCase();

  switch (extension) {
    case 'md':
    case 'markdown':
      return parseMarkdown(filePath);

    case 'pdf':
      return parsePDF(filePath);

    case 'docx':
      return parseDOCX(filePath);

    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return parseImage(filePath);

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');

  // Remove special characters except dots, dashes, underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Ensure filename is not too long
  const maxLength = 200;
  if (sanitized.length > maxLength) {
    const ext = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.slice(0, -(ext!.length + 1));
    sanitized = nameWithoutExt.slice(0, maxLength - ext!.length - 1) + '.' + ext;
  }

  return sanitized;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Validate file type
 */
export function isAllowedFileType(filename: string): boolean {
  const allowedExtensions = ['md', 'pdf', 'docx', 'png', 'jpg', 'jpeg', 'gif', 'webp'];
  const extension = getFileExtension(filename);
  return allowedExtensions.includes(extension);
}

/**
 * Check if file is an image
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
  const extension = getFileExtension(filename);
  return imageExtensions.includes(extension);
}
