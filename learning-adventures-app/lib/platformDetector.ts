/**
 * Platform Detection Utility
 *
 * Automatically detects which game development platform was used
 * based on file structure and signatures in uploaded zip files.
 */

export type GamePlatform =
  | 'html5-single'
  | 'unity-webgl'
  | 'construct3'
  | 'buildbox'
  | 'gdevelop'
  | 'gamemaker'
  | 'godot'
  | 'phaser'
  | 'pixijs'
  | 'playcanvas'
  | 'replit'
  | 'base44'
  | 'custom';

export interface PlatformDetectionResult {
  platform: GamePlatform;
  confidence: 'very-high' | 'high' | 'medium' | 'low';
  entryPoint: string;
  metadata: {
    estimatedSize?: number;
    version?: string;
    features?: string[];
    warnings?: string[];
  };
}

interface FileStructure {
  files: string[];
  folders: string[];
  rootFiles: string[];
}

/**
 * Detect game platform from file structure
 */
export function detectPlatform(fileStructure: FileStructure): PlatformDetectionResult {
  const { files, folders, rootFiles } = fileStructure;

  // Unity WebGL Detection
  if (hasUnitySignature(files, folders)) {
    return {
      platform: 'unity-webgl',
      confidence: 'very-high',
      entryPoint: 'index.html',
      metadata: {
        features: ['WebAssembly', '3D Graphics', 'Unity Engine'],
        warnings: ['Large file size', 'Longer load times', 'Requires WASM support']
      }
    };
  }

  // Construct 3 Detection
  if (hasConstruct3Signature(files)) {
    return {
      platform: 'construct3',
      confidence: 'very-high',
      entryPoint: 'index.html',
      metadata: {
        features: ['Service Worker', 'PWA Support', 'Responsive'],
        warnings: []
      }
    };
  }

  // BuildBox Detection
  if (hasBuildBoxSignature(files, folders)) {
    return {
      platform: 'buildbox',
      confidence: 'high',
      entryPoint: 'index.html',
      metadata: {
        features: ['Touch Optimized', 'Mobile Ready'],
        warnings: ['May require specific screen orientations']
      }
    };
  }

  // GDevelop Detection
  if (hasGDevelopSignature(files)) {
    return {
      platform: 'gdevelop',
      confidence: 'high',
      entryPoint: 'index.html',
      metadata: {
        features: ['2D Engine', 'Event-based Logic'],
        warnings: []
      }
    };
  }

  // GameMaker Detection
  if (hasGameMakerSignature(files, folders)) {
    return {
      platform: 'gamemaker',
      confidence: 'high',
      entryPoint: 'index.html',
      metadata: {
        features: ['2D Games', 'Sprite-based'],
        warnings: []
      }
    };
  }

  // Godot Detection
  if (hasGodotSignature(files)) {
    return {
      platform: 'godot',
      confidence: 'very-high',
      entryPoint: 'index.html',
      metadata: {
        features: ['WebAssembly', 'Open Source Engine'],
        warnings: ['May require WASM support', 'Check browser compatibility']
      }
    };
  }

  // Phaser Detection
  if (hasPhaserSignature(files)) {
    return {
      platform: 'phaser',
      confidence: 'high',
      entryPoint: 'index.html',
      metadata: {
        features: ['HTML5 Game Framework', 'WebGL Renderer'],
        warnings: []
      }
    };
  }

  // PixiJS Detection
  if (hasPixiJSSignature(files)) {
    return {
      platform: 'pixijs',
      confidence: 'medium',
      entryPoint: 'index.html',
      metadata: {
        features: ['2D WebGL Renderer'],
        warnings: []
      }
    };
  }

  // PlayCanvas Detection
  if (hasPlayCanvasSignature(files)) {
    return {
      platform: 'playcanvas',
      confidence: 'high',
      entryPoint: 'index.html',
      metadata: {
        features: ['WebGL Engine', '3D Graphics'],
        warnings: []
      }
    };
  }

  // Replit Detection
  if (hasReplitSignature(files)) {
    return {
      platform: 'replit',
      confidence: 'medium',
      entryPoint: findHTMLEntryPoint(rootFiles),
      metadata: {
        features: ['Simple HTML/JS'],
        warnings: []
      }
    };
  }

  // Base44 Detection
  if (hasBase44Signature(files)) {
    return {
      platform: 'base44',
      confidence: 'medium',
      entryPoint: 'index.html',
      metadata: {
        features: ['AI Generated'],
        warnings: []
      }
    };
  }

  // HTML5 Single File Detection
  if (isSingleHTMLFile(files, rootFiles)) {
    return {
      platform: 'html5-single',
      confidence: 'high',
      entryPoint: findHTMLEntryPoint(rootFiles),
      metadata: {
        features: ['Standalone', 'Simple'],
        warnings: []
      }
    };
  }

  // Default: Custom
  return {
    platform: 'custom',
    confidence: 'low',
    entryPoint: findHTMLEntryPoint(rootFiles) || 'index.html',
    metadata: {
      warnings: ['Platform could not be auto-detected', 'Manual review may be required']
    }
  };
}

