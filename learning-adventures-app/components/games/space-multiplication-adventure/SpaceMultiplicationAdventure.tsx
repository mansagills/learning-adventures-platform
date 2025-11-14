/**
 * Space Multiplication Adventure
 * Help a space explorer collect stars by solving multiplication problems
 *
 * Subject: Math
 * Grade Level: 3-5
 */

'use client';

import React, { useState, useEffect } from 'react';
import { GameContainer } from '@/components/games/shared/GameContainer';
import { GameButton } from '@/components/games/shared/GameButton';
import { ScoreBoard } from '@/components/games/shared/ScoreBoard';
import { GameModal } from '@/components/games/shared/GameModal';
import { useGameState } from '@/hooks/useGameState';
import { useGameTimer } from '@/hooks/useGameTimer';

interface Question {
  num1: number;
  num2: number;
  correctAnswer: number;
  options: number[];
}

export default function SpaceMultiplicationAdventure() {
  const { gameState, updateScore, resetGame } = useGameState({
    initialScore: 0,
    gameId: 'space-multiplication-adventure',
  });

  const { timeElapsed, startTimer, stopTimer, resetTimer } = useGameTimer();

  const [showInstructions, setShowInstructions] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);

  // Generate a random multiplication question
  const generateQuestion = (): Question => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = num1 * num2;

    // Generate 3 wrong options
    const wrongOptions: number[] = [];
    while (wrongOptions.length < 3) {
      const wrong = correctAnswer + Math.floor(Math.random() * 20) - 10;
      if (wrong > 0 && wrong !== correctAnswer && !wrongOptions.includes(wrong)) {
        wrongOptions.push(wrong);
      }
    }

    // Mix correct answer with wrong options
    const options = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);

    return { num1, num2, correctAnswer, options };
  };

  const startGame = () => {
    setShowInstructions(false);
    setIsPlaying(true);
    setScore(0);
    setStarsCollected(0);
    setStreak(0);
    setFeedback('');
    setCurrentQuestion(generateQuestion());
    startTimer();
  };

  const handleAnswer = (selectedAnswer: number) => {
    if (!currentQuestion) return;

    if (selectedAnswer === currentQuestion.correctAnswer) {
      const points = 10 + (streak * 2);
      setScore(score + points);
      setStarsCollected(starsCollected + 1);
      setStreak(streak + 1);
      setFeedback(`🎉 Correct! +${points} points! Streak: ${streak + 1}`);
      updateScore(score + points);
    } else {
      setFeedback(`❌ Oops! ${currentQuestion.num1} × ${currentQuestion.num2} = ${currentQuestion.correctAnswer}`);
      setStreak(0);
    }

    // Next question after short delay
    setTimeout(() => {
      setFeedback('');
      setCurrentQuestion(generateQuestion());
    }, 1500);
  };

  const handleReset = () => {
    resetGame();
    setShowInstructions(true);
    setIsPlaying(false);
    setScore(0);
    setStarsCollected(0);
    setStreak(0);
    setFeedback('');
    setCurrentQuestion(null);
    resetTimer();
  };

  return (
    <GameContainer
      title="Space Multiplication Adventure"
      onReset={handleReset}
      className="max-w-4xl"
    >
      {/* Instructions Modal */}
      {showInstructions && (
        <GameModal
          title="🚀 Welcome, Space Explorer!"
          onClose={() => setShowInstructions(false)}
        >
          <div className="space-y-4">
            <p className="text-lg">
              Help our space explorer collect stars by solving multiplication problems!
              Each correct answer propels the spaceship forward and earns you stars. ⭐
            </p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2">How to Play:</h3>
              <ul className="list-disc pl-5 space-y-1 text-blue-800">
                <li>Solve multiplication problems to collect stars</li>
                <li>Build a streak for bonus points!</li>
                <li>The faster you solve, the more points you earn</li>
                <li>Practice makes perfect - keep going!</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-purple-900 mb-2">Learning Objectives:</h3>
              <ul className="list-disc pl-5 space-y-1 text-purple-800">
                <li>Master multiplication tables from 1 to 10</li>
                <li>Improve mental calculation speed</li>
                <li>Build confidence in arithmetic</li>
              </ul>
            </div>

            <GameButton onClick={startGame} className="w-full">
              🚀 Start Adventure!
            </GameButton>
          </div>
        </GameModal>
      )}

      {/* Game Area */}
      <div className="space-y-6">
        {/* Score Display */}
        {isPlaying && (
          <div className="flex justify-between items-center bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600">Score</div>
              <div className="text-2xl font-bold text-purple-600">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Stars</div>
              <div className="text-2xl font-bold text-yellow-600">⭐ {starsCollected}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Streak</div>
              <div className="text-2xl font-bold text-orange-600">🔥 {streak}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Time</div>
              <div className="text-2xl font-bold text-blue-600">{timeElapsed}s</div>
            </div>
          </div>
        )}

        {/* Question Area */}
        {!isPlaying ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Space Multiplication Adventure
            </h2>
            <p className="text-gray-600 mb-6">Ready to explore the galaxy?</p>
            <GameButton onClick={startGame} size="lg">
              Start Game
            </GameButton>
          </div>
        ) : currentQuestion ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Spaceship Visual */}
            <div className="text-center mb-8">
              <div className="text-8xl animate-bounce">🚀</div>
              <div className="flex justify-center gap-2 mt-4">
                {[...Array(Math.min(starsCollected, 10))].map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                Solve this problem to collect a star:
              </h3>
              <div className="text-6xl font-bold text-purple-600 mb-2">
                {currentQuestion.num1} × {currentQuestion.num2} = ?
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`text-center text-xl font-bold mb-6 p-4 rounded-lg ${
                feedback.includes('Correct')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {feedback}
              </div>
            )}

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <GameButton
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={!!feedback}
                  className="text-2xl py-6 hover:scale-105 transition-transform"
                  variant={feedback && option === currentQuestion.correctAnswer ? 'success' : 'primary'}
                >
                  {option}
                </GameButton>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </GameContainer>
  );
}