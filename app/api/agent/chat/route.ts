import { getApiUser } from '@/lib/api-auth';
/**
 * Learning Builder Agent Chat API
 * POST /api/agent/chat - Send message to learning builder agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { LearningBuilderAgent } from '@/lib/agents/LearningBuilderAgent';

// Initialize learning builder agent (singleton)
let learningBuilderAgent: LearningBuilderAgent | null = null;

async function getLearningBuilderAgent(): Promise<LearningBuilderAgent> {
  if (!learningBuilderAgent) {
    learningBuilderAgent = new LearningBuilderAgent();
    await learningBuilderAgent.initialize();
  }
  return learningBuilderAgent;
}

export async function POST(request: NextRequest) {
  try {
    const { apiUser, error: authError } = await getApiUser();
    const body = await request.json();

    const { message, conversationId, context } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get learning builder agent
    const agent = await getLearningBuilderAgent();

    // Execute user request
    const result = await agent.execute(
      message,
      conversationId || `user-${apiUser?.id || 'anonymous'}`,
      apiUser?.id
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Universal Agent API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Learning Builder Agent Chat API',
    description:
      'Intelligent agent for creating interactive learning content and educational games',
    usage: 'POST /api/agent/chat with { message, conversationId?, context? }',
  });
}