/**
 * Unity WebGL Detection
 * Looks for Build folder with .unityweb files and UnityLoader.js
 */
function hasUnitySignature(files: string[], folders: string[]): boolean {
  const hasBuildFolder = folders.some(f => f.toLowerCase().includes('build'));
  const hasUnityWeb = files.some(f => f.endsWith('.unityweb'));
  const hasUnityLoader = files.some(f => f.toLowerCase().includes('unityloader') && f.endsWith('.js'));
  const hasWASM = files.some(f => f.endsWith('.wasm') || f.endsWith('.wasm.unityweb'));

  return hasBuildFolder && (hasUnityWeb || hasUnityLoader || hasWASM);
}

/**
 * Construct 3 Detection
 * Looks for c3runtime.js and service worker
 */
function hasConstruct3Signature(files: string[]): boolean {
  const hasC3Runtime = files.some(f => f.toLowerCase().includes('c3runtime'));
  const hasServiceWorker = files.some(f => f === 'sw.js' || f === 'offline.js');
  const hasScriptsFolder = files.some(f => f.startsWith('scripts/'));

  return hasC3Runtime || (hasServiceWorker && hasScriptsFolder);
}

/**
 * BuildBox Detection
 * Looks for BuildBox-specific file structure
 */
function hasBuildBoxSignature(files: string[], folders: string[]): boolean {
  const hasJSFolder = folders.some(f => f === 'js' || f === 'js/');
  const hasGameJS = files.some(f => f.includes('js/game.js'));
  const hasLibsFolder = folders.some(f => f.includes('js/libs'));
  const hasBuildBoxLib = files.some(f => f.toLowerCase().includes('buildbox'));

  return (hasJSFolder && hasGameJS && hasLibsFolder) || hasBuildBoxLib;
}

/**
 * GDevelop Detection
 * Looks for gdjs.js and GDevelop engine files
 */
function hasGDevelopSignature(files: string[]): boolean {
  const hasGDJS = files.some(f => f.toLowerCase().includes('gdjs') && f.endsWith('.js'));
  const hasGD = files.some(f => f === 'gd.js');
  const hasLibsFolder = files.some(f => f.startsWith('libs/'));
  const hasCode0 = files.some(f => f.includes('code0.js'));

  return hasGDJS || hasGD || (hasLibsFolder && hasCode0);
}

/**
 * GameMaker Detection
 * Looks for html5game folder and GameMaker structure
 */
function hasGameMakerSignature(files: string[], folders: string[]): boolean {
  const hasHTML5GameFolder = folders.some(f => f.toLowerCase().includes('html5game'));
  const hasGameJS = files.some(f => f.includes('html5game/') && f.endsWith('.js'));

  return hasHTML5GameFolder && hasGameJS;
}

/**
 * Godot Detection
 * Looks for .wasm, .pck files (Godot exports)
 */
function hasGodotSignature(files: string[]): boolean {
  const hasWASM = files.some(f => f.endsWith('.wasm'));
  const hasPCK = files.some(f => f.endsWith('.pck'));
  const hasGodotJS = files.some(f => f.endsWith('.js') && files.some(fw => fw.endsWith('.wasm')));

  return (hasWASM && hasPCK) || (hasWASM && hasGodotJS);
}

/**
 * Phaser Detection
 * Looks for phaser.js or phaser.min.js
 */
function hasPhaserSignature(files: string[]): boolean {
  return files.some(f =>
    f.toLowerCase().includes('phaser') && f.endsWith('.js')
  );
}

/**
 * PixiJS Detection
 * Looks for pixi.js or pixi.min.js
 */
function hasPixiJSSignature(files: string[]): boolean {
  return files.some(f =>
    f.toLowerCase().includes('pixi') && f.endsWith('.js')
  );
}

/**
 * PlayCanvas Detection
 * Looks for playcanvas-stable.min.js or playcanvas engine files
 */
function hasPlayCanvasSignature(files: string[]): boolean {
  return files.some(f =>
    f.toLowerCase().includes('playcanvas') && f.endsWith('.js')
  );
}

/**
 * Replit Detection
 * Looks for .replit config or replit-specific structure
 */
function hasReplitSignature(files: string[]): boolean {
  const hasReplitConfig = files.some(f => f === '.replit' || f === 'replit.nix');
  const hasSimpleStructure = files.length < 10 && files.some(f => f.endsWith('.html'));

  return hasReplitConfig || hasSimpleStructure;
}

/**
 * Base44 Detection
 * Looks for Base44-specific markers or comments
 */
function hasBase44Signature(files: string[]): boolean {
  // This would need to check file contents for Base44 markers
  // For now, just check for typical AI-generated structure
  const hasAIComment = false; // Would need file content analysis
  const hasTypicalStructure = files.length <= 5 &&
    files.some(f => f === 'index.html') &&
    files.some(f => f === 'style.css' || f === 'script.js');

  return hasTypicalStructure;
}

/**
 * Single HTML File Detection
 */
