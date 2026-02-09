import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

function getGamePromptTemplate(): string {
  return `Interactive Educational Game Development Prompts
==============================================

## MASTER PROMPT TEMPLATE FOR EDUCATIONAL GAMES

Create a single HTML file educational game for elementary students that teaches the specified concept through engaging gameplay. The game should balance entertainment with learning objectives while following HTML5 game development best practices.

### CORE REQUIREMENTS:

**Game Design Principles:**
- Balance entertainment and education (70% fun, 30% obvious learning)
- Clear game mechanics that reinforce learning objectives
- Progressive difficulty with achievable challenges
- Immediate feedback and positive reinforcement
- Short play sessions suitable for classroom use

**Technical Specifications:**
- Single HTML file with embedded CSS and JavaScript
- No external dependencies or libraries required
- Mobile-responsive design for tablets and smartphones
- Optimized performance (60 FPS target)
- Offline functionality for classroom use
- File size optimization for quick loading

**User Experience:**
- Intuitive controls suitable for young children
- Colorful, engaging visual design
- Appropriate sound effects and music
- Clear instructions and tutorials
- Pause/resume functionality

**Accessibility & Inclusion:**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- High contrast mode option
- Age-appropriate content and language`;
}

function getLessonPromptTemplate(): string {
  return `Interactive Learning Lesson Development Prompts
===================================================

## MASTER PROMPT TEMPLATE FOR INTERACTIVE LEARNING LESSONS

Create a single HTML file interactive learning lesson for elementary students that teaches the specified topic. The lesson should be engaging, educational, and follow current best practices for elementary education.

### REQUIREMENTS:

**Educational Standards:**
- Include clear learning objectives
- Incorporate formative assessment opportunities
- Provide immediate feedback to students
- Use scaffolded learning progression

**Interactive Elements:**
- Use HTML5, CSS3, and JavaScript (no external dependencies)
- Include click, drag, and drop interactions
- Add visual and audio feedback
- Implement progress tracking within the lesson

**Design Principles:**
- Colorful, child-friendly interface
- Large, easy-to-click buttons and elements
- Clear, simple instructions
- Age-appropriate language and vocabulary

**Learning Best Practices:**
- Multiple learning modalities (visual, auditory, kinesthetic)
- Social-emotional learning integration where appropriate
- Culturally responsive content
- Adaptive difficulty based on student responses

**Technical Specifications:**
- Single HTML file with embedded CSS and JavaScript
- Mobile-responsive design
- Works offline
- Accessible design following WCAG guidelines
- File size optimization for fast loading

**Content Structure:**
1. Welcome screen with clear objectives
2. Interactive learning activities (3-5 sections)
3. Practice exercises with immediate feedback
4. Assessment/quiz component
5. Celebration/completion screen`;
}

export async function POST(request: NextRequest) {
  try {
    const { formData, refinements } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const promptTemplate =
      formData.type === 'game'
        ? getGamePromptTemplate()
        : getLessonPromptTemplate();

    const enhancedRequirements = refinements
      ? `${formData.additionalRequirements || ''}\n\nRefinements based on expert suggestions:\n${refinements}`
      : formData.additionalRequirements || '';

    const prompt = `${promptTemplate}

**Specific Requirements for this ${formData.type}:**
- Subject: ${formData.subject}
- Main Concept: ${formData.concept}
- Title: ${formData.title}
- Description: ${formData.description || formData.gameIdea}
- Grade Levels: ${formData.gradeLevel.join(', ')}
- Difficulty: ${formData.difficulty}
- Skills to teach: ${formData.skills.join(', ')}
- Estimated Time: ${formData.estimatedTime}
${enhancedRequirements ? `- Additional Requirements: ${enhancedRequirements}` : ''}

Please create a complete, single HTML file that implements this ${formData.type}. The file should be self-contained with embedded CSS and JavaScript, following all the technical specifications and educational guidelines provided in the template.

Make sure the content is:
1. Age-appropriate for grades ${formData.gradeLevel.join(', ')}
2. Educationally effective for teaching ${formData.concept}
3. Engaging and interactive
4. Following accessibility standards
5. Mobile-responsive
6. Ready to use without any external dependencies

Return only the complete HTML file content.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 4000,
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
    });
  } catch (error) {
    console.error('Error generating content:', error);

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
      { error: 'Failed to generate content. Please try again.' },
      { status: 500 }
    );
  }
}
