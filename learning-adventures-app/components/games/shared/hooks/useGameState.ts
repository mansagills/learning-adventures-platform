import { useState, useCallback, useEffect } from 'react';

export interface GameState {
  score: number;
  level: number;
  lives: number;
  isGameOver: boolean;
  isPaused: boolean;
  timeElapsed: number;
  achievements: string[];
}

interface UseGameStateOptions {
  initialScore?: number;
  initialLevel?: number;
  initialLives?: number;
  maxLives?: number;
  onGameOver?: () => void;
  onLevelUp?: (newLevel: number) => void;
  onAchievement?: (achievement: string) => void;
}

export function useGameState(options: UseGameStateOptions = {}) {
  const {
    initialScore = 0,
    initialLevel = 1,
    initialLives = 3,
    maxLives = 5,
    onGameOver,
    onLevelUp,
    onAchievement,
  } = options;

  const [gameState, setGameState] = useState<GameState>({
    score: initialScore,
    level: initialLevel,
    lives: initialLives,
    isGameOver: false,
    isPaused: false,
    timeElapsed: 0,
    achievements: [],
  });

  // Timer for elapsed time
  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

    const interval = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        timeElapsed: prev.timeElapsed + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isGameOver, gameState.isPaused]);

  const addScore = useCallback((points: number) => {
    setGameState((prev) => ({
      ...prev,
      score: prev.score + points,
    }));
  }, []);

  const loseLife = useCallback(() => {
    setGameState((prev) => {
      const newLives = prev.lives - 1;
      const isGameOver = newLives <= 0;

      if (isGameOver && onGameOver) {
        onGameOver();
      }

      return {
        ...prev,
        lives: newLives,
        isGameOver,
      };
    });
  }, [onGameOver]);

  const gainLife = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      lives: Math.min(prev.lives + 1, maxLives),
    }));
  }, [maxLives]);

  const levelUp = useCallback(() => {
    setGameState((prev) => {
      const newLevel = prev.level + 1;
      if (onLevelUp) {
        onLevelUp(newLevel);
      }
      return {
        ...prev,
        level: newLevel,
      };
    });
  }, [onLevelUp]);

  const pauseGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      score: initialScore,
      level: initialLevel,
      lives: initialLives,
      isGameOver: false,
      isPaused: false,
      timeElapsed: 0,
      achievements: [],
    });
  }, [initialScore, initialLevel, initialLives]);

  const addAchievement = useCallback(
    (achievement: string) => {
      setGameState((prev) => {
        if (prev.achievements.includes(achievement)) return prev;

        if (onAchievement) {
          onAchievement(achievement);
        }

        return {
          ...prev,
          achievements: [...prev.achievements, achievement],
        };
      });
    },
    [onAchievement]
  );

  return {
    gameState,
    actions: {
      addScore,
      loseLife,
      gainLife,
      levelUp,
      pauseGame,
      resumeGame,
      resetGame,
      addAchievement,
    },
  };
}