function isSingleHTMLFile(files: string[], rootFiles: string[]): boolean {
  // Only one HTML file in root, and minimal other files
  const htmlFiles = rootFiles.filter(f => f.endsWith('.html'));
  return htmlFiles.length === 1 && files.length <= 3;
}

/**
 * Find the main HTML entry point
 */
function findHTMLEntryPoint(rootFiles: string[]): string {
  // Prioritize index.html
  if (rootFiles.includes('index.html')) return 'index.html';
  if (rootFiles.includes('game.html')) return 'game.html';
  if (rootFiles.includes('main.html')) return 'main.html';

  // Otherwise, return first HTML file
  const htmlFile = rootFiles.find(f => f.endsWith('.html'));
  return htmlFile || 'index.html';
}

/**
 * Get platform display name
 */
export function getPlatformDisplayName(platform: GamePlatform): string {
  const names: Record<GamePlatform, string> = {
    'html5-single': 'HTML5 Single File',
    'unity-webgl': 'Unity WebGL',
    'construct3': 'Construct 3',
    'buildbox': 'BuildBox',
    'gdevelop': 'GDevelop',
    'gamemaker': 'GameMaker Studio',
    'godot': 'Godot Engine',
    'phaser': 'Phaser',
    'pixijs': 'PixiJS',
    'playcanvas': 'PlayCanvas',
    'replit': 'Replit',
    'base44': 'Base44',
    'custom': 'Custom/Unknown'
  };

  return names[platform];
}

/**
 * Get platform-specific instructions
 */
export function getPlatformInstructions(platform: GamePlatform): string {
  const instructions: Record<GamePlatform, string> = {
    'unity-webgl': 'Unity WebGL build detected. Ensure Build folder and all .unityweb files are included.',
    'construct3': 'Construct 3 export detected. Service worker and offline support available.',
    'buildbox': 'BuildBox export detected. Verify responsive scaling and touch controls.',
    'gdevelop': 'GDevelop export detected. Check that all assets are embedded.',
    'gamemaker': 'GameMaker Studio export detected. Verify html5game folder structure.',
    'godot': 'Godot Engine export detected. WebAssembly build recommended for best performance.',
    'phaser': 'Phaser game detected. Verify all assets and scene files are included.',
    'pixijs': 'PixiJS game detected. Check that all sprites and textures are bundled.',
    'playcanvas': 'PlayCanvas export detected. Verify all assets are packaged.',
    'replit': 'Replit project detected. Simple HTML structure identified.',
    'base44': 'Base44 export detected. AI-generated game structure.',
    'html5-single': 'Single HTML file detected. All code should be embedded.',
    'custom': 'Platform could not be auto-detected. Please verify file structure manually.'
  };

  return instructions[platform];
}

/**
 * Get recommended max file size for platform
 */
export function getRecommendedMaxSize(platform: GamePlatform): number {
  const sizes: Record<GamePlatform, number> = {
    'html5-single': 2 * 1024 * 1024,        // 2 MB
    'replit': 5 * 1024 * 1024,               // 5 MB
    'base44': 5 * 1024 * 1024,               // 5 MB
    'construct3': 20 * 1024 * 1024,          // 20 MB
    'phaser': 10 * 1024 * 1024,              // 10 MB
    'pixijs': 10 * 1024 * 1024,              // 10 MB
    'gdevelop': 15 * 1024 * 1024,            // 15 MB
    'buildbox': 50 * 1024 * 1024,            // 50 MB
    'gamemaker': 20 * 1024 * 1024,           // 20 MB
    'godot': 30 * 1024 * 1024,               // 30 MB
    'playcanvas': 30 * 1024 * 1024,          // 30 MB
    'unity-webgl': 100 * 1024 * 1024,        // 100 MB
    'custom': 50 * 1024 * 1024               // 50 MB
  };

  return sizes[platform];
}

/**
 * Validate platform export
 */
export function validatePlatformExport(
  platform: GamePlatform,
  fileStructure: FileStructure
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { files, rootFiles } = fileStructure;

  // Check for index.html
  if (!rootFiles.includes('index.html') && !rootFiles.some(f => f.endsWith('.html'))) {
    errors.push('No HTML entry point found (index.html or other .html file)');
  }

  // Platform-specific validation
  if (platform === 'unity-webgl') {
    if (!files.some(f => f.includes('Build/'))) {
      errors.push('Unity Build folder not found');
    }
    if (!files.some(f => f.endsWith('.unityweb') || f.endsWith('.wasm'))) {
      errors.push('Unity game files (.unityweb or .wasm) not found');
    }
  }

  if (platform === 'construct3') {
    if (!files.some(f => f.includes('c3runtime'))) {
      warnings.push('Construct 3 runtime not detected - game may not work correctly');
    }
  }

  if (platform === 'buildbox') {
    if (!files.some(f => f.includes('js/game.js'))) {
      warnings.push('BuildBox game.js not found in expected location');
    }
  }

  // Check for external dependencies
  const hasExternalDependencies = files.some(f => {
    const content = f.toLowerCase();
    return content.includes('http://') || content.includes('https://');
  });

  if (hasExternalDependencies) {
    warnings.push('External dependencies detected - ensure all assets are included or accessible');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
