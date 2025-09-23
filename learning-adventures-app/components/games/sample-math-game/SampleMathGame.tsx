'use client';

import React, { useState, useEffect } from 'react';
import {
  GameContainer,
  GameButton,
  ScoreBoard,
  GameModal,
  useGameState,
  useGameTimer,
  GameProps,
} from '@/components/games/shared';

interface Question {
  num1: number;
  num2: number;
  operation: '+' | '-' | '*';
  correctAnswer: number;
}

export default function SampleMathGame({ onExit, onComplete }: GameProps) {
  const { gameState, actions } = useGameState({
    initialLives: 3,
    onGameOver: () => setShowGameOverModal(true),
    onLevelUp: (level) => actions.addAchievement(`Reached Level ${level}`),
  });

  const timer = useGameTimer({
    initialTime: 60,
    countDown: true,
    onTimeUp: () => actions.loseLife(),
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Generate a new question based on current level
  const generateQuestion = (): Question => {
    const level = gameState.level;
    const maxNum = Math.min(10 + level * 2, 50);
    const operations: Array<'+' | '-' | '*'> = ['+'];

    if (level >= 2) operations.push('-');
    if (level >= 3) operations.push('*');

    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1 = Math.floor(Math.random() * maxNum) + 1;
    let num2 = Math.floor(Math.random() * maxNum) + 1;

    // Ensure subtraction doesn't give negative results
    if (operation === '-' && num2 > num1) {
      [num1, num2] = [num2, num1];
    }

    let correctAnswer: number;
    switch (operation) {
      case '+':
        correctAnswer = num1 + num2;
        break;
      case '-':
        correctAnswer = num1 - num2;
        break;
      case '*':
        correctAnswer = num1 * num2;
        break;
    }

    return { num1, num2, operation, correctAnswer };
  };

  // Generate answer options
  const generateAnswerOptions = (correct: number): number[] => {
    const options = [correct];
    while (options.length < 4) {
      const variant = correct + Math.floor(Math.random() * 20) - 10;
      if (variant > 0 && !options.includes(variant)) {
        options.push(variant);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  const handleAnswerSelect = (answer: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    if (answer === currentQuestion?.correctAnswer) {
      const points = gameState.level * 10;
      actions.addScore(points);

      // Level up every 5 correct answers
      if ((gameState.score + points) >= gameState.level * 50) {
        actions.levelUp();
      }
    } else {
      actions.loseLife();
    }

    setTimeout(() => {
      if (!gameState.isGameOver) {
        setCurrentQuestion(generateQuestion());
        setSelectedAnswer(null);
        setShowFeedback(false);
        timer.actions.reset();
        timer.actions.start();
      }
    }, 1500);
  };

  const handlePauseToggle = () => {
    if (gameState.isPaused) {
      actions.resumeGame();
      timer.actions.start();
      setShowPauseModal(false);
    } else {
      actions.pauseGame();
      timer.actions.pause();
      setShowPauseModal(true);
    }
  };

  const handleRestart = () => {
    actions.resetGame();
    timer.actions.reset();
    setCurrentQuestion(generateQuestion());
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowGameOverModal(false);
    timer.actions.start();
  };

  const handleExit = () => {
    if (onComplete) {
      onComplete(gameState.score);
    }
    onExit?.();
  };

  // Initialize game
  useEffect(() => {
    setCurrentQuestion(generateQuestion());
    timer.actions.start();
  }, []);

  // Generate answer options for current question
  const answerOptions = currentQuestion ? generateAnswerOptions(currentQuestion.correctAnswer) : [];

  return (
    <GameContainer
      title="Math Challenge"
      onExit={handleExit}
      showProgress
      progress={(gameState.score / (gameState.level * 50)) * 100}
    >
      <div className="max-w-4xl mx-auto p-6">
        {/* Game Header */}
        <div className="flex justify-between items-center mb-6">
          <ScoreBoard
            score={gameState.score}
            level={gameState.level}
            lives={gameState.lives}
            timeRemaining={timer.time}
          />
          <GameButton onClick={handlePauseToggle} variant="secondary" size="sm">
            {gameState.isPaused ? 'Resume' : 'Pause'}
          </GameButton>
        </div>

        {/* Game Content */}
        {currentQuestion && !gameState.isGameOver && (
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                {currentQuestion.num1} {currentQuestion.operation} {currentQuestion.num2} = ?
              </h2>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {answerOptions.map((option, index) => (
                  <GameButton
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={selectedAnswer !== null}
                    variant={
                      selectedAnswer === null
                        ? 'primary'
                        : option === currentQuestion.correctAnswer
                        ? 'success'
                        : option === selectedAnswer
                        ? 'danger'
                        : 'secondary'
                    }
                    size="lg"
                    className="h-16"
                  >
                    {option}
                  </GameButton>
                ))}
              </div>

              {showFeedback && (
                <div className="mt-6">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <div className="text-green-600 font-bold text-xl">
                      🎉 Correct! +{gameState.level * 10} points
                    </div>
                  ) : (
                    <div className="text-red-600 font-bold text-xl">
                      ❌ Wrong! The correct answer was {currentQuestion.correctAnswer}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pause Modal */}
        <GameModal
          isOpen={showPauseModal}
          onClose={() => {}}
          title="Game Paused"
          showCloseButton={false}
        >
          <div className="text-center">
            <p className="text-gray-600 mb-6">Take your time! Ready to continue?</p>
            <GameButton onClick={handlePauseToggle} variant="primary">
              Resume Game
            </GameButton>
          </div>
        </GameModal>

        {/* Game Over Modal */}
        <GameModal
          isOpen={showGameOverModal}
          onClose={() => {}}
          title="Game Over"
          type="info"
          showCloseButton={false}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">🎮</div>
            <p className="text-gray-600 mb-4">
              Final Score: <span className="font-bold text-purple-600">{gameState.score}</span>
            </p>
            <p className="text-gray-600 mb-6">
              You reached Level {gameState.level}!
            </p>
            <div className="flex gap-3 justify-center">
              <GameButton onClick={handleRestart} variant="primary">
                Play Again
              </GameButton>
              <GameButton onClick={handleExit} variant="secondary">
                Exit
              </GameButton>
            </div>
          </div>
        </GameModal>
      </div>
    </GameContainer>
  );
}