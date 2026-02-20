/**
 * Test script for CourseDesignBriefSkill with Anthropic SDK integration
 *
 * Run with: npx tsx lib/skills/course-design-brief/__tests__/test-skill.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { CourseDesignBriefSkill } from '../CourseDesignBriefSkill';
import { allTestCases } from './sample-data';
import type { SkillContext } from '../../types';

async function testSkill() {
  console.log('🧪 Testing CourseDesignBriefSkill with Anthropic SDK\n');

  const skill = new CourseDesignBriefSkill();

  // Display skill metadata
  const metadata = skill.getMetadata();
  console.log('📋 Skill Metadata:');
  console.log(`   ID: ${metadata.id}`);
  console.log(`   Name: ${metadata.name}`);
  console.log(`   Version: ${metadata.version}`);
  console.log(`   Capabilities: ${metadata.capabilities.length}`);
  console.log('');

  // Test each scenario
  for (const testCase of allTestCases) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📝 Test Case: ${testCase.name}`);
    console.log(`${'='.repeat(80)}\n`);

    console.log(
      `Student: ${testCase.data.studentName} (Age ${testCase.data.studentAge}, ${testCase.data.gradeLevel})`
    );
    console.log(`Subject: ${testCase.data.primarySubject}`);
    console.log(
      `Topics: ${testCase.data.specificTopics?.length ? testCase.data.specificTopics.join(', ') : 'None specified'}`
    );
    console.log('');

    // Test canHandle
    const confidence = await skill.canHandle('Normalize this course request', {
      previousOutputs: new Map([['courseRequest', testCase.data]]),
    });
    console.log(`✓ canHandle confidence: ${confidence}%`);

    if (confidence < 70) {
      console.log(`⚠️  Skipping test - confidence too low\n`);
      continue;
    }

    // Execute skill
    console.log('\n🚀 Executing skill...\n');

    const context: SkillContext = {
      userRequest: 'Create design brief for this course request',
      previousOutputs: new Map([['courseRequest', testCase.data]]),
      conversationHistory: [],
    };

    try {
      const result = await skill.execute(context);

      if (result.success) {
        console.log('✅ Execution successful!');
        console.log(`   Execution time: ${result.metadata.executionTime}ms`);
        console.log(`   Confidence: ${result.metadata.confidence}%`);

        const { designBrief } = result.output;

        console.log('\n📊 Design Brief Summary:');
        console.log(
          `   Student: ${designBrief.student.name} (Age ${designBrief.student.age})`
        );
        console.log(`   Subject: ${designBrief.course.subject}`);
        console.log(`   Topics: ${designBrief.course.topics.join(', ')}`);
        console.log(`   Difficulty: ${designBrief.course.difficulty}`);
        console.log(`   Total Lessons: ${designBrief.format.totalLessons}`);
        console.log(`   Lessons/Week: ${designBrief.format.lessonsPerWeek}`);
        console.log(
          `   Session Duration: ${designBrief.format.sessionDuration} minutes`
        );

        if (designBrief.student.learningProfile.interests.length > 0) {
          console.log(
            `   Interests: ${designBrief.student.learningProfile.interests.join(', ')}`
          );
        }

        // Check clarifications
        if (designBrief.clarifications.length > 0) {
          console.log(
            `\n⚠️  ${designBrief.clarifications.length} Clarification(s) Needed:`
          );
          designBrief.clarifications.forEach((clarification, index) => {
            console.log(`\n   ${index + 1}. Field: ${clarification.field}`);
            console.log(`      Question: ${clarification.question}`);
            console.log(`      Reason: ${clarification.reason}`);
          });
        } else {
          console.log('\n✅ No clarifications needed - all data clear!');
        }

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
