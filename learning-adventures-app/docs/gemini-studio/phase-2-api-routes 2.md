# Phase 2: API Routes Implementation

## 🎯 Overview

Phase 2 focuses on building the backend API routes that power the Gemini 3 Content Studio. These routes handle content generation, iteration, preview, and publishing workflows.

**Status**: 📋 **PLANNED**
**Estimated Duration**: 2-3 hours
**Prerequisites**: Phase 1 completed

## 📋 API Endpoints to Build

### 1. `/api/gemini/generate` - Initial Content Generation

Generate new educational games from natural language prompts.

**Method**: POST
**Access**: Admin only
**Rate Limit**: 10 requests/minute per user

#### Request Body

```typescript
interface GenerateRequest {
  prompt: string;                 // Natural language description
  category: string;               // 'math', 'science', 'english', etc.
  gameType: 'HTML_2D' | 'HTML_3D' | 'INTERACTIVE' | 'QUIZ' | 'SIMULATION';
  gradeLevel: string[];           // ['K', '1', '2', '3']
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];               // Learning objectives
  context?: string;               // Additional context
}
```

#### Response

```typescript
interface GenerateResponse {
  success: boolean;
  contentId: string;              // ID of created GeminiContent record
  gameCode: string;               // Generated HTML code
  title: string;                  // Auto-generated title
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  estimatedCost: number;          // In USD
  generationTime: number;         // Milliseconds
  preview Url: string;            // Temporary preview URL
}
```

#### Implementation

```typescript
// app/api/gemini/generate/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request
    const {
      prompt,
      category,
      gameType,
      gradeLevel,
      difficulty,
      skills,
      context
    } = await req.json();

    // 3. Validate inputs
    if (!prompt || prompt.length < 20) {
      return Response.json(
        { error: 'Prompt must be at least 20 characters' },
        { status: 400 }
      );
    }

    // 4. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro' });

    // 5. Build enhanced prompt
    const enhancedPrompt = buildEducationalGamePrompt({
      prompt,
      category,
      gameType,
      gradeLevel,
      difficulty,
      skills,
      context
    });

    // 6. Generate content
    const startTime = Date.now();
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const gameCode = response.text();
    const generationTime = Date.now() - startTime;

    // 7. Extract title from code or generate one
    const title = extractTitleFromCode(gameCode) || generateTitle(prompt);

    // 8. Save to database
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
          model: 'gemini-3-pro',
          generationTime,
          tokensUsed: response.usageMetadata?.totalTokenCount || 0
        }
      }
    });

    // 9. Track usage
    const tokensInput = response.usageMetadata?.promptTokenCount || 0;
    const tokensOutput = response.usageMetadata?.candidatesTokenCount || 0;
    const estimatedCost = calculateCost(tokensInput, tokensOutput);

    await prisma.geminiUsage.create({
      data: {
        userId: session.user.id,
        operation: 'generate',
        model: 'gemini-3-pro',
        tokensInput,
        tokensOutput,
        estimatedCost,
        geminiContentId: geminiContent.id,
        success: true
      }
    });

    // 10. Create temporary preview
    const previewUrl = await createPreview(geminiContent.id, gameCode);

    // 11. Return response
    return Response.json({
      success: true,
      contentId: geminiContent.id,
      gameCode,
      title,
      tokens: {
        input: tokensInput,
        output: tokensOutput,
        total: tokensInput + tokensOutput
      },
      estimatedCost,
      generationTime,
      previewUrl
    });

  } catch (error) {
    console.error('Generation error:', error);

    // Track failed attempt
    await prisma.geminiUsage.create({
      data: {
        userId: session.user.id,
        operation: 'generate',
        model: 'gemini-3-pro',
        tokensInput: 0,
        tokensOutput: 0,
        estimatedCost: 0,
        success: false,
        errorMessage: error.message
      }
    });

    return Response.json(
      { error: 'Generation failed', details: error.message },
      { status: 500 }
    );
  }
}

// Helper: Build educational game prompt
function buildEducationalGamePrompt(config: any): string {
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
   - ${config.gameType === 'HTML_3D' ? 'Use Three.js for 3D graphics with physics simulation' : 'Use Canvas API or DOM manipulation'}
   - 60 FPS performance target
   - Mobile-responsive design (works on tablets)
   - File size under 3MB

3. Educational Integration:
   - Clear learning objectives
   - Immediate feedback on answers
   - Progress tracking (score, level, completion)
   - Hints system for struggling students
   - Celebratory feedback for success

4. Accessibility (WCAG 2.1 AA):
   - Semantic HTML structure
   - ARIA labels for interactive elements
   - Keyboard navigation support
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

6. Code Structure:
   - Clean, commented code
   - No external dependencies (except Three.js for 3D if needed)
   - Error handling
   - State management
   - Save progress to localStorage

${config.context ? `Additional Context: ${config.context}` : ''}

OUTPUT:
Return ONLY the complete HTML file code, ready to save and run.
Include proper <!DOCTYPE html>, <html>, <head>, and <body> tags.
Start with: <!DOCTYPE html>
  `;
}

