/**
 * POST /api/agents/[agentId]/chat
 *
 * Send a message to an AI agent and receive a streaming response
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
    if (userRole !== 'ADMIN' && userRole !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { message, conversationId, history, fileIds } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Fetch uploaded files if fileIds provided
    let fileContext = '';
    if (fileIds && Array.isArray(fileIds) && fileIds.length > 0) {
      const files = await prisma.uploadedFile.findMany({
        where: {
          id: { in: fileIds },
          userId: session.user.id,
        },
      });

      if (files.length > 0) {
        fileContext = '\n\n===REFERENCE DOCUMENTS===\n\n';
        files.forEach((file) => {
          fileContext += `File: ${file.originalName}\n`;
          fileContext += `Type: ${file.fileType.toUpperCase()}\n`;
          if (file.extractedText) {
            fileContext += `Content:\n${file.extractedText}\n\n---\n\n`;
          } else if (file.uploadStatus === 'PROCESSING') {
            fileContext += `[Content extraction in progress]\n\n---\n\n`;
          } else if (file.uploadStatus === 'FAILED') {
            fileContext += `[Content extraction failed: ${file.errorMessage || 'Unknown error'}]\n\n---\n\n`;
          }
        });
      }
    }

    // Validate agent ID
    const validAgents = [
      'game-idea-generator',
      'content-builder',
      'catalog-manager',
      'quality-assurance',
    ];
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
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
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
        let mockResponse = '';

        if (fileContext) {
          mockResponse = `Thank you for your message and the uploaded document(s)! I've received and reviewed your reference materials.\n\n`;
          mockResponse += `I'm the ${params.agentId.replace(/-/g, ' ')} agent. Based on the content you've provided and your request, I can help you:\n\n`;
          mockResponse += `1. Extract and analyze key concepts from your documents\n`;
          mockResponse += `2. Generate game ideas aligned with your content\n`;
          mockResponse += `3. Create interactive learning experiences\n`;
          mockResponse += `4. Ensure educational value and accessibility\n\n`;
          mockResponse += `Your uploaded content will inform my recommendations. What would you like me to focus on?`;
        } else {
          mockResponse = `Thank you for your message! I'm the ${params.agentId.replace(/-/g, ' ')} agent, and I'm here to help you create educational content.\n\n`;
          mockResponse += `Based on your request, I would recommend the following approach:\n\n`;
          mockResponse += `1. First, let's clarify the learning objectives\n`;
          mockResponse += `2. Consider the target grade level and subject\n`;
          mockResponse += `3. Think about the engagement strategies we can use\n`;
          mockResponse += `4. Ensure accessibility and educational value\n\n`;
          mockResponse += `What would you like to focus on first?`;
        }

        const words = mockResponse.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = words[i] + ' ';
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'content', content: chunk })}\n\n`
            )
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

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        );

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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
