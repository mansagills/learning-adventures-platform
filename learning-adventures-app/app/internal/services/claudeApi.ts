import { ContentFormData, ClaudeResponse } from '../types';

export async function refineContentIdea(formData: ContentFormData): Promise<ClaudeResponse> {
  try {
    const response = await fetch('/api/internal/claude-refine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Claude refine API:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get suggestions from Claude. Please check your API key and try again.');
  }
}

export async function generateContent(formData: ContentFormData, refinements?: string): Promise<string> {
  try {
    const response = await fetch('/api/internal/claude-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formData, refinements })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error calling Claude generate API:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate content. Please check your API key and try again.');
  }
}