// Helper: Calculate API cost
function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * 2;    // $2 per 1M input tokens
  const outputCost = (outputTokens / 1_000_000) * 12; // $12 per 1M output tokens
  return Number((inputCost + outputCost).toFixed(4));
}

// Helper: Extract title from generated code
function extractTitleFromCode(code: string): string | null {
  const titleMatch = code.match(/<title>(.*?)<\/title>/i);
  return titleMatch ? titleMatch[1] : null;
}

// Helper: Generate title from prompt
function generateTitle(prompt: string): string {
  const words = prompt.split(' ').slice(0, 5).join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// Helper: Create temporary preview
async function createPreview(contentId: string, code: string): Promise<string> {
  // Save to temporary file or return data URL
  // In production, upload to S3 with expiration
  const previewUrl = `/api/gemini/preview/${contentId}`;
  return previewUrl;
}
```

---

### 2. `/api/gemini/iterate` - Refine Existing Content

Iteratively improve generated games based on user feedback.

**Method**: POST
**Access**: Admin only
**Rate Limit**: 20 requests/minute per user

#### Request Body

```typescript
interface IterateRequest {
  contentId: string;              // ID of GeminiContent to iterate
  feedback: string;               // What to change/improve
  existingCode?: string;          // Optional: provide code directly
}
```

#### Response

```typescript
interface IterateResponse {
  success: boolean;
  contentId: string;
  iterationNumber: number;
  updatedCode: string;
  changesSummary: string;         // AI-generated summary of changes
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  estimatedCost: number;
  previewUrl: string;
}
```

#### Implementation

```typescript
// app/api/gemini/iterate/route.ts
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contentId, feedback, existingCode } = await req.json();

    // 1. Fetch existing content
    const content = await prisma.geminiContent.findUnique({
      where: { id: contentId },
      include: { iterations_history: true }
    });

    if (!content) {
      return Response.json({ error: 'Content not found' }, { status: 404 });
    }

    // 2. Get code to iterate on
    const codeToIterate = existingCode || content.generatedCode;
    const currentIteration = content.iterations;
    const newIterationNumber = currentIteration + 1;

    // 3. Build iteration prompt
    const iterationPrompt = `
Here's the current educational game code:

\`\`\`html
${codeToIterate}
\`\`\`

User feedback: ${feedback}

Please modify the code to address the feedback while:
1. Maintaining all existing functionality
2. Preserving educational value
3. Keeping accessibility features
4. Following the same coding standards

Return ONLY the complete updated HTML file code.
Also, provide a brief summary of changes made (in a comment at the top).
    `;

    // 4. Generate iteration
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro' });

    const startTime = Date.now();
    const result = await model.generateContent(iterationPrompt);
    const response = await result.response;
    const updatedCode = response.text();
    const generationTime = Date.now() - startTime;

    // 5. Extract changes summary
    const changesSummary = extractChangesSummary(updatedCode) ||
                          'Code updated based on feedback';

    // 6. Save iteration
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

    // 7. Update main content
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

    // 8. Track usage
    const tokensInput = response.usageMetadata?.promptTokenCount || 0;
    const tokensOutput = response.usageMetadata?.candidatesTokenCount || 0;
    const estimatedCost = calculateCost(tokensInput, tokensOutput);

    await prisma.geminiUsage.create({
      data: {
        userId: session.user.id,
        operation: 'iterate',
        model: 'gemini-3-pro',
        tokensInput,
        tokensOutput,
        estimatedCost,
        geminiContentId: contentId,
        success: true
      }
    });

    // 9. Update preview
    const previewUrl = await createPreview(contentId, updatedCode);

    return Response.json({
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
      previewUrl
    });

  } catch (error) {
    console.error('Iteration error:', error);
    return Response.json(
      { error: 'Iteration failed', details: error.message },
      { status: 500 }
    );
  }
}

