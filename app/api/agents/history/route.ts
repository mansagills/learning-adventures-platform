/**
 * GET /api/agents/history
 *
 * Get user's conversation history with AI agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // 'all', 'active', 'archived'
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (filter !== 'all') {
      where.status = filter.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { agentType: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch conversations with message count
    const conversations = await prisma.agentConversation.findMany({
      where,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { content: true },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Format response
    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      agentType: conv.agentType,
      title: conv.title || 'Untitled conversation',
      lastMessage: conv.messages[0]?.content || 'No messages yet',
      messageCount: conv._count.messages,
      status: conv.status.toLowerCase(),
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }));

    return NextResponse.json({
      conversations: formattedConversations,
      total: formattedConversations.length,
    });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
