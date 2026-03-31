/**
 * Test script for NarrativeIntegrationSkill with Anthropic SDK integration
 *
 * Run with: npx tsx lib/skills/narrative-integration/__tests__/test-skill.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { NarrativeIntegrationSkill } from '../NarrativeIntegrationSkill';
import type { SkillContext } from '../../types';

// Sample curriculum from Phase 2
const sampleCurriculum = {
  courseTitle: 'Animal Adventure Math: Multiplication & Division Safari',
  courseDescription:
    'Join your favorite animal friends on an exciting safari adventure while mastering multiplication tables, discovering division basics, and solving real-world word problems through interactive games and nature-themed challenges.',
  estimatedTotalMinutes: 360,
  totalXP: 1740,
  chapters: [
    {
      number: 1,
      title: 'Multiplication Safari: Building the Foundation',
      description:
        'Begin your adventure by exploring multiplication as repeated addition and master the basics with animal friends',
      learningObjectives: [
        'Understand multiplication as repeated addition',
        'Recall facts for tables 2-5',
        'Apply skip counting strategies',
      ],
    },
    {
      number: 2,
      title: 'Advanced Multiplication Trails',
      description:
        'Continue your journey by tackling larger multiplication tables and discovering patterns',
      learningObjectives: [
        'Master multiplication tables 6-10',
        'Identify patterns in multiplication',
        'Apply strategies to multi-step problems',
      ],
    },
    {
      number: 3,
      title: 'Division Discovery: Sharing in the Wild',
      description: 'Learn how division helps animals share resources fairly',
      learningObjectives: [
        'Understand division as sharing equally',
        'Explain relationship between multiplication and division',
        'Solve basic division problems',
      ],
    },
    {
      number: 4,
      title: 'Problem-Solving Prairie: Real-World Adventures',
      description: 'Put all your skills together to solve real-world problems',
      learningObjectives: [
        'Analyze word problems to determine operations',
        'Apply multiplication and division to real-world scenarios',
        'Create and justify solution strategies',
      ],
    },
  ],
  lessons: [],
  progression: {
    scaffolding: 'Spiral progression from concrete to abstract',
    reinforcement: 'Distributed practice across lessons',
    assessmentStrategy: 'Formative quizzes every 4 lessons',
  },
};

const sampleDesignBrief = {
  student: {
    name: 'Emma Johnson',
    age: 8,
    grade: '3rd Grade',
    accommodations: ['Visual aids'],
    challenges: ['Difficulty with abstract concepts'],
    learningProfile: {
      styles: ['Visual', 'Hands-on', 'Story-based'],
      interests: ['Animals', 'Art', 'Nature'],
      favoriteCharacters: 'Wild Kratts and Bluey',
    },
  },
  course: {
    subject: 'MATH',
    topics: ['Multiplication tables', 'Division basics'],
    learningGoals: 'REINFORCE',
    difficulty: 'medium',
    gradeLevel: ['3rd Grade'],
  },
  format: {
    totalLessons: 12,
    lessonsPerWeek: 3,
    sessionDuration: 30,
  },
};

async function testSkill() {
  console.log('🧪 Testing NarrativeIntegrationSkill with Anthropic SDK\n');

  const skill = new NarrativeIntegrationSkill();

  // Display skill metadata
  const metadata = skill.getMetadata();
  console.log('📋 Skill Metadata:');
  console.log(`   ID: ${metadata.id}`);
  console.log(`   Name: ${metadata.name}`);
  console.log(`   Version: ${metadata.version}`);
  console.log(`   Capabilities: ${metadata.capabilities.length}`);
  console.log('');

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📝 Test Case: Create Narrative Arc for Sample Curriculum`);
  console.log(`${'='.repeat(80)}\n`);

  console.log(`Course: ${sampleCurriculum.courseTitle}`);
  console.log(
    `Student: ${sampleDesignBrief.student.name} (Age ${sampleDesignBrief.student.age})`
  );
  console.log(
    `Interests: ${sampleDesignBrief.student.learningProfile.interests.join(', ')}`
  );
  console.log(
    `Favorite Characters: ${sampleDesignBrief.student.learningProfile.favoriteCharacters}`
  );
  console.log(`Chapters: ${sampleCurriculum.chapters.length}`);
  console.log('');

  // Test canHandle
  const confidence = await skill.canHandle('Create narrative arc', {
    previousOutputs: new Map([
      ['curriculum', sampleCurriculum],
      ['designBrief', sampleDesignBrief],
    ]),
  });
  console.log(`✓ canHandle confidence: ${confidence}%\n`);

  if (confidence < 70) {
    console.log(`⚠️  Skipping test - confidence too low\n`);
    return;
  }

  // Execute skill
  console.log('🚀 Executing skill...\n');

  const context: SkillContext = {
    userRequest: 'Create narrative arc for this curriculum',
    previousOutputs: new Map([
      ['curriculum', sampleCurriculum],
      ['designBrief', sampleDesignBrief],
    ]),
    conversationHistory: [],
  };

  try {
    const result = await skill.execute(context);

    if (result.success) {
      console.log('✅ Execution successful!');
      console.log(
        `   Execution time: ${result.metadata.executionTime}ms (${Math.round(result.metadata.executionTime / 1000)}s)`
      );
      console.log(`   Confidence: ${result.metadata.confidence}%\n`);

      const {
        storyArc,
        courseIntroduction,
        courseConclusion,
        narrativeThemes,
        characterDevelopment,
      } = result.output;

      console.log('📖 Story Arc Summary:');
      console.log(`   Narrative: ${storyArc.courseNarrative}\n`);

      console.log('👤 Protagonist:');
      console.log(`   Name: ${storyArc.protagonist.name}`);
      console.log(`   Description: ${storyArc.protagonist.description}`);
      console.log(`   Motivation: ${storyArc.protagonist.motivation}\n`);

      console.log('🌍 Story Details:');
      console.log(`   Setting: ${storyArc.setting}`);
      console.log(`   Conflict: ${storyArc.conflict}`);
      console.log(`   Resolution: ${storyArc.resolution}\n`);

      console.log('📚 Chapter Story Beats:');
      storyArc.chapterArcs.forEach((arc) => {
        console.log(`\n   Chapter ${arc.chapterNumber}: ${arc.chapterTitle}`);
        console.log(`      Story: ${arc.storyBeat}`);
        console.log(`      Emotion: ${arc.emotionalArc}`);
      });

      console.log('\n🎭 Narrative Themes:');
      narrativeThemes.forEach((theme) => {
        console.log(`   • ${theme}`);
      });

      console.log('\n🌱 Character Development:');
      console.log(`   ${characterDevelopment}\n`);

      console.log('📜 Course Introduction (first 200 chars):');
      console.log(`   ${courseIntroduction.substring(0, 200)}...\n`);

      console.log('🎉 Course Conclusion (first 200 chars):');
      console.log(`   ${courseConclusion.substring(0, 200)}...\n`);

      if (
        result.metadata.suggestedNextSkills &&
        result.metadata.suggestedNextSkills.length > 0
      ) {
        console.log(
          `🔗 Suggested next skills: ${result.metadata.suggestedNextSkills.join(', ')}`
        );
      }
    } else {
      console.log('❌ Execution failed!');
      console.log(`   Error code: ${result.error?.code}`);
      console.log(`   Error message: ${result.error?.message}`);
      if (result.error?.details) {
        console.log(
          `   Details: ${JSON.stringify(result.error.details, null, 2)}`
        );
      }
    }
  } catch (error) {
    console.log('💥 Unexpected error during execution:');
    console.log(error);
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ Test completed!');
  console.log(`${'='.repeat(80)}\n`);
}

// Run tests
testSkill().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
