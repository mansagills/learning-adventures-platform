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

// Organism types in the ecosystem
interface Organism {
  id: string;
  name: string;
  role: 'producer' | 'consumer' | 'decomposer';
  emoji: string;
  energy: number;
  population: number;
  description: string;
}

// Available organisms to add
const AVAILABLE_ORGANISMS: Omit<Organism, 'id' | 'energy' | 'population'>[] = [
  {
    name: 'Grass',
    role: 'producer',
    emoji: '🌱',
    description: 'Makes food from sunlight',
  },
  {
    name: 'Tree',
    role: 'producer',
    emoji: '🌳',
    description: 'Provides oxygen and food',
  },
  {
    name: 'Rabbit',
    role: 'consumer',
    emoji: '🐰',
    description: 'Eats plants',
  },
  {
    name: 'Deer',
    role: 'consumer',
    emoji: '🦌',
    description: 'Herbivore, eats grass',
  },
  {
    name: 'Fox',
    role: 'consumer',
    emoji: '🦊',
    description: 'Carnivore, eats rabbits',
  },
  {
    name: 'Mushroom',
    role: 'decomposer',
    emoji: '🍄',
    description: 'Breaks down dead matter',
  },
  {
    name: 'Worm',
    role: 'decomposer',
    emoji: '🪱',
    description: 'Enriches the soil',
  },
];

