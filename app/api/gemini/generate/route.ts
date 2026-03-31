import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

// Types
interface GenerateRequest {
  prompt: string;
  category: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary';
  gameType:
    | 'HTML_2D'
    | 'HTML_3D'
    | 'INTERACTIVE'
    | 'QUIZ'
    | 'SIMULATION'
    | 'PUZZLE';
  gradeLevel: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];
  context?: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request
    const body: GenerateRequest = await req.json();
    const {
      prompt,
      category,
      gameType,
      gradeLevel,
      difficulty,
      skills,
      context,
    } = body;

    // 3. Validate inputs
    if (!prompt || prompt.length < 20) {
      return NextResponse.json(
        { error: 'Prompt must be at least 20 characters' },
        { status: 400 }
      );
    }

    if (
      !category ||
      !gameType ||
      !gradeLevel ||
      gradeLevel.length === 0 ||
      !difficulty ||
      !skills
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: category, gameType, gradeLevel, difficulty, skills',
        },
        { status: 400 }
      );
    }

    // 4. Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json(
        {
          error: 'Gemini API key not configured',
          message:
            'Please add your GEMINI_API_KEY to .env.local. Get one at https://aistudio.google.com/app/apikey',
          code: 'MISSING_API_KEY',
        },
        { status: 503 }
      );
    }

    // 5. Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

    // 6. Build enhanced prompt
    const enhancedPrompt = buildEducationalGamePrompt({
      prompt,
      category,
      gameType,
      gradeLevel,
      difficulty,
      skills,
      context,
    });

    // 7. Generate content
    const startTime = Date.now();
    const result = await model.generateContent(enhancedPrompt);
    const response = result.response;
    const gameCode = response.text();
    const generationTime = Date.now() - startTime;

    // 8. Extract title from code or generate one
    const title = extractTitleFromCode(gameCode) || generateTitle(prompt);

    // 9. Save to database
    const geminiContent = await prisma.geminiContent.create({
      data: {
        userId: session.user.id,
        title,
        prompt,
        generatedCode: gameCode,
        gameType,
        category,
        gradeLevel,
        difficulty,
        skills,
        status: 'DRAFT',
        metadata: {
          model: 'gemini-3-pro-preview',
          generationTime,
          tokensUsed: response.usageMetadata?.totalTokenCount || 0,
        },
      },
    });

    // 10. Track usage
    const tokensInput = response.usageMetadata?.promptTokenCount || 0;
    const tokensOutput = response.usageMetadata?.candidatesTokenCount || 0;
    const estimatedCost = calculateCost(tokensInput, tokensOutput);

    await prisma.geminiUsage.create({
      data: {
        userId: session.user.id,
        operation: 'generate',
        model: 'gemini-3-pro-preview',
        tokensInput,
        tokensOutput,
        estimatedCost,
        geminiContentId: geminiContent.id,
        success: true,
      },
    });

    // 11. Create preview URL
    const previewUrl = `/api/gemini/preview/${geminiContent.id}`;

    // 12. Return response
    return NextResponse.json({
      success: true,
      contentId: geminiContent.id,
      gameCode,
      title,
      tokens: {
        input: tokensInput,
        output: tokensOutput,
        total: tokensInput + tokensOutput,
      },
      estimatedCost,
      generationTime,
      previewUrl,
    });
  } catch (error: any) {
    console.error('Generation error:', error);

    // Track failed attempt
    try {
      const session = await getServerSession(authOptions);
      if (session) {
        await prisma.geminiUsage.create({
          data: {
            userId: session.user.id,
            operation: 'generate',
            model: 'gemini-3-pro-preview',
            tokensInput: 0,
            tokensOutput: 0,
            estimatedCost: 0,
            success: false,
            errorMessage: error.message,
          },
        });
      }
    } catch (dbError) {
      console.error('Failed to log error:', dbError);
    }

    return NextResponse.json(
      { error: 'Generation failed', details: error.message },
      { status: 500 }
    );
  }
}

// Helper: Build educational game prompt
function buildEducationalGamePrompt(config: GenerateRequest): string {
  return `
Create an educational ${config.gameType === 'HTML_3D' ? '3D' : '2D'} game for children that:
${config.prompt}

REQUIREMENTS:

1. Educational Standards:
   - Subject: ${config.category}
   - Grade Level: ${config.gradeLevel.join(', ')}
   - Difficulty: ${config.difficulty}
   - Learning Objectives: ${config.skills.join(', ')}
   - 70% engagement, 30% obvious learning

2. Technical Specifications:
   - Single HTML file with embedded CSS and JavaScript
   - ${config.gameType === 'HTML_3D' ? 'Use Three.js CDN for 3D graphics with physics simulation' : 'Use Canvas API or DOM manipulation'}
   - 60 FPS performance target
   - Mobile-responsive design (works on tablets)
   - File size under 3MB
   - No external dependencies except Three.js CDN if needed

3. Educational Integration:
   - Clear learning objectives displayed at start
   - Immediate feedback on answers (visual and text)
   - Progress tracking (score, level, completion percentage)
   - Hints system for struggling students
   - Celebratory feedback for success (animations, sounds)
   - Track correct/incorrect answers

4. Accessibility (WCAG 2.1 AA):
   - Semantic HTML structure
   - ARIA labels for interactive elements
   - Keyboard navigation support (arrow keys, enter, space)
   - Color contrast ratios (4.5:1 minimum)
   - Alt text for all images
   - Focus indicators
   - Screen reader compatible

5. Design:
   - Child-friendly, colorful interface
   - Large, touch-friendly buttons (44x44px minimum)
   - Clear, readable fonts (16px+ minimum)
   - Engaging animations and transitions
   - Age-appropriate visuals
   - Consistent color scheme

6. Code Structure:
   - Clean, well-commented code
   - Error handling
   - State management
   - Save progress to localStorage
   - Restart/reset functionality

${config.context ? `\nAdditional Context: ${config.context}` : ''}

OUTPUT FORMAT:
Return ONLY the complete HTML file code, ready to save and run.
Include proper <!DOCTYPE html>, <html>, <head>, and <body> tags.
Start your response with: <!DOCTYPE html>
  `;
}

// Helper: Calculate API cost
function calculateCost(inputTokens: number, outputTokens: number): number {
  // Gemini 1.5 Pro pricing (as of Nov 2024):
  // Input: $1.25 per 1M tokens (prompts ≤128K)
  // Output: $5 per 1M tokens (prompts ≤128K)
  const inputCost = (inputTokens / 1_000_000) * 1.25;
  const outputCost = (outputTokens / 1_000_000) * 5;
  return Number((inputCost + outputCost).toFixed(4));
}

// Helper: Extract title from generated code
function extractTitleFromCode(code: string): string | null {
  const titleMatch = code.match(/<title>(.*?)<\/title>/i);
  return titleMatch ? titleMatch[1] : null;
}

// Helper: Generate title from prompt
function generateTitle(prompt: string): string {
  const words = prompt.split(' ').slice(0, 6).join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