function extractChangesSummary(code: string): string | null {
  // Extract summary from comment at top of code
  const commentMatch = code.match(/<!--\s*Changes:(.*?)-->/is);
  return commentMatch ? commentMatch[1].trim() : null;
}
```

---

### 3. `/api/gemini/stream` - Real-time Streaming Generation

Stream content generation in real-time for better UX.

**Method**: POST
**Access**: Admin only
**Response Type**: Server-Sent Events (text/event-stream)

#### Implementation

```typescript
// app/api/gemini/stream/route.ts
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { prompt, config } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: 'gemini-3-pro' });

        const enhancedPrompt = buildEducationalGamePrompt({ prompt, ...config });
        const result = await model.generateContentStream(enhancedPrompt);

        let fullCode = '';
        for await (const chunk of result.stream) {
          const text = chunk.text();
          fullCode += text;

          // Send chunk to client
          const data = JSON.stringify({ chunk: text, done: false });
          controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
        }

        // Send completion event
        const doneData = JSON.stringify({
          chunk: '',
          done: true,
          fullCode,
          tokensUsed: result.response.usageMetadata?.totalTokenCount
        });
        controller.enqueue(new TextEncoder().encode(`data: ${doneData}\n\n`));

        controller.close();

      } catch (error) {
        const errorData = JSON.stringify({ error: error.message });
        controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

---

### 4. `/api/gemini/preview/[contentId]` - Preview Generated Content

Serve generated content for preview in iframe.

**Method**: GET
**Access**: Admin only

#### Implementation

```typescript
// app/api/gemini/preview/[contentId]/route.ts
export async function GET(
  req: Request,
  { params }: { params: { contentId: string } }
) {
  const session = await getServerSession();
  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  const content = await prisma.geminiContent.findUnique({
    where: { id: params.contentId }
  });

  if (!content) {
    return new Response('Not found', { status: 404 });
  }

  // Return HTML with proper headers
  return new Response(content.generatedCode, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache',
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com"
    }
  });
}
```

---

### 5. `/api/gemini/publish` - Publish to Catalog

Publish generated content to the platform catalog or test games.

**Method**: POST
**Access**: Admin only

#### Request Body

```typescript
interface PublishRequest {
  contentId: string;
  destination: 'catalog' | 'test-games';
  metadata: {
    title: string;
    description: string;
    featured?: boolean;
    estimatedTime?: string;
  };
}
```

#### Implementation

```typescript
// app/api/gemini/publish/route.ts
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contentId, destination, metadata } = await req.json();

  // 1. Fetch content
  const content = await prisma.geminiContent.findUnique({
    where: { id: contentId }
  });

  if (!content) {
    return Response.json({ error: 'Content not found' }, { status: 404 });
  }

  // 2. Generate unique filename
  const filename = generateUniqueFilename(metadata.title, content.category);
  const filePath = `/games/${filename}.html`;

  // 3. Save file to public directory
  const fs = require('fs').promises;
  const publicPath = path.join(process.cwd(), 'public', 'games', `${filename}.html`);
  await fs.writeFile(publicPath, content.generatedCode, 'utf-8');

  if (destination === 'test-games') {
    // 4a. Create TestGame entry
    const testGame = await prisma.testGame.create({
      data: {
        gameId: filename,
        title: metadata.title,
        description: metadata.description,
        category: content.category,
        type: content.gameType.includes('3D') ? 'game' : 'lesson',
        gradeLevel: content.gradeLevel,
        difficulty: content.difficulty,
        skills: content.skills,
        estimatedTime: metadata.estimatedTime || '10-15 mins',
        filePath,
        isHtmlGame: true,
        status: 'NOT_TESTED',
        createdBy: session.user.id
      }
    });

    // Update GeminiContent
    await prisma.geminiContent.update({
      where: { id: contentId },
      data: {
        status: 'TESTING',
        filePath,
        testGameId: testGame.id,
        publishedAt: new Date()
      }
    });

    return Response.json({
      success: true,
      destination: 'test-games',
      testGameId: testGame.id,
      filePath,
      previewUrl: `/games/${filename}.html`
    });

  } else {
    // 4b. Add to catalogData (requires manual update)
    // For now, just mark as ready for catalog
    await prisma.geminiContent.update({
      where: { id: contentId },
      data: {
        status: 'APPROVED',
        filePath,
        publishedAt: new Date()
      }
    });

    return Response.json({
      success: true,
      destination: 'catalog',
      filePath,
      message: 'Content ready for catalog. Add to lib/catalogData.ts manually.',
      catalogEntry: {
        id: filename,
        title: metadata.title,
        description: metadata.description,
        type: content.gameType.includes('3D') ? 'game' : 'lesson',
        category: content.category,
        gradeLevel: content.gradeLevel,
        difficulty: content.difficulty,
        skills: content.skills,
        estimatedTime: metadata.estimatedTime || '10-15 mins',
        htmlPath: filePath,
        featured: metadata.featured || false
      }
    });
  }
}

function generateUniqueFilename(title: string, category: string): string {
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const timestamp = Date.now();
  return `${category}-${slug}-${timestamp}`;
}
```

---

## 🧪 Testing the APIs

### Using cURL

**Generate Content**:
```bash
curl -X POST http://localhost:3000/api/gemini/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple addition game for kindergarten",
    "category": "math",
    "gameType": "HTML_2D",
    "gradeLevel": ["K", "1"],
    "difficulty": "easy",
    "skills": ["Addition", "Counting"]
  }'
```

**Iterate Content**:
```bash
curl -X POST http://localhost:3000/api/gemini/iterate \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "clx123456",
    "feedback": "Make the game more colorful and add sound effects"
  }'
```

### Using Postman

Import the provided Postman collection: `gemini-studio-api.postman_collection.json`

## ✅ Phase 2 Checklist

- [ ] Create `/api/gemini/generate` route
- [ ] Create `/api/gemini/iterate` route
- [ ] Create `/api/gemini/stream` route
- [ ] Create `/api/gemini/preview/[contentId]` route
- [ ] Create `/api/gemini/publish` route
- [ ] Add rate limiting middleware
- [ ] Add error handling and logging
- [ ] Test all endpoints with valid/invalid data
- [ ] Document API responses
- [ ] Add TypeScript types

## 🎯 Success Criteria

Phase 2 is complete when:

1. All 5 API routes are implemented and functional
2. Content generation works with Gemini 3 Pro
3. Iteration system preserves code and tracks history
4. Streaming provides real-time feedback
5. Preview renders games safely in iframe
6. Publishing creates files and database entries
7. Cost tracking logs all API usage
8. Error handling covers edge cases

## 🚀 Ready for Phase 3

With Phase 2 complete, you're ready to build the UI components that interact with these APIs.

See [Phase 3: UI Components](./phase-3-ui-components.md) for next steps.

---

**Phase 2 Status**: 📋 **PLANNED**
**Estimated Duration**: 2-3 hours
