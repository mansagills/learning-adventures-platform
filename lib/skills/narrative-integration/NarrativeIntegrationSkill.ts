import { BaseSkill } from '../BaseSkill';
import type { SkillMetadata, SkillContext, SkillResult } from '../types';

interface StoryArc {
  courseNarrative: string;
  protagonist: {
    name: string;
    description: string;
    motivation: string;
  };
  setting: string;
  conflict: string;
  resolution: string;
  chapterArcs: Array<{
    chapterNumber: number;
    chapterTitle: string;
    storyBeat: string;
    emotionalArc: string;
  }>;
}

interface NarrativeOutput {
  storyArc: StoryArc;
  courseIntroduction: string;
  courseConclusion: string;
  narrativeThemes: string[];
  characterDevelopment: string;
}

export class NarrativeIntegrationSkill extends BaseSkill {
  getMetadata(): SkillMetadata {
    return {
      id: 'narrative-integration',
      name: 'Narrative Integration Specialist',
      description:
        'Creates engaging story arcs, characters, and narrative elements to enhance course engagement',
      triggers: [
        'add narrative',
        'create story arc',
        'integrate narrative',
        'add storytelling',
      ],
      capabilities: [
        'Design overarching course narrative',
        'Create relatable protagonist based on student interests',
        'Develop chapter-by-chapter story beats',
        'Integrate favorite characters as mentors/guides',
        'Create age-appropriate conflict and resolution',
        'Build emotional engagement through story',
        'Connect learning objectives to narrative goals',
        'Design narrative rewards and progression',
      ],
      examples: [
        'Create narrative arc for this course',
        'Add storytelling elements to the curriculum',
        'Integrate favorite characters into the course story',
      ],
      version: '1.0.0',
      guidanceFile: 'SKILL.md',
    };
  }

