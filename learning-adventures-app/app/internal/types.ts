export interface ContentFormData {
  type: 'game' | 'lesson';
  subject: 'math' | 'science';
  title: string;
  gameIdea: string; // Changed from description to gameIdea
  gradeLevel: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];
  estimatedTime: string;
  concept: string;
  additionalRequirements?: string;
}

export interface GeneratedContent {
  htmlContent: string;
  metadata: {
    id: string;
    title: string;
    description: string;
    type: 'game' | 'lesson';
    category: 'math' | 'science';
    gradeLevel: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    skills: string[];
    estimatedTime: string;
    featured?: boolean;
    htmlPath?: string;
  };
}

export interface ClaudeResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}