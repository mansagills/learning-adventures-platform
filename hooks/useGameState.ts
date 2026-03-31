/**
 * useGameState Hook
 *
 * Manages game state (score, level, etc.)
 */

'use client';

import { useState, useCallback } from 'react';

interface GameState {
  score: number;
  level: number;
  lives: number;
  gameStatus: 'idle' | 'playing' | 'paused' | 'won' | 'lost';
}

export function useGameState(initialLives: number = 3) {
  const [state, setState] = useState<GameState>({
    score: 0,
    level: 1,
    lives: initialLives,
    gameStatus: 'idle',
  });

  const startGame = useCallback(() => {
    setState({
      score: 0,
      level: 1,
      lives: initialLives,
      gameStatus: 'playing',
    });
  }, [initialLives]);

  const pauseGame = useCallback(() => {
    setState((prev) => ({ ...prev, gameStatus: 'paused' }));
  }, []);

  const resumeGame = useCallback(() => {
    setState((prev) => ({ ...prev, gameStatus: 'playing' }));
  }, []);

  const winGame = useCallback(() => {
    setState((prev) => ({ ...prev, gameStatus: 'won' }));
  }, []);

  const loseGame = useCallback(() => {
    setState((prev) => ({ ...prev, gameStatus: 'lost' }));
  }, []);

  const addScore = useCallback((points: number) => {
    setState((prev) => ({ ...prev, score: prev.score + points }));
  }, []);

  const loseLife = useCallback(() => {
    setState((prev) => {
      const newLives = prev.lives - 1;
      return {
        ...prev,
        lives: newLives,
        gameStatus: newLives <= 0 ? 'lost' : prev.gameStatus,
      };
    });
  }, []);

  const nextLevel = useCallback(() => {
    setState((prev) => ({ ...prev, level: prev.level + 1 }));
  }, []);

  const resetGame = useCallback(() => {
    setState({
      score: 0,
      level: 1,
      lives: initialLives,
      gameStatus: 'idle',
    });
  }, [initialLives]);

  return {
    ...state,
    startGame,
    pauseGame,
    resumeGame,
    winGame,
    loseGame,
    addScore,
    loseLife,
    nextLevel,
    resetGame,
  };
}
