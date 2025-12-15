/**
 * Shared Claude API Client
 * Provides a singleton Anthropic client for use across the application
 */

import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

/**
 * Get or create the Anthropic client singleton
 */
export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    anthropicClient = new Anthropic({
      apiKey,
    });
  }

  return anthropicClient;
}

/**
 * Check if the Claude API is configured
 */
export function isClaudeConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Call Claude with a simple prompt and get text response
 */
export async function callClaude(
  prompt: string,
  options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  }
): Promise<string> {
  const client = getAnthropicClient();

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: prompt,
    },
  ];

  const response = await client.messages.create({
    model: options?.model || 'claude-3-5-sonnet-latest',
    max_tokens: options?.maxTokens || 4000,
    temperature: options?.temperature ?? 1.0,
    system: options?.systemPrompt,
    messages,
  });

  const content = response.content[0];

  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return content.text;
}
