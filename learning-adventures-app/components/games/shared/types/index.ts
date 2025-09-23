// Base game types
export interface GameProps {
  onExit?: () => void;
  onComplete?: (score: number) => void;
  onProgress?: (progress: number) => void;
  settings?: GameSettings;
}

export interface GameSettings {
  difficulty?: 'easy' | 'medium' | 'hard';
  soundEnabled?: boolean;
  theme?: 'light' | 'dark';
  language?: string;
}

export interface GameResult {
  score: number;
  level: number;
  timeElapsed: number;
  achievements: string[];
  completed: boolean;
}

// Component registration for dynamic loading
export interface GameComponent {
  name: string;
  component: React.ComponentType<GameProps>;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  skills: string[];
  gradeLevel: string;
}

// Progress tracking
export interface PlayerProgress {
  gameId: string;
  completions: number;
  bestScore: number;
  totalTimeSpent: number;
  achievements: string[];
  lastPlayed: Date;
}

// Achievement system
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (gameResult: GameResult, progress: PlayerProgress) => boolean;
}

// Educational content
export interface LearningObjective {
  id: string;
  description: string;
  subject: string;
  gradeLevel: string;
}

export interface EducationalGame extends GameComponent {
  learningObjectives: LearningObjective[];
  curriculum?: string[];
  prerequisites?: string[];
}