  async canHandle(
    userRequest: string,
    context?: Partial<SkillContext>
  ): Promise<number> {
    const lowerRequest = userRequest.toLowerCase();

    // High confidence triggers
    if (
      lowerRequest.includes('narrative') ||
      lowerRequest.includes('story arc') ||
      lowerRequest.includes('storytelling')
    ) {
      return 95;
    }

    // Medium confidence triggers
    if (lowerRequest.includes('story') || lowerRequest.includes('character')) {
      return 75;
    }

    // Check if curriculum is in context
    if (context?.previousOutputs?.has('curriculum')) {
      return 85;
    }

    return 0;
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    const startTime = Date.now();

    try {
      // Extract curriculum and design brief from context
      const curriculum = this.extractCurriculum(context);
      const designBrief = this.extractDesignBrief(context);

      if (!curriculum) {
        return this.buildErrorResult(
          'No curriculum found in context',
          'MISSING_DATA',
          {
            hint: 'Expected curriculum in previousOutputs from CurriculumDesignSkill',
          }
        );
      }

      // Load guidance from SKILL.md
      const guidance = this.loadGuidance();

      // Build prompt for Claude
      const prompt = this.buildPrompt(curriculum, designBrief, guidance);

      // Call Claude API to design narrative
      const narrativeData = await this.callClaudeForNarrative(prompt);

      // Validate output structure
      if (!this.validate(narrativeData)) {
        return this.buildErrorResult(
          'Invalid narrative structure returned',
          'VALIDATION_ERROR',
          { output: narrativeData }
        );
      }

      const executionTime = Date.now() - startTime;

      return this.buildSuccessResult(
        narrativeData,
        `Narrative arc created: ${narrativeData.storyArc.protagonist.name} on a ${curriculum.courseTitle} adventure`,
        executionTime,
        95,
        ['assessment-generation'] // Suggest final skill
      );
    } catch (error) {
      return this.buildErrorResult(
        `Failed to create narrative: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EXECUTION_ERROR',
        { error: error instanceof Error ? error.stack : error }
      );
    }
  }

  protected validate(output: any): boolean {
    if (!output || typeof output !== 'object') return false;
    if (!output.storyArc) return false;

    const storyArc = output.storyArc;

    // Validate required fields
    if (!storyArc.courseNarrative || !storyArc.protagonist) return false;
    if (!storyArc.protagonist.name || !storyArc.protagonist.description)
      return false;
    if (!storyArc.setting || !storyArc.conflict || !storyArc.resolution)
      return false;

    // Validate chapter arcs
    if (
      !Array.isArray(storyArc.chapterArcs) ||
      storyArc.chapterArcs.length === 0
    ) {
      return false;
    }

    for (const arc of storyArc.chapterArcs) {
      if (!arc.chapterNumber || !arc.chapterTitle || !arc.storyBeat) {
        return false;
      }
    }

    // Validate other fields
    if (!output.courseIntroduction || !output.courseConclusion) return false;
    if (!Array.isArray(output.narrativeThemes)) return false;

    return true;
  }

  private extractCurriculum(context: SkillContext): any {
    if (context.previousOutputs?.has('curriculum')) {
      return context.previousOutputs.get('curriculum');
    }

    try {
      const jsonMatch = context.userRequest.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.curriculum) {
          return parsed.curriculum;
        }
      }
    } catch (e) {
      // Not valid JSON
    }

    return null;
  }

  private extractDesignBrief(context: SkillContext): any {
    if (context.previousOutputs?.has('designBrief')) {
      return context.previousOutputs.get('designBrief');
    }
    return null;
  }

  private buildPrompt(
    curriculum: any,
    designBrief: any,
    guidance: string
  ): string {
    const studentAge = designBrief?.student?.age || 10;
    const interests = designBrief?.student?.learningProfile?.interests || [];
    const favoriteCharacters =
      designBrief?.student?.learningProfile?.favoriteCharacters || '';
    const studentName = designBrief?.student?.name || 'the student';

    return `You are a master storyteller for educational content. Create an engaging narrative arc that ties together this entire course.

COURSE INFORMATION:
Title: ${curriculum.courseTitle}
Description: ${curriculum.courseDescription}
Chapters: ${curriculum.chapters.length}

CHAPTER STRUCTURE:
${curriculum.chapters
  .map((ch: any, i: number) => `${i + 1}. ${ch.title} - ${ch.description}`)
  .join('\n')}

STUDENT PROFILE:
- Name: ${studentName}
- Age: ${studentAge}
- Interests: ${interests.join(', ') || 'General learning'}
- Favorite Characters: ${favoriteCharacters || 'None specified'}

NARRATIVE REQUIREMENTS:
1. Create a protagonist that ${studentName} (age ${studentAge}) can relate to
2. Design a story arc that spans all ${curriculum.chapters.length} chapters
3. Connect learning objectives to narrative goals (e.g., "learn multiplication to help animals")
4. Include favorite characters as mentors/guides if specified
5. Use interests (${interests.join(', ')}) as story themes
6. Create age-appropriate conflict (no violence, appropriate stakes)
7. Build to satisfying resolution that celebrates learning achievement

STORY ARC STRUCTURE:
- Beginning (Chapter 1): Introduce protagonist, setting, and initial challenge
- Middle (Chapters 2-${curriculum.chapters.length - 1}): Escalating challenges, skill development, setbacks and victories
- End (Chapter ${curriculum.chapters.length}): Final challenge, resolution, celebration of growth

GUIDANCE:
${guidance}

REQUIRED OUTPUT STRUCTURE:
{
  "storyArc": {
    "courseNarrative": "string (2-3 sentence overview of entire story)",
    "protagonist": {
      "name": "string (relatable character name)",
      "description": "string (what they're like, their personality)",
      "motivation": "string (why they're on this learning journey)"
    },
    "setting": "string (where the story takes place)",
    "conflict": "string (what challenge/problem drives the story)",
    "resolution": "string (how learning helps solve the problem)",
    "chapterArcs": [
      {
        "chapterNumber": number,
        "chapterTitle": "string (from curriculum)",
        "storyBeat": "string (what happens in this chapter)",
        "emotionalArc": "string (student's emotional journey)"
      }
    ]
  },
  "courseIntroduction": "string (2-3 paragraphs introducing the adventure)",
  "courseConclusion": "string (2-3 paragraphs celebrating achievement)",
  "narrativeThemes": ["string"],
  "characterDevelopment": "string (how protagonist grows through learning)"
}

OUTPUT FORMAT: Return ONLY valid JSON matching the structure above. No markdown formatting, no explanations outside the JSON.`;
  }

  private async callClaudeForNarrative(
    prompt: string
  ): Promise<NarrativeOutput> {
    const {
      callClaudeWithRetry,
      extractTextFromResponse,
      COURSE_GENERATION_MODEL,
    } = await import('@/lib/anthropic/client');

    try {
      const response = await callClaudeWithRetry({
        model: COURSE_GENERATION_MODEL,
        max_tokens: 4096,
        temperature: 0.7, // Higher for creative storytelling
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const text = extractTextFromResponse(response);
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON found in narrative response');
      }

      const narrativeOutput = JSON.parse(jsonMatch[0]) as NarrativeOutput;

      return narrativeOutput;
    } catch (error) {
      throw new Error(
        `Failed to call Claude API for narrative design: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
