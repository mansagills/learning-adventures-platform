// @ts-nocheck
/**
 * Test Script: React Game Workflow
 * Tests the complete workflow for creating a React-based math game
 */

import { WorkflowFactory } from './index';
import { ReactGameWorkflowInput } from './types';

async function testReactGameWorkflow() {
  console.log('🚀 Starting React Game Workflow Test\n');
  console.log('='.repeat(70));

  // Step 1: Create workflow factory
  console.log('\n📦 Step 1: Initializing Workflow Factory...');
  const factory = new WorkflowFactory();
  console.log('✅ Factory initialized with 4 agents registered');

  // Step 2: Define game requirements
  console.log('\n🎮 Step 2: Defining Math Game Requirements...');

  const gameInput: ReactGameWorkflowInput = {
    gameIdea:
      'An interactive multiplication adventure where students help a space explorer collect stars by solving multiplication problems. Each correct answer moves the spaceship forward through different planets.',
    subject: 'math',
    gradeLevel: '3-5',
    complexity: 'moderate',
    features: [
      'visual spaceship animation',
      'progressive difficulty',
      'score tracking',
      'timer challenge mode',
      'star collection system',
      'encouraging feedback',
    ],
    skills: [
      'multiplication facts 1-10',
      'mental math',
      'speed calculation',
      'problem solving',
    ],
    learningObjectives: [
      'Master multiplication tables from 1 to 10',
      'Improve mental calculation speed',
      'Build confidence in arithmetic',
      'Apply multiplication in game scenarios',
    ],
  };

  console.log('Game Details:');
  console.log(`  Title: Space Multiplication Adventure`);
  console.log(`  Subject: ${gameInput.subject}`);
  console.log(`  Grade: ${gameInput.gradeLevel}`);
  console.log(`  Complexity: ${gameInput.complexity}`);
  console.log(`  Features: ${gameInput.features.length} features requested`);
  console.log(`  Skills: ${gameInput.skills.join(', ')}`);

  // Step 3: Create workflow
  console.log('\n🔧 Step 3: Creating React Game Workflow...');
  const workflowId = await factory.createReactGameWorkflow(gameInput);
  console.log(`✅ Workflow created with ID: ${workflowId}`);

  // Step 4: Set up event monitoring
  console.log('\n👂 Step 4: Setting up Event Monitoring...');
  let currentStep = 0;

  factory.addEventListener(workflowId, (event: any) => {
    const timestamp = new Date().toLocaleTimeString();

    switch (event.type) {
      case 'started':
        console.log(`\n[${timestamp}] 🎬 ${event.message}`);
        break;
      case 'step_started':
        currentStep = event.step || 0;
        console.log(
          `\n[${timestamp}] ⚙️  Step ${currentStep}: ${event.message}`
        );
        break;
      case 'step_completed':
        console.log(
          `[${timestamp}] ✅ Step ${event.step} completed successfully`
        );
        break;
      case 'step_failed':
        console.log(
          `[${timestamp}] ❌ Step ${event.step} failed: ${event.message}`
        );
        break;
      case 'completed':
        console.log(`\n[${timestamp}] 🎉 ${event.message}`);
        break;
      case 'failed':
        console.log(`\n[${timestamp}] 💥 ${event.message}`);
        break;
    }
  });

  console.log('✅ Event listener attached');

  // Step 5: Execute workflow
  console.log('\n▶️  Step 5: Executing Workflow...');
  console.log('='.repeat(70));

  const result = await factory.executeWorkflow(workflowId);

  // Step 6: Display results
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Step 6: Workflow Results\n');

  if (result.status === 'completed') {
    console.log('✅ Workflow Status: COMPLETED');
    console.log(`⏱️  Total Duration: ${result.totalDuration}ms`);
    console.log(
      `📝 Steps Completed: ${result.steps.filter((s) => s.status === 'completed').length}/${result.steps.length}`
    );

    // Step 1 Results: React Component Agent
    console.log('\n--- Step 1: React Component Generation ---');
    const step1 = result.results.step1;
    if (step1) {
      console.log(`Component Code: ${step1.componentCode.length} characters`);
      console.log(`Component Directory: ${step1.componentDirectory}`);
      console.log(`Dependencies: ${step1.dependencies.join(', ')}`);
      console.log('\n📝 Component Code Preview (first 500 chars):');
      console.log('-'.repeat(70));
      console.log(step1.componentCode.substring(0, 500) + '...');
      console.log('-'.repeat(70));

      console.log('\n📝 Registration Code:');
      console.log('-'.repeat(70));
      console.log(step1.registrationCode);
      console.log('-'.repeat(70));
    }

    // Step 2 Results: Accessibility Validator
    console.log('\n--- Step 2: Accessibility Validation ---');
    const step2 = result.results.step2;
    if (step2 && step2.report) {
      const report = step2.report;
      console.log(`Overall Score: ${report.overallScore}/100`);
      console.log(
        `WCAG Compliant: ${report.wcagCompliant ? '✅ Yes' : '❌ No'}`
      );
      console.log(`Issues Found: ${report.issues.length}`);

      if (report.issues.length > 0) {
        console.log('\n🔍 Issues by Severity:');
        const criticalIssues = report.issues.filter(
          (i: any) => i.severity === 'critical'
        );
        const highIssues = report.issues.filter(
          (i: any) => i.severity === 'high'
        );
        const mediumIssues = report.issues.filter(
          (i: any) => i.severity === 'medium'
        );
        const lowIssues = report.issues.filter(
          (i: any) => i.severity === 'low'
        );

        console.log(`  🔴 Critical: ${criticalIssues.length}`);
        console.log(`  🟠 High: ${highIssues.length}`);
        console.log(`  🟡 Medium: ${mediumIssues.length}`);
        console.log(`  🟢 Low: ${lowIssues.length}`);

        if (criticalIssues.length > 0) {
          console.log('\n⚠️  Critical Issues:');
          criticalIssues.forEach((issue: any, i: number) => {
            console.log(`  ${i + 1}. ${issue.description}`);
            console.log(`     Fix: ${issue.suggestedFix}`);
          });
        }
      }

      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec: any, i: number) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }

    // Step 3 Results: Metadata Formatter
    console.log('\n--- Step 3: Catalog Metadata ---');
    const step3 = result.results.step3;
    if (step3 && step3.catalogEntry) {
      const entry = step3.catalogEntry;
      console.log(`Target Array: ${step3.targetArray}`);
      console.log(`\n📋 Catalog Entry:`);
      console.log(JSON.stringify(entry, null, 2));

      console.log(`\n✅ Validation:`);
      console.log(`  Valid: ${step3.validation.valid ? '✅ Yes' : '❌ No'}`);
      if (step3.validation.errors.length > 0) {
        console.log(`  Errors: ${step3.validation.errors.join(', ')}`);
      }
      if (step3.validation.warnings.length > 0) {
        console.log(`  Warnings: ${step3.validation.warnings.join(', ')}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('\n🎯 Workflow Summary\n');
    console.log('✅ React component generated successfully');
    console.log('✅ Accessibility validation completed');
    console.log('✅ Catalog metadata formatted');
    console.log('\n📁 Files Ready for Deployment:');
    console.log(
      `  1. Component: ${step1?.componentDirectory}/[ComponentName].tsx`
    );
    console.log(`  2. Registration: ${step1?.componentDirectory}/index.ts`);
    console.log(`  3. Catalog Entry: Ready for lib/catalogData.ts`);
  } else if (result.status === 'failed') {
    console.log('❌ Workflow Status: FAILED');
    console.log('\n💥 Errors:');
    result.errors.forEach((error, i) => {
      console.log(
        `  ${i + 1}. Step ${error.step} (${error.agentType}): ${error.message}`
      );
      console.log(`     Recoverable: ${error.recoverable ? 'Yes' : 'No'}`);
    });
  }

  // Step 7: Display workflow details
  console.log('\n' + '='.repeat(70));
  console.log('\n📈 Step 7: Workflow Details\n');

  result.steps.forEach((step) => {
    const statusIcon =
      step.status === 'completed'
        ? '✅'
        : step.status === 'failed'
          ? '❌'
          : step.status === 'running'
            ? '⏳'
            : '⏸️';

    console.log(`${statusIcon} Step ${step.stepNumber}: ${step.description}`);
    console.log(`   Agent: ${step.agentType}`);
    console.log(`   Status: ${step.status}`);
    if (step.duration) {
      console.log(`   Duration: ${step.duration}ms`);
    }
    if (step.error) {
      console.log(`   Error: ${step.error}`);
    }
    console.log('');
  });

  console.log('='.repeat(70));
  console.log('\n✨ Test Complete!\n');
}

// Run the test
console.log(
  '╔════════════════════════════════════════════════════════════════════╗'
);
console.log(
  '║         React Game Workflow Test - Math Adventure Game            ║'
);
console.log(
  '║                    Phase 5B Implementation                         ║'
);
console.log(
  '╚════════════════════════════════════════════════════════════════════╝\n'
);

testReactGameWorkflow().catch((error) => {
  console.error('\n💥 Test failed with error:', error);
  process.exit(1);
});
