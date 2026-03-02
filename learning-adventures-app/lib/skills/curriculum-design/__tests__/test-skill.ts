/**
 * Test script for CurriculumDesignSkill with Anthropic SDK integration
 *
 * Run with: npx tsx lib/skills/curriculum-design/__tests__/test-skill.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { CurriculumDesignSkill } from '../CurriculumDesignSkill';
import type { SkillContext } from '../../types';

// Sample design briefs for testing (from CourseDesignBriefSkill output)
const sampleDesignBriefs = {
  mathShortCourse: {
    student: {
      name: 'Emma Johnson',
      age: 8,
      grade: '3rd Grade',
      accommodations: ['Visual aids', 'Extra time'],
      challenges: ['Difficulty with abstract concepts'],
      learningProfile: {
        styles: ['Visual', 'Hands-on', 'Story-based'],
        interests: ['Animals', 'Art', 'Nature'],
        favoriteCharacters: 'Wild Kratts and Bluey',
      },
    },
    course: {
      subject: 'MATH',
      topics: ['Multiplication tables', 'Division basics', 'Word problems'],
      learningGoals: 'REINFORCE',
      difficulty: 'medium',
      gradeLevel: ['3rd Grade'],
    },
    format: {
      totalLessons: 12,
      lessonsPerWeek: 3,
      sessionDuration: 30,
      components: ['Interactive games', 'Practice quizzes'],
      deliveryModes: ['online'],
    },
    assessment: {
      successIndicators: ['Improved test scores', 'Increased confidence'],
      reportingPreferences: ['Weekly progress reports'],
      masteryThreshold: 70,
    },
    flags: {
      requiresOfflinePackets: false,
      urgencyLevel: 'STANDARD',
      budgetTier: 'FREE',
      allowReuse: true,
    },
    clarifications: [],
  },

  scienceLongCourse: {
    student: {
      name: 'Marcus Chen',
      age: 11,
      grade: '6th Grade',
      accommodations: [],
      challenges: [],
      learningProfile: {
        styles: ['Hands-on', 'Visual'],
        interests: ['Space', 'Technology', 'Gaming'],
        favoriteCharacters: 'Iron Man and Spider-Man',
      },
    },
    course: {
      subject: 'SCIENCE',
      topics: [
        'Solar System',
        'Planetary Motion',
        'Gravity',
        'Space Exploration',
      ],
      learningGoals: 'GET_AHEAD',
      difficulty: 'hard',
      gradeLevel: ['6th Grade'],
    },
    format: {
      totalLessons: 30,
      lessonsPerWeek: 5,
      sessionDuration: 45,
      components: [
        'Interactive games',
        'Video lessons',
        'Practice quizzes',
        'Projects',
      ],
      deliveryModes: ['online'],
    },
    assessment: {
      successIndicators: ['Advanced placement readiness', 'Project completion'],
      reportingPreferences: [
        'Bi-weekly progress reports',
        'Skill mastery updates',
      ],
      masteryThreshold: 85,
    },
    flags: {
      requiresOfflinePackets: false,
      urgencyLevel: 'HIGH',
      budgetTier: 'PREMIUM',
      allowReuse: true,
    },
    clarifications: [],
  },
};

async function testSkill() {
  console.log('🧪 Testing CurriculumDesignSkill with Anthropic SDK\n');

  const skill = new CurriculumDesignSkill();

  // Display skill metadata
  const metadata = skill.getMetadata();
  console.log('📋 Skill Metadata:');
  console.log(`   ID: ${metadata.id}`);
  console.log(`   Name: ${metadata.name}`);
  console.log(`   Version: ${metadata.version}`);
  console.log(`   Capabilities: ${metadata.capabilities.length}`);
  console.log('');

  // Test each design brief
  for (const [testName, designBrief] of Object.entries(sampleDesignBriefs)) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📝 Test Case: ${testName}`);
    console.log(`${'='.repeat(80)}\n`);

    console.log(
      `Student: ${designBrief.student.name} (Age ${designBrief.student.age}, ${designBrief.student.grade})`
    );
    console.log(`Subject: ${designBrief.course.subject}`);
    console.log(`Topics: ${designBrief.course.topics.join(', ')}`);
    console.log(`Total Lessons: ${designBrief.format.totalLessons}`);
    console.log(
      `Session Duration: ${designBrief.format.sessionDuration} minutes`
    );
    console.log('');

    // Test canHandle
    const confidence = await skill.canHandle('Design curriculum', {
      previousOutputs: new Map([['designBrief', designBrief]]),
    });
    console.log(`✓ canHandle confidence: ${confidence}%`);

    if (confidence < 70) {
      console.log(`⚠️  Skipping test - confidence too low\n`);
      continue;
    }

    // Execute skill
    console.log('\n🚀 Executing skill...\n');

    const context: SkillContext = {
      userRequest: 'Design curriculum for this course',
      previousOutputs: new Map([['designBrief', designBrief]]),
      conversationHistory: [],
    };

    try {
      const result = await skill.execute(context);

      if (result.success) {
        console.log('✅ Execution successful!');
        console.log(`   Execution time: ${result.metadata.executionTime}ms`);
        console.log(`   Confidence: ${result.metadata.confidence}%`);

        const { curriculum } = result.output;

        console.log('\n📊 Curriculum Summary:');
        console.log(`   Title: ${curriculum.courseTitle}`);
        console.log(
          `   Description: ${curriculum.courseDescription.substring(0, 100)}...`
        );
        console.log(`   Total Chapters: ${curriculum.chapters.length}`);
        console.log(`   Total Lessons: ${curriculum.lessons.length}`);
        console.log(
          `   Total Duration: ${curriculum.estimatedTotalMinutes} minutes`
        );
        console.log(`   Total XP: ${curriculum.totalXP}`);

        // Chapter breakdown
        console.log('\n📚 Chapters:');
        curriculum.chapters.forEach((chapter) => {
          const chapterLessons = curriculum.lessons.filter(
            (l) => l.chapterNumber === chapter.number
          );
          console.log(
            `   ${chapter.number}. ${chapter.title} (${chapterLessons.length} lessons)`
          );
          console.log(`      ${chapter.description.substring(0, 80)}...`);
        });

        // Lesson type distribution
        console.log('\n🎮 Lesson Type Distribution:');
        const typeCounts: Record<string, number> = {};
        curriculum.lessons.forEach((lesson) => {
          typeCounts[lesson.type] = (typeCounts[lesson.type] || 0) + 1;
        });

        const total = curriculum.lessons.length;
        for (const [type, count] of Object.entries(typeCounts)) {
          const percentage = ((count / total) * 100).toFixed(1);
          console.log(`   ${type}: ${count} (${percentage}%)`);
        }

        // Difficulty distribution
        console.log('\n⚡ Difficulty Distribution:');
        const difficultyCounts: Record<string, number> = {};
        curriculum.lessons.forEach((lesson) => {
          difficultyCounts[lesson.difficulty] =
            (difficultyCounts[lesson.difficulty] || 0) + 1;
        });

        for (const [difficulty, count] of Object.entries(difficultyCounts)) {
          const percentage = ((count / total) * 100).toFixed(1);
          console.log(`   ${difficulty}: ${count} (${percentage}%)`);
        }

        // XP distribution
        console.log('\n💎 XP Statistics:');
        const xpValues = curriculum.lessons.map((l) => l.xpReward);
        const avgXP = Math.round(
          xpValues.reduce((a, b) => a + b, 0) / xpValues.length
        );
        const minXP = Math.min(...xpValues);
        const maxXP = Math.max(...xpValues);
        console.log(`   Average: ${avgXP} XP per lesson`);
        console.log(`   Range: ${minXP} - ${maxXP} XP`);
        console.log(`   Total: ${curriculum.totalXP} XP`);

        // Sample lessons
        console.log('\n📖 Sample Lessons:');
        const sampleLessons = [
          curriculum.lessons[0], // First
          curriculum.lessons[Math.floor(curriculum.lessons.length / 2)], // Middle
          curriculum.lessons[curriculum.lessons.length - 1], // Last
        ];

        sampleLessons.forEach((lesson) => {
          console.log(`\n   Lesson ${lesson.order}: ${lesson.title}`);
          console.log(
            `      Type: ${lesson.type} | Difficulty: ${lesson.difficulty} | Duration: ${lesson.duration} min | XP: ${lesson.xpReward}`
          );
          console.log(
            `      Objectives: ${lesson.learningObjectives.slice(0, 2).join('; ')}...`
          );
        });

        // Progression strategy
        console.log('\n🎯 Progression Strategy:');
        console.log(
          `   Scaffolding: ${curriculum.progression.scaffolding.substring(0, 100)}...`
        );
        console.log(
          `   Reinforcement: ${curriculum.progression.reinforcement.substring(0, 100)}...`
        );
        console.log(
          `   Assessment: ${curriculum.progression.assessmentStrategy.substring(0, 100)}...`
        );

        if (
          result.metadata.suggestedNextSkills &&
          result.metadata.suggestedNextSkills.length > 0
        ) {
          console.log(
            `\n🔗 Suggested next skills: ${result.metadata.suggestedNextSkills.join(', ')}`
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

    console.log('');
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ All tests completed!');
  console.log(`${'='.repeat(80)}\n`);
}

// Run tests
testSkill().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
