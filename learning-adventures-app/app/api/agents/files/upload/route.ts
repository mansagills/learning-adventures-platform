/**
 * POST /api/agents/files/upload
 *
 * Upload files (MD, PDF, DOCX) for agent reference
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import {
  parseFile,
  sanitizeFilename,
  getFileExtension,
  isAllowedFileType,
} from '@/lib/fileParser';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'agent-files');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const userRole = session.user.role;
    if (userRole !== 'ADMIN' && userRole !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const conversationId = formData.get('conversationId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    if (!isAllowedFileType(file.name)) {
      return NextResponse.json(
        { error: 'File type not supported. Please upload MD, PDF, or DOCX files.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate safe filename
    const extension = getFileExtension(file.name);
    const timestamp = Date.now();
    const sanitizedName = sanitizeFilename(file.name);
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create database record (initial state)
    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        userId: session.user.id,
        conversationId: conversationId || undefined,
        originalName: file.name,
        fileName: fileName,
        fileType: extension,
        mimeType: file.type,
        fileSize: file.size,
        filePath: filePath,
        uploadStatus: 'PROCESSING',
      },
    });

    // Parse file content in background (don't await)
    parseFileContent(uploadedFile.id, filePath, extension).catch((error) => {
      console.error('File parsing error:', error);
    });

    return NextResponse.json({
      success: true,
      fileId: uploadedFile.id,
      fileName: file.name,
      fileSize: file.size,
      message: 'File uploaded successfully. Content extraction in progress.',
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      {
        error: 'File upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Parse file content and update database
 */
async function parseFileContent(
  fileId: string,
  filePath: string,
  fileType: string
): Promise<void> {
  try {
    const extractedText = await parseFile(filePath, fileType);

    await prisma.uploadedFile.update({
      where: { id: fileId },
      data: {
        extractedText: extractedText,
        uploadStatus: 'COMPLETED',
      },
    });

    console.log(`✅ File parsed successfully: ${fileId}`);
  } catch (error) {
    console.error(`❌ File parsing failed: ${fileId}`, error);

    await prisma.uploadedFile.update({
      where: { id: fileId },
      data: {
        uploadStatus: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Parsing failed',
      },
    });
  }
}
