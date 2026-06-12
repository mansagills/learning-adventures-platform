import * as Phaser from 'phaser';
// import { WorldScene } from './scenes/WorldScene'; // kept for reference
import { OpenWorldScene } from './scenes/OpenWorldScene';
import { MathBuildingScene } from './scenes/MathBuildingScene';
import { GatherCampusScene } from './scenes/GatherCampusScene';
import {
  setPendingWorldBootstrap,
  type WorldBootstrap,
} from './worldBootstrap';

/** Which world experience to boot. 'gather' is the Gather-style campus. */
export type WorldVariant = 'open' | 'gather';

/**
 * Phaser Game Configuration
 * Top-down 2D pixel art educational game world
 */
export const createPhaserGame = (
  parent: string,
  bootstrap?: WorldBootstrap | null,
  variant: WorldVariant = 'open'
): Phaser.Game => {
  setPendingWorldBootstrap(bootstrap ?? null);
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // Auto-detect: WebGL → Canvas → fail gracefully
    parent, // DOM element ID to mount game
    width: 1280, // Game viewport width
    height: 720, // Game viewport height
    backgroundColor: '#050810', // Campus void — deep space dark

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
    scene:
      variant === 'gather'
        ? [GatherCampusScene, MathBuildingScene]
        : [OpenWorldScene, MathBuildingScene],

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

  const game = new Phaser.Game(config);

  if (bootstrap?.avatarId) {
    game.registry.set('avatarId', bootstrap.avatarId);
  }

  if (variant === 'open' && bootstrap?.lastScene === 'MathBuildingScene') {
    const pos = bootstrap.position;
    game.scene.stop('WorldScene');
    game.scene.start('MathBuildingScene', {
      spawnX: pos?.x ?? 320,
      spawnY: pos?.y ?? 500,
      fromScene: 'WorldScene',
    });
  }

  return game;
};
