/**
 * GET /api/agents/list
 *
 * Returns list of all available AI agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const agents = [
  {
    id: 'game-idea-generator',
    name: 'Game Idea Generator',
    description:
      'Brainstorm creative educational game concepts aligned with curriculum standards',
    icon: '🎮',
    capabilities: [
      'Generate 3-5 unique game concepts per request',
      'Consider grade level, subject, and learning objectives',
      'Analyze existing game patterns for inspiration',
      'Provide educational value assessment',
    ],
    skillsRequired: [],
    status: 'active',
  },
  {
    id: 'content-builder',
    name: 'Content Builder',
    description:
      'Create complete functional games (HTML or React) following platform standards',
    icon: '📝',
    capabilities: [
      'Build single-file HTML games',
      'Create React component games',
      'Apply 70/30 engagement-to-learning ratio',
      'Implement WCAG 2.1 AA accessibility features',
    ],
    skillsRequired: ['educational-game-builder', 'react-game-component'],
    status: 'active',
  },
  {
    id: 'catalog-manager',
    name: 'Catalog Manager',
    description: 'Format metadata and integrate content into platform catalog',
    icon: '📊',
    capabilities: [
      'Generate properly formatted catalog entries',
      'Validate metadata schema compliance',
      'Map to correct target arrays',
      'Check for duplicate IDs',
    ],
    skillsRequired: ['catalog-metadata-formatter'],
    status: 'active',
  },
  {
    id: 'quality-assurance',
    name: 'Quality Assurance',
    description:
      'Validate content quality, accessibility, and educational effectiveness',
    icon: '✅',
    capabilities: [
      'Run WCAG 2.1 AA compliance checks',
      'Test keyboard navigation',
      'Assess educational value',
      'Generate detailed QA reports',
    ],
    skillsRequired: ['accessibility-validator'],
    status: 'active',
  },
];

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to AI Agent Studio
    const userRole = session.user.role;
    if (userRole !== 'ADMIN' && userRole !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      agents,
      total: agents.length,
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
