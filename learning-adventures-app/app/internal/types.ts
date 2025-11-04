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
  // New fields for uploaded content
  uploadSource?: 'ai-generated' | 'uploaded';
  uploadPlatform?: 'base44' | 'v0' | 'replit' | 'bolt' | 'other';
  subscriptionTier: 'free' | 'premium' | 'custom' | 'course';
  sourceCodeUrl?: string;
  buildInstructions?: string;
  uploadedZipPath?: string; // Temp path after upload
  projectType?: 'html' | 'react-nextjs'; // Detected project type
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
    // New fields for premium/uploaded content
    subscriptionTier?: 'free' | 'premium' | 'custom' | 'course';
    uploadedContent?: boolean;
    platform?: string;
    sourceCodeUrl?: string;
  };
}

export interface ClaudeResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}