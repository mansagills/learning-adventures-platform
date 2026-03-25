'use client';

import { useEffect, useRef, useState } from 'react';
import { EventBus } from '@/components/phaser/EventBus';
import { ZoneManager, type ZoneInfo } from '@/game/world/ZoneManager';

const WORLD_W = 6144;
const WORLD_H = 4608;
const MAP_W = 180;
const MAP_H = 135;
const CELL_W = MAP_W / 3; // 60
const CELL_H = MAP_H / 3; // 45

function hexToRgb(hex: number): { r: number; g: number; b: number } {
  return {
    r: (hex >> 16) & 0xff,
    g: (hex >> 8) & 0xff,
    b: hex & 0xff,
  };
}

function drawZones(
  ctx: CanvasRenderingContext2D,
  zones: ZoneInfo[],
  activeZoneKey?: string,
): void {
  zones.forEach((zone) => {
    const mx = (zone.pixelX / WORLD_W) * MAP_W;
    const my = (zone.pixelY / WORLD_H) * MAP_H;
    const { r, g, b } = hexToRgb(zone.color);

    // Fill zone rectangle
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(mx, my, CELL_W, CELL_H);

    // Draw white border for active zone
    if (activeZoneKey && zone.key === activeZoneKey) {
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2;
      ctx.strokeRect(mx + 1, my + 1, CELL_W - 2, CELL_H - 2);
    } else {
      // Subtle separator lines for all zones
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(mx, my, CELL_W, CELL_H);
    }
  });
}

export default function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<ImageData | null>(null);
  const activeZoneKeyRef = useRef<string>('town-square');
  const [zoneName, setZoneName] = useState('Town Square');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get zones once on mount
    const zm = new ZoneManager();
    const zones = zm.getZones();

    // Initial background draw — no active zone highlight on first render
    drawZones(ctx, zones, activeZoneKeyRef.current);
    bgRef.current = ctx.getImageData(0, 0, MAP_W, MAP_H);

    // minimap-position: restore bg, draw player dot
    const handlePosition = (data: { playerX: number; playerY: number }) => {
      if (!bgRef.current) return;
      ctx.putImageData(bgRef.current, 0, 0);
      const dotX = (data.playerX / WORLD_W) * MAP_W;
      const dotY = (data.playerY / WORLD_H) * MAP_H;
      ctx.fillStyle = 'white';
      ctx.fillRect(dotX - 2, dotY - 2, 4, 4);
    };

    // zone-changed: redraw background with active zone highlighted, save new bg
    const handleZoneChanged = (data: { zone: ZoneInfo }) => {
      activeZoneKeyRef.current = data.zone.key;
      setZoneName(data.zone.name);

      ctx.clearRect(0, 0, MAP_W, MAP_H);
      drawZones(ctx, zones, data.zone.key);
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
          color: 'white',
          fontSize: '10px',
          textAlign: 'center',
          marginBottom: '2px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '3px',
          padding: '1px 4px',
        }}
      >
        {zoneName}
      </div>
      <canvas
        ref={canvasRef}
        width={MAP_W}
        height={MAP_H}
        style={{
          display: 'block',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '4px',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
