/**
 * Passed from React into Phaser on world load for position/scene restore.
 */
export interface WorldBootstrap {
  avatarId: string;
  lastScene: string;
  position: { x: number; y: number; scene?: string };
}

let pendingWorldBootstrap: WorldBootstrap | null = null;

export function setPendingWorldBootstrap(bootstrap: WorldBootstrap | null): void {
  pendingWorldBootstrap = bootstrap;
}

export function getWorldBootstrap(): WorldBootstrap | null {
  return pendingWorldBootstrap;
}

export function clearWorldBootstrap(): void {
  pendingWorldBootstrap = null;
}
