import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getApiUser } from '@/lib/api-auth';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    // Security check: Ensure user is authenticated and is an admin or teacher
    const { apiUser, error: authError } = await getApiUser();

    if (!apiUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    if (apiUser.role !== 'ADMIN' && apiUser.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Forbidden. Admin or Teacher access required.' },
        { status: 403 }
      );
    }

    const formData = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const prompt = `You are an educational content expert helping to refine ideas for ${formData.type === 'game' ? 'educational games' : 'interactive lessons'}.

Please provide 3-5 specific, actionable suggestions to improve this ${formData.subject} ${formData.type} idea:

**Current Idea:**
- Type: ${formData.type}
- Subject: ${formData.subject}
- Title: ${formData.title}
- Description: ${formData.description || formData.gameIdea}
- Main Concept: ${formData.concept}
- Grade Levels: ${formData.gradeLevel.join(', ')}
- Difficulty: ${formData.difficulty}
- Skills: ${formData.skills.join(', ')}
- Estimated Time: ${formData.estimatedTime}
${formData.additionalRequirements ? `- Additional Requirements: ${formData.additionalRequirements}` : ''}

**Please provide:**
1. Specific mechanics or activities that would enhance engagement
2. Educational improvements to better teach the concept
3. Age-appropriate features for the target grade levels
4. Interactive elements that would make it more effective
5. Any potential challenges and how to address them

Keep suggestions practical and implementable in an HTML5 single-file format.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return NextResponse.json({
      content: content.text,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);

    // Check if it's an API key issue
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json(
        {
          error:
            'Invalid API key. Please check your ANTHROPIC_API_KEY configuration.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get suggestions from Claude. Please try again.' },
      { status: 500 }
    );
  }
}
