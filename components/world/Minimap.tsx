'use client';

import { useEffect, useRef, useState } from 'react';
import { EventBus } from '@/components/phaser/EventBus';
import { ZoneManager, type ZoneInfo } from '@/game/world/ZoneManager';

const WORLD_W = 6144;
const WORLD_H = 4608;
const MAP_W = 180;
const MAP_H = 135;

// Static zone data — computed once at module load, not per render
const ZONES = new ZoneManager().getZones();

function hexStringToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function drawZones(
  ctx: CanvasRenderingContext2D,
  zones: ZoneInfo[],
  activeZoneKey?: string,
): void {
  // Void background
  ctx.fillStyle = '#050810';
  ctx.fillRect(0, 0, MAP_W, MAP_H);

  zones.forEach((zone) => {
    const mx = (zone.pixelX / WORLD_W) * MAP_W;
    const my = (zone.pixelY / WORLD_H) * MAP_H;
    const zoneW = (zone.pixelW / WORLD_W) * MAP_W;
    const zoneH = (zone.pixelH / WORLD_H) * MAP_H;
    const { r, g, b } = hexStringToRgb(zone.neonAccent);

    const isActive = activeZoneKey && zone.key === activeZoneKey;

    // Zone fill — active at 55% opacity, inactive at 25%
    ctx.fillStyle = isActive
      ? `rgba(${r},${g},${b},0.55)`
      : `rgba(${r},${g},${b},0.25)`;
    ctx.fillRect(mx, my, zoneW, zoneH);

    // Neon border for active zone
    if (isActive) {
      ctx.strokeStyle = `rgba(${r},${g},${b},0.9)`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(mx + 0.75, my + 0.75, zoneW - 1.5, zoneH - 1.5);
    } else {
      ctx.strokeStyle = `rgba(${r},${g},${b},0.3)`;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(mx, my, zoneW, zoneH);
    }
  });
}

export default function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<ImageData | null>(null);
  const activeZoneKeyRef = useRef<string>('main-hub');
  const [zoneName, setZoneName] = useState('Main Hub');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initial background draw with Main Hub highlighted (player spawns there)
    drawZones(ctx, ZONES, activeZoneKeyRef.current);
    bgRef.current = ctx.getImageData(0, 0, MAP_W, MAP_H);

    // minimap-position: restore bg, draw player dot with neon halo
    const handlePosition = (data: { x?: number; y?: number; playerX?: number; playerY?: number }) => {
      if (!bgRef.current) return;
      ctx.putImageData(bgRef.current, 0, 0);
      const playerX = data.playerX ?? data.x ?? 0;
      const playerY = data.playerY ?? data.y ?? 0;
      const dotX = (playerX / WORLD_W) * MAP_W;
      const dotY = (playerY / WORLD_H) * MAP_H;
      // Cyan halo
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,204,255,0.3)';
      ctx.fill();
      // White dot
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dotX - 1.5, dotY - 1.5, 3, 3);
    };

    // zone-changed: redraw background with active zone highlighted, save new bg
    const handleZoneChanged = (data: { zone: ZoneInfo }) => {
      activeZoneKeyRef.current = data.zone.key;
      setZoneName(data.zone.name);

      ctx.clearRect(0, 0, MAP_W, MAP_H);
      drawZones(ctx, ZONES, data.zone.key);
      bgRef.current = ctx.getImageData(0, 0, MAP_W, MAP_H);
    };

    EventBus.on('minimap-position', handlePosition);
    EventBus.on('zone-changed', handleZoneChanged);

    return () => {
      EventBus.off('minimap-position', handlePosition);
      EventBus.off('zone-changed', handleZoneChanged);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '80px',
        left: '16px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          color: 'var(--hud-accent, #00ccff)',
          fontFamily: 'var(--font-pixel, monospace)',
          fontSize: '6px',
          textAlign: 'center',
          marginBottom: '2px',
          background: 'rgba(5,8,16,0.85)',
          border: '1px solid var(--hud-accent, #00ccff)',
          borderRadius: '2px',
          padding: '2px 6px',
          letterSpacing: '1px',
          transition: 'color 500ms ease, border-color 500ms ease',
        }}
      >
        {zoneName}
      </div>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={MAP_W}
          height={MAP_H}
          style={{
            display: 'block',
            border: '1px solid var(--hud-accent, #00ccff)',
            borderRadius: '2px',
            pointerEvents: 'none',
            transition: 'border-color 500ms ease, box-shadow 500ms ease',
            boxShadow: '0 0 10px color-mix(in srgb, var(--hud-accent, #00ccff) 40%, transparent)',
            imageRendering: 'pixelated',
          }}
        />
        {/* Scanline overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
            pointerEvents: 'none',
            borderRadius: '2px',
          }}
        />
      </div>
    </div>
  );
}
