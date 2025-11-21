import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { contentId: string } }
) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Fetch content
    const content = await prisma.geminiContent.findUnique({
      where: { id: params.contentId }
    });

    if (!content) {
      return new NextResponse('Content not found', { status: 404 });
    }

    // 3. Return HTML with proper security headers
    return new NextResponse(content.generatedCode, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
          "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data: https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
          "connect-src 'self'",
          "frame-ancestors 'self'"
        ].join('; ')
      }
    });

  } catch (error: any) {
    console.error('Preview error:', error);
    return new NextResponse('Failed to load preview', { status: 500 });
  }
}
