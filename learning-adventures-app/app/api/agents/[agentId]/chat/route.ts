/**
 * POST /api/agents/[agentId]/chat
 *
 * Send a message to an AI agent and receive a streaming response
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const userRole = session.user.role;
    if (userRole !== 'admin' && userRole !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { message, conversationId, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Validate agent ID
    const validAgents = ['game-idea-generator', 'content-builder', 'catalog-manager', 'quality-assurance'];
    if (!validAgents.includes(params.agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    let conversation;

    // Create or get conversation
    if (conversationId) {
      conversation = await prisma.agentConversation.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      });

      if (!conversation || conversation.userId !== session.user.id) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    } else {
      // Create new conversation
      conversation = await prisma.agentConversation.create({
        data: {
          userId: session.user.id,
          agentType: params.agentId,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        },
      });
    }

    // Save user message
    await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: message,
      },
    });

    // TODO: Integrate with Claude SDK for actual AI response
    // For now, return a mock streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Simulate streaming response
        const mockResponse = `Thank you for your message! I'm the ${params.agentId.replace(/-/g, ' ')} agent, and I'm here to help you create educational content.

Based on your request, I would recommend the following approach:

1. First, let's clarify the learning objectives
2. Consider the target grade level and subject
3. Think about the engagement strategies we can use
4. Ensure accessibility and educational value

What would you like to focus on first?`;

        const words = mockResponse.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = words[i] + ' ';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'content', content: chunk })}\n\n`)
          );
          // Simulate delay
          await new Promise((resolve) => setTimeout(resolve, 50));

          // Send activity updates
          if (i === 10) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'activity', activity: 'Analyzing your request...' })}\n\n`
              )
            );
          } else if (i === 20) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'activity', activity: 'Generating recommendations...' })}\n\n`
              )
            );
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));

        // Save assistant response
        await prisma.conversationMessage.create({
          data: {
            conversationId: conversation.id,
            role: 'ASSISTANT',
            content: mockResponse,
          },
        });

        // Record metrics
        await prisma.agentMetrics.create({
          data: {
            userId: session.user.id,
            agentType: params.agentId,
            actionType: 'chat',
            tokensUsed: mockResponse.length / 4, // Rough estimate
            durationMs: words.length * 50,
            success: true,
          },
        });

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in agent chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
