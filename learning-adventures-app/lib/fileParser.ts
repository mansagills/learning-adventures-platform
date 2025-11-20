/**
 * File Parser Utilities
 *
 * Extract text content from various file formats (MD, PDF, DOCX)
 */

import * as fs from 'fs';

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
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
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
  const allowedExtensions = ['md', 'pdf', 'docx'];
  const extension = getFileExtension(filename);
  return allowedExtensions.includes(extension);
}
