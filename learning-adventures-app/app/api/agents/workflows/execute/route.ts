/**
 * Workflow Execution API
 *
 * POST /api/agents/workflows/execute
 * Executes a multi-agent workflow with real-time progress updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WorkflowExecutor } from '@/lib/agents/WorkflowExecutor';

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify role
    const userRole = session.user.role;
    if (userRole !== 'ADMIN' && userRole !== 'TEACHER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse request
    const { workflowId, input, fileIds } = await request.json();

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 });
    }

    // Create workflow execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        userId: session.user.id,
        workflowType: workflowId,
        status: 'RUNNING',
        currentStep: 0,
        totalSteps: 0, // Will be set by executor
        inputData: input || {},
      },
    });

    // Initialize executor
    const executor = new WorkflowExecutor(execution.id, session.user.id);

    // Execute workflow in background (streaming response)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Execute the workflow
          await executor.execute(
            workflowId,
            input,
            fileIds,
            (progress) => {
              // Send progress updates to client
              const data = JSON.stringify({
                type: 'progress',
                ...progress,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          );

          // Send completion message
          const completionData = JSON.stringify({
            type: 'complete',
            executionId: execution.id,
          });
          controller.enqueue(encoder.encode(`data: ${completionData}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Workflow execution error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Workflow execution failed',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();

          // Update execution record
          await prisma.workflowExecution.update({
            where: { id: execution.id },
            data: {
              status: 'FAILED',
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Workflow API error:', error);
    return NextResponse.json(
      { error: 'Failed to start workflow' },
      { status: 500 }
    );
  }
}
