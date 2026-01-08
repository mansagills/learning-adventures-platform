/**
 * Test script for InteractiveContentSkill with Anthropic SDK integration
 *
 * Run with: npx tsx lib/skills/interactive-content/__tests__/test-skill.ts
 *
 * NOTE: This test generates actual HTML/JSON content via Claude API.
 * To limit API costs, we only generate content for first 3 lessons of a sample curriculum.
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve, join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

import { InteractiveContentSkill } from '../InteractiveContentSkill';
import type { SkillContext } from '../../types';

// Sample curriculum (first 3 lessons only to limit API costs)
const sampleCurriculum = {
  courseTitle: 'Animal Adventure Math: Multiplication & Division Safari',
  courseDescription: 'Join animal friends on a math safari!',
  estimatedTotalMinutes: 360,
  totalXP: 1740,
  chapters: [
    {
      number: 1,
      title: 'Multiplication Meadow',
      description: 'Learn multiplication basics',
      learningObjectives: ['Understand multiplication', 'Recall facts 2-5']
    }
  ],
  lessons: [
    {
      order: 1,
      chapterNumber: 1,
      title: 'Welcome to Multiplication Safari!',
      description: 'Meet your animal guides and discover what multiplication means through a fun animated story.',
      type: 'VIDEO',
      learningObjectives: [
        'Define multiplication as repeated addition',
        'Identify real-world situations where multiplication is useful'
      ],
      priorKnowledge: ['Basic addition skills'],
      skills: ['Conceptual understanding'],
      difficulty: 'easy',
      duration: 15,
      xpReward: 80,
      contentType: 'video',
      contentRequirements: {}
    },
    {
      order: 2,
      chapterNumber: 1,
      title: 'Animal Family Groups: Skip Counting Fun',
      description: 'Help animal families find their groups! Practice skip counting by organizing animals into equal groups.',
      type: 'INTERACTIVE',
      learningObjectives: [
        'Demonstrate skip counting by 2s, 3s, 4s, and 5s',
        'Use visual models to represent multiplication facts',
        'Connect skip counting to multiplication equations'
      ],
      priorKnowledge: ['Understanding of multiplication as repeated addition'],
      skills: ['Skip counting', 'Visual grouping', 'Pattern recognition'],
      difficulty: 'easy',
      duration: 25,
      xpReward: 120,
      contentType: 'html',
      contentRequirements: {
        gameType: 'drag-drop',
        interactionPattern: 'guided-exploration'
      }
    },
    {
      order: 3,
      chapterNumber: 1,
      title: 'Multiplication Race Rally: Tables 2-5',
      description: 'Race through the meadow collecting multiplication facts! Answer problems to help your animal racer reach the finish line.',
      type: 'GAME',
      learningObjectives: [
        'Recall multiplication facts for tables 2-5 with accuracy',
        'Solve multiplication problems within a time limit',
        'Build fluency with basic multiplication facts'
      ],
      priorKnowledge: ['Skip counting by 2s, 3s, 4s, and 5s'],
      skills: ['Fact fluency', 'Quick recall', 'Mental math'],
      difficulty: 'medium',
      duration: 30,
      xpReward: 150,
      contentType: 'html',
      contentRequirements: {
        gameType: 'multiple-choice',
        interactionPattern: 'timed-challenges'
      }
    },
    {
      order: 4,
      chapterNumber: 1,
      title: 'Multiplication Basics Quiz',
      description: 'Test your understanding of multiplication basics with this quick quiz!',
      type: 'QUIZ',
      learningObjectives: [
        'Demonstrate understanding of multiplication concept',
        'Solve basic multiplication problems accurately'
      ],
      priorKnowledge: ['Multiplication facts 2-5'],
      skills: ['Problem solving', 'Fact recall'],
      difficulty: 'easy',
      duration: 15,
      xpReward: 100,
      requiredScore: 70,
      contentType: 'quiz_json',
      contentRequirements: {
        assessmentFormat: 'multiple-choice'
      }
    }
  ],
  progression: {
    scaffolding: 'Start with concrete visuals, move to abstract',
    reinforcement: 'Spiral practice across lessons',
    assessmentStrategy: 'Formative quizzes every 4 lessons'
  }
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
      favoriteCharacters: 'Wild Kratts and Bluey'
    }
  },
  course: {
    subject: 'MATH',
    topics: ['Multiplication tables', 'Division basics'],
    learningGoals: 'REINFORCE',
    difficulty: 'medium',
    gradeLevel: ['3rd Grade']
  },
  format: {
    totalLessons: 12,
    lessonsPerWeek: 3,
    sessionDuration: 30,
    components: ['Interactive games', 'Practice quizzes'],
    deliveryModes: ['online']
  },
  clarifications: []
};

async function testSkill() {
  console.log('🧪 Testing InteractiveContentSkill with Anthropic SDK\n');

  const skill = new InteractiveContentSkill();

  // Display skill metadata
  const metadata = skill.getMetadata();
  console.log('📋 Skill Metadata:');
  console.log(`   ID: ${metadata.id}`);
  console.log(`   Name: ${metadata.name}`);
  console.log(`   Version: ${metadata.version}`);
  console.log(`   Capabilities: ${metadata.capabilities.length}`);
  console.log('');

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📝 Test Case: Generate Content for Sample Curriculum (3 lessons)`);
  console.log(`${'='.repeat(80)}\n`);

  console.log(`Course: ${sampleCurriculum.courseTitle}`);
  console.log(`Student: ${sampleDesignBrief.student.name} (Age ${sampleDesignBrief.student.age})`);
  console.log(`Interests: ${sampleDesignBrief.student.learningProfile.interests.join(', ')}`);
  console.log(`\nGenerating content for lessons:`);
  sampleCurriculum.lessons.forEach(lesson => {
    if (['GAME', 'INTERACTIVE', 'QUIZ'].includes(lesson.type)) {
      console.log(`   ${lesson.order}. ${lesson.title} (${lesson.type})`);
    }
  });
  console.log('');

  // Test canHandle
  const confidence = await skill.canHandle('Generate interactive content', {
    previousOutputs: new Map([
      ['curriculum', sampleCurriculum],
      ['designBrief', sampleDesignBrief]
    ])
  });
  console.log(`✓ canHandle confidence: ${confidence}%\n`);

  if (confidence < 70) {
    console.log(`⚠️  Skipping test - confidence too low\n`);
    return;
  }

  // Execute skill
  console.log('🚀 Executing skill...\n');

  const context: SkillContext = {
    userRequest: 'Generate interactive content for this curriculum',
    previousOutputs: new Map([
      ['curriculum', sampleCurriculum],
      ['designBrief', sampleDesignBrief]
    ]),
    conversationHistory: []
  };

  try {
    const result = await skill.execute(context);

    if (result.success) {
      console.log('✅ Execution successful!');
      console.log(`   Execution time: ${result.metadata.executionTime}ms (${Math.round(result.metadata.executionTime / 1000)}s)`);
      console.log(`   Confidence: ${result.metadata.confidence}%\n`);

      const { generatedContent, summary } = result.output;

      console.log('📊 Generation Summary:');
      console.log(`   Total Lessons in Curriculum: ${summary.totalLessons}`);
      console.log(`   Games Generated: ${summary.gamesGenerated}`);
      console.log(`   Interactives Generated: ${summary.interactivesGenerated}`);
      console.log(`   Quizzes Generated: ${summary.quizzesGenerated}`);
      console.log(`   Total Files: ${summary.totalFiles}\n`);

      // Display details for each generated file
      console.log('📁 Generated Content:');
      for (const content of generatedContent) {
        console.log(`\n   ${content.lessonId}: ${content.lessonTitle}`);
        console.log(`      Type: ${content.lessonType} | Content Type: ${content.contentType}`);

        if (content.htmlContent) {
          console.log(`      File: ${content.filePath}`);
          console.log(`      Size: ${Math.round(content.metadata.fileSize! / 1024)}KB`);
          console.log(`      Preview: ${content.htmlContent.substring(0, 100)}...`);
        }

        if (content.quizJson) {
          const quiz = content.quizJson.quiz;
          console.log(`      Quiz: ${quiz.questions.length} questions`);
          console.log(`      Passing Score: ${quiz.passingScore}%`);
          console.log(`      Sample Question: ${quiz.questions[0].question}`);
        }
      }

      // Save files to disk
      console.log(`\n💾 Saving generated files...`);

      const outputDir = resolve(process.cwd(), 'public', 'generated-lessons');

      // Create directory if it doesn't exist
      if (!existsSync(outputDir)) {
        await mkdir(outputDir, { recursive: true });
      }

      let savedFiles = 0;

      for (const content of generatedContent) {
        if (content.htmlContent && content.filePath) {
          const fullPath = join(outputDir, content.filePath);
          await writeFile(fullPath, content.htmlContent, 'utf-8');
          console.log(`   ✓ Saved: ${content.filePath}`);
          savedFiles++;
        }

        if (content.quizJson) {
          const quizFilename = `${content.lessonId}-quiz.json`;
          const fullPath = join(outputDir, quizFilename);
          await writeFile(fullPath, JSON.stringify(content.quizJson, null, 2), 'utf-8');
          console.log(`   ✓ Saved: ${quizFilename}`);
          savedFiles++;
        }
      }

      console.log(`\n✅ Saved ${savedFiles} files to: ${outputDir}`);

      if (result.metadata.suggestedNextSkills && result.metadata.suggestedNextSkills.length > 0) {
        console.log(`\n🔗 Suggested next skills: ${result.metadata.suggestedNextSkills.join(', ')}`);
      }

    } else {
      console.log('❌ Execution failed!');
      console.log(`   Error code: ${result.error?.code}`);
      console.log(`   Error message: ${result.error?.message}`);
      if (result.error?.details) {
        console.log(`   Details: ${JSON.stringify(result.error.details, null, 2)}`);
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
testSkill().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
