/**
 * Skills API
 * GET /api/agent/skills - List available skills
 * POST /api/agent/skills/detect - Detect skills for a request
 */

import { NextRequest, NextResponse } from 'next/server';
import { SkillRegistry } from '@/lib/skills/SkillRegistry';
import { SkillContextBuilder } from '@/lib/agents/SkillContextBuilder';

const skillRegistry = SkillRegistry.getInstance();

export async function GET() {
  try {
    await skillRegistry.initialize();

    const skills = skillRegistry.getAllSkillMetadata();

    return NextResponse.json({
      count: skills.length,
      skills: skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        triggers: skill.triggers,
        capabilities: skill.capabilities,
        examples: skill.examples,
      })),
    });
  } catch (error) {
    console.error('Skills API error:', error);
    return NextResponse.json(
      { error: 'Failed to load skills' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    await skillRegistry.initialize();

    const context = SkillContextBuilder.build(message);
    const detectionResults = await skillRegistry.detectSkills(message, context);

    return NextResponse.json({
      message,
      detectedSkills: detectionResults,
      bestMatch: detectionResults[0] || null,
    });
  } catch (error) {
    console.error('Skill detection error:', error);
    return NextResponse.json(
      { error: 'Skill detection failed' },
      { status: 500 }
    );
  }
}
