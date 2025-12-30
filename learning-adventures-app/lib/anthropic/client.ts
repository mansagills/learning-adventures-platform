import Anthropic from '@anthropic-ai/sdk';

/**
 * Anthropic API Client Configuration
 *
 * Provides a singleton instance of the Anthropic client for use across the application.
 * Uses the ANTHROPIC_API_KEY from environment variables.
 */

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Default model configuration for course generation tasks
 */
export const COURSE_GENERATION_MODEL = 'claude-sonnet-4-5-20250929';

/**
 * Helper function to call Claude with retry logic
 */
export async function callClaudeWithRetry(
  params: Anthropic.MessageCreateParams,
  maxRetries: number = 3
): Promise<Anthropic.Message> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create(params);
      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (400s)
      if (error instanceof Anthropic.APIError && error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Exponential backoff for retries
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.warn(`Claude API call failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Claude API call failed after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Extract text content from Claude response
 */
export function extractTextFromResponse(response: Anthropic.Message): string {
  const textBlock = response.content.find(block => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content found in Claude response');
  }
  return textBlock.text;
}

/**
 * Extract and parse JSON from Claude response
 * Handles responses that may have markdown code blocks
 */
export function extractJSONFromResponse<T = any>(response: Anthropic.Message): T {
  const text = extractTextFromResponse(response);

  // Try to extract JSON from markdown code blocks
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonText = jsonBlockMatch ? jsonBlockMatch[1] : text;

  try {
    return JSON.parse(jsonText.trim());
  } catch (error) {
    throw new Error(`Failed to parse JSON from Claude response: ${error instanceof Error ? error.message : 'Unknown error'}\n\nResponse text: ${text.substring(0, 500)}...`);
  }
}
