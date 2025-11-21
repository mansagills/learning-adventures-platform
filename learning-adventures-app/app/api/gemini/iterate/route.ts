import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

interface IterateRequest {
  contentId: string;
  feedback: string;
  existingCode?: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request
    const body: IterateRequest = await req.json();
    const { contentId, feedback, existingCode } = body;

    // 3. Validate inputs
    if (!contentId || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields: contentId, feedback' },
        { status: 400 }
      );
    }

    if (feedback.length < 10) {
      return NextResponse.json(
        { error: 'Feedback must be at least 10 characters' },
        { status: 400 }
      );
    }

    // 4. Fetch existing content
    const content = await prisma.geminiContent.findUnique({
      where: { id: contentId },
      include: { iterations_history: true }
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // 5. Verify ownership (admins can edit all content)
    if (session.user.role !== 'ADMIN' && content.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 6. Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json(
        {
          error: 'Gemini API key not configured',
          message: 'Please add your GEMINI_API_KEY to .env.local. Get one at https://aistudio.google.com/app/apikey',
          code: 'MISSING_API_KEY'
        },
        { status: 503 }
      );
    }

    // 7. Get code to iterate on
    const codeToIterate = existingCode || content.generatedCode;
    const currentIteration = content.iterations;
    const newIterationNumber = currentIteration + 1;

    // 8. Build iteration prompt
    const iterationPrompt = `
You are iterating on an educational game. Here's the current code:

\`\`\`html
${codeToIterate}
\`\`\`

User feedback for improvements: ${feedback}

Please modify the code to address the feedback while:
1. Maintaining all existing functionality
2. Preserving educational value
3. Keeping accessibility features (ARIA labels, keyboard nav, etc.)
4. Following the same coding standards
5. Ensuring the game still works standalone (single HTML file)

IMPORTANT: At the very top of the HTML file, add a comment summarizing the changes made:
<!-- Changes: [brief summary of what was modified] -->

Return ONLY the complete updated HTML file code.
Start your response with: <!DOCTYPE html>
    `;

    // 9. Initialize Gemini and generate iteration
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

    const startTime = Date.now();
    const result = await model.generateContent(iterationPrompt);
    const response = result.response;
    const updatedCode = response.text();
    const generationTime = Date.now() - startTime;

    // 10. Extract changes summary
    const changesSummary = extractChangesSummary(updatedCode) ||
                          'Code updated based on feedback';

    // 11. Save iteration to history
    await prisma.geminiIteration.create({
      data: {
        geminiContentId: contentId,
        iterationNumber: newIterationNumber,
        userFeedback: feedback,
        previousCode: codeToIterate,
        newCode: updatedCode,
        changesSummary,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
        generationTime
      }
    });

    // 12. Update main content
    await prisma.geminiContent.update({
      where: { id: contentId },
      data: {
        generatedCode: updatedCode,
        iterations: newIterationNumber,
        iterationNotes: {
          push: feedback
        },
        status: 'ITERATING',
        updatedAt: new Date()
      }
    });

    // 13. Track usage
    const tokensInput = response.usageMetadata?.promptTokenCount || 0;
    const tokensOutput = response.usageMetadata?.candidatesTokenCount || 0;
    const estimatedCost = calculateCost(tokensInput, tokensOutput);

    await prisma.geminiUsage.create({
      data: {
        userId: session.user.id,
        operation: 'iterate',
        model: 'gemini-3-pro-preview',
        tokensInput,
        tokensOutput,
        estimatedCost,
        geminiContentId: contentId,
        success: true
      }
    });

    // 14. Create preview URL
    const previewUrl = `/api/gemini/preview/${contentId}`;

    // 15. Return response
    return NextResponse.json({
      success: true,
      contentId,
      iterationNumber: newIterationNumber,
      updatedCode,
      changesSummary,
      tokens: {
        input: tokensInput,
        output: tokensOutput,
        total: tokensInput + tokensOutput
      },
      estimatedCost,
      generationTime,
      previewUrl
    });

  } catch (error: any) {
    console.error('Iteration error:', error);

    // Track failed attempt
    try {
      const session = await getServerSession(authOptions);
      if (session) {
        await prisma.geminiUsage.create({
          data: {
            userId: session.user.id,
            operation: 'iterate',
            model: 'gemini-3-pro-preview',
            tokensInput: 0,
            tokensOutput: 0,
            estimatedCost: 0,
            success: false,
            errorMessage: error.message
          }
        });
      }
    } catch (dbError) {
      console.error('Failed to log error:', dbError);
    }

    return NextResponse.json(
      { error: 'Iteration failed', details: error.message },
      { status: 500 }
    );
  }
}

// Helper: Extract changes summary from code comment
function extractChangesSummary(code: string): string | null {
  const commentMatch = code.match(/<!--\s*Changes:\s*(.*?)\s*-->/is);
  return commentMatch ? commentMatch[1].trim() : null;
}

// Helper: Calculate API cost
function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * 1.25;
  const outputCost = (outputTokens / 1_000_000) * 5;
  return Number((inputCost + outputCost).toFixed(4));
}
