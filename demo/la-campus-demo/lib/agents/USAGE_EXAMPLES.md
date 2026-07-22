# Agent Workflow System - Usage Examples

This document provides comprehensive examples of using the Agent Workflow System for automated content creation.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Creating HTML Games](#creating-html-games)
3. [Creating React Games](#creating-react-games)
4. [Validating Existing Content](#validating-existing-content)
5. [Batch Creation](#batch-creation)
6. [Monitoring Workflows](#monitoring-workflows)
7. [Error Handling](#error-handling)

---

## Basic Setup

```typescript
import { WorkflowFactory } from '@/lib/agents';

// Create a workflow factory instance
const factory = new WorkflowFactory();
```

---

## Creating HTML Games

### Example 1: Simple Math Game

```typescript
// Define game requirements
const input = {
  gameIdea:
    'A multiplication racing game where students race cars by solving multiplication problems. Correct answers make the car go faster!',
  subject: 'math' as const,
  gradeLevel: '3-5',
  skills: ['multiplication', 'mental math', 'speed calculation'],
  learningObjectives: [
    'Master multiplication facts 1-10',
    'Improve mental math speed',
    'Build confidence in arithmetic',
  ],
};

// Create workflow
const workflowId = await factory.createHTMLGameWorkflow(input);

// Execute workflow
const result = await factory.executeWorkflow(workflowId);

// Access results
if (result.status === 'completed') {
  const gameCode = result.results.step1.gameCode;
  const accessibilityReport = result.results.step2.report;
  const catalogEntry = result.results.step3.catalogEntry;

  console.log('Game created successfully!');
  console.log('Accessibility Score:', accessibilityReport.overallScore);
  console.log('Catalog Entry:', catalogEntry);
}
```

### Example 2: Science Experiment Simulation

```typescript
const input = {
  gameIdea:
    'An interactive plant growth simulator where students adjust sunlight, water, and nutrients to see how plants grow over time.',
  subject: 'science' as const,
  gradeLevel: '4-6',
  skills: [
    'scientific method',
    'observation',
    'data collection',
    'cause and effect',
  ],
  learningObjectives: [
    'Understand factors affecting plant growth',
    'Learn to control variables in experiments',
    'Practice data observation and recording',
  ],
  additionalRequirements:
    'Include a timer to show growth over days, and charts showing growth progress',
};

const workflowId = await factory.createHTMLGameWorkflow(input);
const result = await factory.executeWorkflow(workflowId);
```

---

## Creating React Games

### Example 1: Interactive Quiz Component

```typescript
const input = {
  gameIdea:
    'A vocabulary quiz game with multiple choice questions, hints, and progress tracking',
  subject: 'english',
  gradeLevel: '5-7',
  complexity: 'moderate' as const,
  features: [
    'multiple choice questions',
    'hint system',
    'score tracking',
    'timer',
    'progress bar',
  ],
  skills: ['vocabulary', 'reading comprehension', 'word usage'],
  learningObjectives: [
    'Expand vocabulary knowledge',
    'Understand word meanings in context',
    'Improve reading comprehension',
  ],
};

const workflowId = await factory.createReactGameWorkflow(input);
const result = await factory.executeWorkflow(workflowId);

if (result.status === 'completed') {
  const componentCode = result.results.step1.componentCode;
  const componentDirectory = result.results.step1.componentDirectory;
  const registrationCode = result.results.step1.registrationCode;

  console.log('React component created at:', componentDirectory);
}
```

### Example 2: Drag-and-Drop History Timeline

```typescript
const input = {
  gameIdea:
    'Drag-and-drop timeline game where students place historical events in chronological order',
  subject: 'history',
  gradeLevel: '6-8',
  complexity: 'complex' as const,
  features: [
    'drag and drop',
    'visual timeline',
    'feedback system',
    'difficulty levels',
    'achievements',
  ],
  skills: ['chronological thinking', 'historical analysis', 'sequencing'],
  learningObjectives: [
    'Understand chronological order of historical events',
    'Recognize cause and effect in history',
    'Develop timeline analysis skills',
  ],
};

const workflowId = await factory.createReactGameWorkflow(input);
const result = await factory.executeWorkflow(workflowId);
```

---

## Validating Existing Content

### Example: Validate an Existing HTML Game

```typescript
// Load existing game code
const existingGameCode = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Math Game</title>
</head>
<body>
  <div class="game">
    <!-- Game content -->
  </div>
</body>
</html>
`;

// Create validation-only workflow
const workflowId = await factory.createValidationWorkflow(
  existingGameCode,
  'html'
);

// Execute
const result = await factory.executeWorkflow(workflowId);

// Check accessibility report
if (result.status === 'completed') {
  const report = result.results.step1.report;

  console.log('Accessibility Score:', report.overallScore);
  console.log('WCAG Compliant:', report.wcagCompliant);
  console.log('Issues Found:', report.issues.length);

  // Print critical issues
  const criticalIssues = report.issues.filter((i) => i.severity === 'critical');
  criticalIssues.forEach((issue) => {
    console.log(`CRITICAL: ${issue.description}`);
    console.log(`Fix: ${issue.suggestedFix}`);
  });
}
```

---

## Batch Creation

### Example: Create Multiple Games Sequentially

```typescript
const batchInput = {
  gameIdeas: [
    {
      title: 'Addition Adventure',
      type: 'html' as const,
      subject: 'math',
      gradeLevel: '1-3',
      description: 'Practice addition facts through an adventure game',
      skills: ['addition', 'number sense'],
    },
    {
      title: 'Subtraction Safari',
      type: 'html' as const,
      subject: 'math',
      gradeLevel: '1-3',
      description: 'Learn subtraction in a safari setting',
      skills: ['subtraction', 'problem solving'],
    },
    {
      title: 'Multiplication Mountain',
      type: 'react' as const,
      subject: 'math',
      gradeLevel: '3-5',
      description: 'Climb the mountain by solving multiplication problems',
      skills: ['multiplication', 'mental math'],
    },
  ],
  execution: 'sequential' as const,
};

// Create and execute all workflows
const workflowIds = await factory.createBatchWorkflowSequential(batchInput);

console.log(`Created ${workflowIds.length} games successfully!`);

// Check each workflow
workflowIds.forEach((id, index) => {
  const workflow = factory.getWorkflow(id);
  if (workflow) {
    console.log(`Game ${index + 1}: ${workflow.name} - ${workflow.status}`);
  }
});
```

### Example: Create Multiple Games in Parallel

```typescript
const batchInput = {
  gameIdeas: [
    // ... same as above
  ],
  execution: 'parallel' as const,
  maxConcurrent: 3,
};

// Execute in parallel (faster for multiple games)
const workflowIds = await factory.createBatchWorkflowParallel(batchInput);

console.log(`Created ${workflowIds.length} games in parallel!`);
```

---

## Monitoring Workflows

### Example 1: Listen to Workflow Events

```typescript
const workflowId = await factory.createHTMLGameWorkflow({
  gameIdea: 'A fun fractions game',
  subject: 'math',
  gradeLevel: '4-6',
  skills: ['fractions', 'division'],
});

// Add event listener
factory.addEventListener(workflowId, (event) => {
  console.log(`[${event.type}] ${event.message}`);

  switch (event.type) {
    case 'started':
      console.log('Workflow started!');
      break;
    case 'step_started':
      console.log(`Starting step ${event.step}`);
      break;
    case 'step_completed':
      console.log(`Completed step ${event.step}`);
      break;
    case 'completed':
      console.log('Workflow completed successfully!');
      break;
    case 'failed':
      console.log('Workflow failed:', event.message);
      break;
  }
});

// Execute
await factory.executeWorkflow(workflowId);
```

### Example 2: Monitor Progress

```typescript
const workflowId = await factory.createReactGameWorkflow({
  gameIdea: 'Interactive spelling game',
  subject: 'english',
  gradeLevel: '2-4',
  complexity: 'simple',
  features: ['audio', 'visual feedback'],
  skills: ['spelling', 'phonics'],
});

// Start execution (don't await)
factory.executeWorkflow(workflowId);

// Check progress periodically
const progressInterval = setInterval(() => {
  const progress = factory.getProgress(workflowId);

  if (progress) {
    console.log(`Progress: ${progress.percentComplete.toFixed(1)}%`);
    console.log(`Status: ${progress.status}`);
    console.log(`Current: ${progress.currentActivity}`);

    if (progress.status === 'completed' || progress.status === 'failed') {
      clearInterval(progressInterval);
    }
  }
}, 1000);
```

---

## Error Handling

### Example 1: Handle Workflow Failures

```typescript
try {
  const workflowId = await factory.createHTMLGameWorkflow({
    gameIdea: 'Test game',
    subject: 'math',
    gradeLevel: '3-5',
    skills: ['addition'],
  });

  const result = await factory.executeWorkflow(workflowId);

  if (result.status === 'failed') {
    console.error('Workflow failed!');
    result.errors.forEach((error) => {
      console.error(`Step ${error.step}: ${error.message}`);
    });

    // Attempt to recover or notify user
    if (result.errors[0].recoverable) {
      console.log('Attempting to retry...');
      // Implement retry logic
    }
  }
} catch (error) {
  console.error('Fatal error:', error);
}
```

### Example 2: Pause and Resume Workflows

```typescript
const workflowId = await factory.createHTMLGameWorkflow({
  gameIdea: 'Long-running game creation',
  subject: 'science',
  gradeLevel: '6-8',
  skills: ['scientific method'],
});

// Start execution
factory.executeWorkflow(workflowId);

// Pause after some time
setTimeout(() => {
  const paused = factory.pauseWorkflow(workflowId);
  if (paused) {
    console.log('Workflow paused');
  }
}, 5000);

// Resume later
setTimeout(async () => {
  const result = await factory.resumeWorkflow(workflowId);
  console.log('Workflow resumed and completed:', result.status);
}, 10000);
```

### Example 3: Cancel Workflows

```typescript
const workflowId = await factory.createReactGameWorkflow({
  gameIdea: 'Complex game',
  subject: 'interdisciplinary',
  gradeLevel: '7-9',
  complexity: 'complex',
  features: ['multiplayer', 'leaderboard'],
  skills: ['critical thinking'],
});

// Start execution
factory.executeWorkflow(workflowId);

// Cancel if needed (e.g., user cancellation)
const cancelled = factory.cancelWorkflow(workflowId);
if (cancelled) {
  console.log('Workflow cancelled successfully');
}
```

---

## Advanced Usage

### Example: Custom Workflow

```typescript
import { WorkflowStep } from '@/lib/agents';

// Define custom steps
const customSteps: Omit<WorkflowStep, 'status' | 'stepNumber'>[] = [
  {
    agentType: 'game-builder',
    skillName: 'educational-game-builder',
    description: 'Build initial game',
    input: {
      gameIdea: 'Custom game concept',
      subject: 'math',
      gradeLevel: '5-7',
      skills: ['algebra'],
    },
  },
  {
    agentType: 'accessibility-validator',
    skillName: 'accessibility-validator',
    description: 'Validate accessibility',
    input: { code: '{{step1.output.gameCode}}', format: 'html' },
  },
  // Add more custom steps as needed
];

// Create custom workflow
const workflowId = await factory.createCustomWorkflow(
  'My Custom Workflow',
  'html-game',
  customSteps
);

const result = await factory.executeWorkflow(workflowId);
```

---

## Best Practices

1. **Always validate input**: Ensure game ideas are clear and detailed
2. **Monitor progress**: Use event listeners for long-running workflows
3. **Handle errors**: Always check workflow status and handle failures
4. **Batch wisely**: Use parallel execution for independent games, sequential for related content
5. **Test accessibility**: Always run accessibility validation on generated content
6. **Review output**: Manually review generated games before publishing

---

## Next Steps

- See `COMPREHENSIVE_PLATFORM_PLAN.md` for Phase 5C (Integration & Automation)
- Review individual agent documentation in the `skills/` directory
- Explore the agent source code in `/lib/agents/` for advanced customization

---

**Phase 5B: Agent Workflow Architecture - Complete! ✅**
