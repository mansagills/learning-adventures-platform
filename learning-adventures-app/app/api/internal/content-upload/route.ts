import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { routeFileUpload } from '@/lib/storage/storageRouter';
import {
  extractMetadata,
  mapDifficultyToPrisma,
} from '@/lib/upload/metadataExtractor';
import { prisma } from '@/lib/prisma';
import { ContentType } from '@prisma/client';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Determine content type from file extension
    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase();

    let contentType: ContentType;
    let targetPath: string;
    let metadata: any = null;

    if (fileExt === 'zip') {
      return NextResponse.json(
        {
          error:
            'Course packages should use /api/internal/content-upload/course-package',
        },
        { status: 400 }
      );
    } else if (['mp4', 'webm', 'mov', 'avi'].includes(fileExt || '')) {
      // Video file
      contentType = 'VIDEO';
      targetPath = `videos/${Date.now()}-${fileName}`;
    } else if (fileExt === 'html') {
      // HTML game or lesson - extract metadata to determine type
      const htmlContent = await file.text();
      metadata = await extractMetadata(htmlContent, 'html');

      contentType = metadata.type === 'game' ? 'GAME' : 'LESSON';
      const folder = contentType === 'GAME' ? 'games' : 'lessons';
      targetPath = `${folder}/${fileName}`;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Upload file to appropriate storage
    const { url, storageType } = await routeFileUpload(file, targetPath);

    // For HTML files, re-extract metadata if not already done
    if (fileExt === 'html' && !metadata) {
      const htmlContent = await file.text();
      metadata = await extractMetadata(htmlContent, 'html');
    }

    // Create database record
    const uploadedContent = await prisma.uploadedContent.create({
      data: {
        contentId: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
        title: metadata?.title || fileName,
        description: metadata?.description || '',
        type: contentType,
        subject: metadata?.subject || 'interdisciplinary',
        gradeLevel: metadata?.gradeLevel || ['3'],
        difficulty: metadata?.difficulty
          ? mapDifficultyToPrisma(metadata.difficulty)
          : 'INTERMEDIATE',
        skills: metadata?.skills || [],
        estimatedTime: metadata?.estimatedTime || '15-20 mins',
        featured: metadata?.featured || false,
        storageType,
        filePath: url,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedBy: session.user.id,
        publishStatus: 'PUBLISHED', // Direct publish workflow
        publishedAt: new Date(),
        publishedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      id: uploadedContent.id,
      url,
      metadata,
      storageType,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
