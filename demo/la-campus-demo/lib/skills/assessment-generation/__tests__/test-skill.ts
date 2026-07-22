/**
 * Test script for AssessmentGenerationSkill with Anthropic SDK integration
 *
 * Run with: npx tsx lib/skills/assessment-generation/__tests__/test-skill.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { AssessmentGenerationSkill } from '../AssessmentGenerationSkill';
import type { SkillContext } from '../../types';

// Sample curriculum with PROJECT and QUIZ lessons
const sampleCurriculum = {
  courseTitle: 'Animal Adventure Math: Multiplication & Division Safari',
  courseDescription:
    'Master multiplication and division through animal-themed adventures',
  estimatedTotalMinutes: 360,
  totalXP: 1740,
  chapters: [
    {
      number: 1,
      title: 'Multiplication Safari',
      description: 'Build multiplication foundations',
      learningObjectives: [
        'Understand multiplication as repeated addition',
        'Recall multiplication facts for tables 2-5',
        'Apply skip counting strategies',
      ],
    },
    {
      number: 2,
      title: 'Advanced Multiplication',
      description: 'Master higher tables',
      learningObjectives: [
        'Master multiplication tables 6-10',
        'Identify patterns in multiplication',
        'Apply strategies to multi-step problems',
      ],
    },
    {
      number: 3,
      title: 'Division Discovery',
      description: 'Learn division basics',
      learningObjectives: [
        'Understand division as sharing equally',
        'Explain relationship between multiplication and division',
        'Solve basic division problems',
      ],
    },
    {
      number: 4,
      title: 'Problem-Solving Prairie',
      description: 'Apply all skills',
      learningObjectives: [
        'Analyze word problems to determine operations',
        'Apply multiplication and division to real-world scenarios',
        'Create and justify solution strategies',
      ],
    },
  ],
  lessons: [
    {
      order: 4,
      chapterNumber: 1,
      title: 'Multiplication Basics Quiz',
      type: 'QUIZ',
      learningObjectives: [
        'Demonstrate understanding of multiplication concept',
        'Solve basic multiplication problems accurately',
      ],
      difficulty: 'easy',
      duration: 15,
      xpReward: 100,
      requiredScore: 70,
    },
    {
      order: 7,
      chapterNumber: 2,
      title: 'Multiplication Master Challenge',
      type: 'QUIZ',
      learningObjectives: [
        'Demonstrate mastery of all multiplication facts 2-9',
        'Solve multiplication problems accurately and efficiently',
      ],
      difficulty: 'hard',
      duration: 30,
      xpReward: 180,
      requiredScore: 80,
    },
    {
      order: 12,
      chapterNumber: 4,
      title: 'Safari Math Master Project',
      type: 'PROJECT',
      learningObjectives: [
        'Create original word problems using multiplication and division',
        'Demonstrate mastery of all course concepts in authentic contexts',
        'Explain mathematical reasoning clearly',
      ],
      difficulty: 'hard',
      duration: 40,
      xpReward: 250,
    },
  ],
  progression: {
    scaffolding: 'Spiral progression from concrete to abstract',
    reinforcement: 'Distributed practice',
    assessmentStrategy: 'Formative quizzes every 4 lessons',
  },
};

const sampleDesignBrief = {
  student: {
    name: 'Emma Johnson',
    age: 8,
    grade: '3rd Grade',
    accommodations: ['Visual aids'],
    learningProfile: {
      styles: ['Visual', 'Hands-on', 'Story-based'],
      interests: ['Animals', 'Art', 'Nature'],
    },
  },
  course: {
    subject: 'MATH',
    topics: ['Multiplication tables', 'Division basics'],
    difficulty: 'medium',
    gradeLevel: ['3rd Grade'],
  },
  assessment: {
    masteryThreshold: 70,
    successIndicators: ['Improved test scores', 'Increased confidence'],
    reportingPreferences: ['Weekly progress reports'],
  },
};

async function testSkill() {
  console.log('🧪 Testing AssessmentGenerationSkill with Anthropic SDK\n');

  const skill = new AssessmentGenerationSkill();

  // Display skill metadata
  const metadata = skill.getMetadata();
  console.log('📋 Skill Metadata:');
  console.log(`   ID: ${metadata.id}`);
  console.log(`   Name: ${metadata.name}`);
  console.log(`   Version: ${metadata.version}`);
  console.log(`   Capabilities: ${metadata.capabilities.length}`);
  console.log('');

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📝 Test Case: Generate Assessments for Sample Curriculum`);
  console.log(`${'='.repeat(80)}\n`);

  console.log(`Course: ${sampleCurriculum.courseTitle}`);
  console.log(
    `Student: ${sampleDesignBrief.student.name} (Age ${sampleDesignBrief.student.age})`
  );
  console.log(`Chapters: ${sampleCurriculum.chapters.length}`);
  console.log(`Quiz Lessons: 2`);
  console.log(`Project Lessons: 1`);
  console.log('');

  // Test canHandle
  const confidence = await skill.canHandle('Generate assessments', {
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
    userRequest: 'Generate comprehensive assessments for this curriculum',
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
        diagnosticPreTest,
        diagnosticPostTest,
        projectRubrics,
        additionalQuizQuestions,
        assessmentStrategy,
      } = result.output;

      // Diagnostic Pre-Test
      if (diagnosticPreTest) {
        console.log('📝 Diagnostic Pre-Test:');
        console.log(`   Title: ${diagnosticPreTest.title}`);
        console.log(`   Purpose: ${diagnosticPreTest.purpose}`);
        console.log(`   Questions: ${diagnosticPreTest.questions.length}`);
        console.log(`   Passing Score: ${diagnosticPreTest.passingScore}%`);

        console.log(`\n   Sample Questions:`);
        diagnosticPreTest.questions.slice(0, 2).forEach((q) => {
          console.log(`      - ${q.question}`);
          console.log(
            `        Skill: ${q.skillAssessed} | Difficulty: ${q.difficulty}`
          );
        });
        console.log('');
      }

      // Diagnostic Post-Test
      if (diagnosticPostTest) {
        console.log('📝 Diagnostic Post-Test:');
        console.log(`   Title: ${diagnosticPostTest.title}`);
        console.log(`   Questions: ${diagnosticPostTest.questions.length}`);
        console.log(`   Passing Score: ${diagnosticPostTest.passingScore}%\n`);
      }

      // Project Rubrics
      if (projectRubrics.length > 0) {
        console.log('📊 Project Rubrics:');
        projectRubrics.forEach((rubric) => {
          console.log(
            `\n   Lesson ${rubric.lessonOrder}: ${rubric.lessonTitle}`
          );
          console.log(`   Rubric: ${rubric.rubricTitle}`);
          console.log(`   Total Points: ${rubric.totalPoints}`);
          console.log(`   Criteria: ${rubric.criteria.length}`);

          // Show first criterion in detail
          if (rubric.criteria.length > 0) {
            const criterion = rubric.criteria[0];
            console.log(
              `\n   Sample Criterion: ${criterion.dimension} (${criterion.points} points)`
            );
            console.log(`      ${criterion.description}`);
            criterion.levels.forEach((level) => {
              console.log(
                `      ${level.level} (${level.score} pts): ${level.description.substring(0, 60)}...`
              );
            });
          }
        });
        console.log('');
      }

      // Additional Quiz Questions
      if (additionalQuizQuestions.length > 0) {
        console.log('❓ Additional Quiz Questions:');
        additionalQuizQuestions.forEach((quiz) => {
          console.log(`   Lesson ${quiz.lessonOrder}: ${quiz.lessonTitle}`);
          console.log(
            `   Question Bank Size: ${quiz.questionBank.length} questions`
          );

          // Count by difficulty
          const difficulties = quiz.questionBank.reduce((acc: any, q: any) => {
            acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
            return acc;
          }, {});
          console.log(
            `   Distribution: Easy: ${difficulties.easy || 0}, Medium: ${difficulties.medium || 0}, Hard: ${difficulties.hard || 0}`
          );
        });
        console.log('');
      }

      // Assessment Strategy
      console.log('🎯 Assessment Strategy:');
      console.log(
        `   Formative Approach: ${assessmentStrategy.formativeApproach.substring(0, 100)}...`
      );
      console.log(
        `   Summative Approach: ${assessmentStrategy.summativeApproach.substring(0, 100)}...`
      );
      console.log(
        `   Feedback Guidelines: ${assessmentStrategy.feedbackGuidelines.substring(0, 100)}...`
      );
      console.log(
        `   Retake Policy: ${assessmentStrategy.retakePolicy.substring(0, 100)}...\n`
      );

      if (
        result.metadata.suggestedNextSkills &&
        result.metadata.suggestedNextSkills.length > 0
      ) {
        console.log(
          `🔗 Suggested next skills: ${result.metadata.suggestedNextSkills.join(', ')}`
        );
      } else {
        console.log(
          '✅ Final skill in pipeline - ready for CourseGenerationAgent!'
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