export default function EcosystemBuilder({ onExit, onComplete }: GameProps) {
  // Initialize game state
  const { gameState, actions } = useGameState({
    initialScore: 0,
    initialLevel: 1,
    onLevelUp: (level) => {
      actions.addAchievement(`Reached Level ${level}`);
      if (level === 3) actions.addAchievement('Ecosystem Expert');
      if (level === 5) actions.addAchievement('Master Ecologist');
    },
  });

  // Initialize timer (no countdown, just tracking time)
  const timer = useGameTimer({
    initialTime: 0,
    countDown: false,
    autoStart: true,
  });

  // Ecosystem state
  const [ecosystem, setEcosystem] = useState<Organism[]>([]);
  const [balance, setBalance] = useState(50); // 0-100, 50 is perfect balance
  const [selectedOrganism, setSelectedOrganism] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [tickCount, setTickCount] = useState(0);

  // Calculate ecosystem balance
  const calculateBalance = () => {
    if (ecosystem.length === 0) return 50;

    const producers = ecosystem.filter(o => o.role === 'producer').length;
    const consumers = ecosystem.filter(o => o.role === 'consumer').length;
    const decomposers = ecosystem.filter(o => o.role === 'decomposer').length;

    // Ideal ratio: Many producers, fewer consumers, some decomposers
    // Target: 40% producers, 40% consumers, 20% decomposers
    const total = producers + consumers + decomposers;
    if (total === 0) return 50;

    const producerRatio = producers / total;
    const consumerRatio = consumers / total;
    const decomposerRatio = decomposers / total;

    // Calculate how close to ideal (40-40-20)
    const producerScore = 100 - Math.abs(producerRatio - 0.4) * 250;
    const consumerScore = 100 - Math.abs(consumerRatio - 0.4) * 250;
    const decomposerScore = 100 - Math.abs(decomposerRatio - 0.2) * 250;

    const avgScore = (producerScore + consumerScore + decomposerScore) / 3;

    // Must have at least one of each type
    if (producers === 0 || consumers === 0 || decomposers === 0) {
      return Math.min(avgScore, 40);
    }

    return Math.max(0, Math.min(100, avgScore));
  };

  // Update ecosystem simulation
  useEffect(() => {
    if (ecosystem.length === 0) return;

    const interval = setInterval(() => {
      setTickCount(prev => prev + 1);

      setEcosystem(prev => {
        return prev.map(organism => {
          let newEnergy = organism.energy;
          let newPopulation = organism.population;

          // Producers gain energy from the sun
          if (organism.role === 'producer') {
            newEnergy = Math.min(100, newEnergy + 5);
            if (newEnergy > 80) {
              newPopulation = Math.min(10, newPopulation + 1);
              newEnergy = 50;
            }
          }

          // Consumers need energy from food
          if (organism.role === 'consumer') {
            newEnergy = Math.max(0, newEnergy - 3);
            if (newEnergy < 20 && newPopulation > 0) {
              newPopulation = Math.max(0, newPopulation - 1);
              newEnergy = 50;
            }
          }

          // Decomposers maintain steady state
          if (organism.role === 'decomposer') {
            newEnergy = Math.min(100, newEnergy + 2);
          }

          return {
            ...organism,
            energy: newEnergy,
            population: newPopulation,
          };
        });
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [ecosystem]);

  // Update balance when ecosystem changes
  useEffect(() => {
    const newBalance = calculateBalance();
    setBalance(newBalance);

    // Provide feedback based on balance
    if (newBalance >= 80) {
      setFeedback('🌟 Excellent! Your ecosystem is thriving!');
      if (ecosystem.length >= 5) {
        const points = gameState.level * 10;
        actions.addScore(points);
      }
    } else if (newBalance >= 60) {
      setFeedback('👍 Good balance! Keep it up!');
    } else if (newBalance >= 40) {
      setFeedback('⚠️ Balance is off. Add more organisms!');
    } else {
      setFeedback('❌ Ecosystem is struggling! Adjust the balance!');
    }

    // Level up conditions
    if (newBalance >= 80 && ecosystem.length >= 5 && gameState.level === 1) {
      actions.levelUp();
    } else if (newBalance >= 85 && ecosystem.length >= 7 && gameState.level === 2) {
      actions.levelUp();
    } else if (newBalance >= 90 && ecosystem.length >= 10 && gameState.level === 3) {
      actions.levelUp();
      setShowVictoryModal(true);
    }
  }, [ecosystem, tickCount]);

  // Add organism to ecosystem
  const addOrganism = (organism: Omit<Organism, 'id' | 'energy' | 'population'>) => {
    const newOrganism: Organism = {
      ...organism,
      id: `${organism.name}-${Date.now()}`,
      energy: 50,
      population: 1,
    };

    setEcosystem(prev => [...prev, newOrganism]);
    setShowAddModal(false);
    actions.addScore(5);
  };

  // Remove organism from ecosystem
  const removeOrganism = (id: string) => {
    setEcosystem(prev => prev.filter(o => o.id !== id));
    setSelectedOrganism(null);
  };

  // Reset ecosystem
  const handleReset = () => {
    setEcosystem([]);
    setBalance(50);
    setFeedback('');
    setSelectedOrganism(null);
    actions.resetGame();
    timer.actions.reset();
    timer.actions.start();
  };

  // Exit game
  const handleExit = () => {
    if (onComplete) {
      onComplete(gameState.score);
    }
    onExit?.();
  };

  // Get balance color
  const getBalanceColor = () => {
    if (balance >= 80) return 'text-green-600';
    if (balance >= 60) return 'text-yellow-600';
    if (balance >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get balance status
  const getBalanceStatus = () => {
    if (balance >= 80) return 'Thriving';
    if (balance >= 60) return 'Stable';
    if (balance >= 40) return 'Unstable';
    return 'Collapsing';
  };

  return (
    <GameContainer
      title="🌍 Ecosystem Builder"
      onExit={handleExit}
      showProgress
      progress={balance}
    >
      <div className="max-w-6xl mx-auto p-6">
        {/* Tutorial Modal */}
        <GameModal
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          title="Welcome to Ecosystem Builder!"
          type="info"
        >
          <div className="space-y-4 text-left">
            <p className="text-gray-700">
              Build a balanced ecosystem by adding organisms!
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌱</span>
                <p><strong>Producers:</strong> Make food from sunlight</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐰</span>
                <p><strong>Consumers:</strong> Eat other organisms</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍄</span>
                <p><strong>Decomposers:</strong> Break down dead matter</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              💡 Tip: A healthy ecosystem needs all three types in the right balance!
            </p>
            <GameButton onClick={() => setShowTutorial(false)} variant="primary">
              Let's Build!
            </GameButton>
          </div>
        </GameModal>

        {/* Victory Modal */}
        <GameModal
          isOpen={showVictoryModal}
          onClose={() => {}}
          title="🎉 Ecosystem Master!"
          type="success"
          showCloseButton={false}
        >
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-700">
              Congratulations! You've created a thriving ecosystem!
            </p>
            <div className="text-4xl mb-4">🌍✨</div>
            <div className="space-y-2 text-left bg-green-50 p-4 rounded">
              <p><strong>Final Score:</strong> {gameState.score}</p>
              <p><strong>Level Reached:</strong> {gameState.level}</p>
              <p><strong>Time:</strong> {timer.formattedTime}</p>
              <p><strong>Organisms:</strong> {ecosystem.length}</p>
            </div>
            {gameState.achievements.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Achievements:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {gameState.achievements.map((achievement, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                    >
                      🏆 {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-center pt-4">
              <GameButton onClick={handleReset} variant="primary">
                Build New Ecosystem
              </GameButton>
              <GameButton onClick={handleExit} variant="secondary">
                Exit
              </GameButton>
            </div>
          </div>
        </GameModal>

        {/* Add Organism Modal */}
        <GameModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Organism"
          type="info"
        >
          <div className="grid grid-cols-1 gap-3">
            {AVAILABLE_ORGANISMS.map((organism, index) => (
              <button
                key={index}
                onClick={() => addOrganism(organism)}
                className="flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <span className="text-4xl">{organism.emoji}</span>
                <div className="flex-1">
                  <div className="font-bold text-lg">{organism.name}</div>
                  <div className="text-sm text-gray-600">{organism.description}</div>
                  <div className="text-xs mt-1">
                    <span className={`px-2 py-1 rounded ${
                      organism.role === 'producer' ? 'bg-green-100 text-green-800' :
                      organism.role === 'consumer' ? 'bg-orange-100 text-orange-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {organism.role}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </GameModal>

        {/* Score Board */}
        <div className="mb-6">
          <ScoreBoard
            score={gameState.score}
            level={gameState.level}
            badges={gameState.achievements}
          />
        </div>

        {/* Balance Indicator */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Ecosystem Balance</h2>
            <span className={`text-2xl font-bold ${getBalanceColor()}`}>
              {Math.round(balance)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 mb-2">
            <div
              className={`h-6 rounded-full transition-all duration-500 ${
                balance >= 80 ? 'bg-green-500' :
                balance >= 60 ? 'bg-yellow-500' :
                balance >= 40 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${balance}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Status: {getBalanceStatus()}</span>
            <span className="text-gray-600">Time: {timer.formattedTime}</span>
          </div>
          {feedback && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-center font-semibold">
              {feedback}
            </div>
          )}
        </div>

        {/* Ecosystem Display */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Ecosystem</h2>
            <GameButton
              onClick={() => setShowAddModal(true)}
              variant="success"
              size="sm"
            >
              ➕ Add Organism
            </GameButton>
          </div>

          {ecosystem.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🌍</div>
              <p className="text-lg">Your ecosystem is empty!</p>
              <p className="text-sm">Click "Add Organism" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ecosystem.map(organism => (
                <div
                  key={organism.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedOrganism === organism.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOrganism(organism.id)}
                >
                  <div className="text-4xl text-center mb-2">{organism.emoji}</div>
                  <div className="text-center">
                    <div className="font-bold text-sm">{organism.name}</div>
                    <div className="text-xs text-gray-600 mb-2">
                      Pop: {organism.population}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          organism.energy > 60 ? 'bg-green-500' :
                          organism.energy > 30 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${organism.energy}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Energy: {Math.round(organism.energy)}%
                    </div>
                  </div>
                  {selectedOrganism === organism.id && (
                    <GameButton
                      onClick={() => {
                        removeOrganism(organism.id);
                      }}
                      variant="danger"
                      size="sm"
                      className="w-full mt-2"
                    >
                      Remove
                    </GameButton>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Organism Counts */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-3">Organism Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-3xl mb-1">🌱</div>
              <div className="text-sm text-gray-600">Producers</div>
              <div className="text-2xl font-bold text-green-700">
                {ecosystem.filter(o => o.role === 'producer').length}
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-3xl mb-1">🐰</div>
              <div className="text-sm text-gray-600">Consumers</div>
              <div className="text-2xl font-bold text-orange-700">
                {ecosystem.filter(o => o.role === 'consumer').length}
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-1">🍄</div>
              <div className="text-sm text-gray-600">Decomposers</div>
              <div className="text-2xl font-bold text-purple-700">
                {ecosystem.filter(o => o.role === 'decomposer').length}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mt-6">
          <GameButton onClick={handleReset} variant="warning">
            🔄 Reset Ecosystem
          </GameButton>
          <GameButton onClick={() => setShowTutorial(true)} variant="secondary">
            ℹ️ Tutorial
          </GameButton>
        </div>
      </div>
    </GameContainer>
  );
}
