import Phaser from 'phaser';
import { WorldScene } from './scenes/WorldScene';
import { MathBuildingScene } from './scenes/MathBuildingScene';

/**
 * Phaser Game Configuration
 * Top-down 2D pixel art educational game world
 */
export const createPhaserGame = (parent: string): Phaser.Game => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // Auto-detect: WebGL → Canvas → fail gracefully
    parent, // DOM element ID to mount game
    width: 1280, // Game viewport width
    height: 720, // Game viewport height
    backgroundColor: '#FFFDF5', // Warm cream background (matches platform design)

    // Pixel art settings
    render: {
      pixelArt: true, // Disable anti-aliasing for crisp pixel art
      antialias: false,
      antialiasGL: false,
      roundPixels: true, // Round pixel positions for sharper rendering
    },

    // Top-down physics configuration
    physics: {
      default: 'arcade', // Simple 2D physics (no gravity needed for top-down)
      arcade: {
        gravity: { x: 0, y: 0 }, // No gravity for top-down perspective
        debug: process.env.NODE_ENV === 'development', // Show collision boxes in dev
      },
    },

    // Scene configuration
    scene: [WorldScene, MathBuildingScene], // Multiple scenes for different areas

    // Scaling configuration for responsive design
    scale: {
      mode: Phaser.Scale.FIT, // Fit game to container while maintaining aspect ratio
      autoCenter: Phaser.Scale.CENTER_BOTH, // Center horizontally and vertically
      width: 1280,
      height: 720,
    },

    // Input configuration
    input: {
      keyboard: true, // Enable keyboard input (WASD/arrows)
      mouse: true, // Enable mouse/touch input
      touch: true, // Enable touch input for mobile
    },

    // Audio configuration
    audio: {
      disableWebAudio: false, // Use Web Audio API when available
    },
  };

  return new Phaser.Game(config);
};
