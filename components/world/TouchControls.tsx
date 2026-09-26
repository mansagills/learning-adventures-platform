'use client';

import { useCallback, useRef } from 'react';
import { EventBus } from '@/components/phaser/EventBus';

const STICK_RADIUS = 48;
const DEAD_ZONE = 0.15;

interface TouchControlsProps {
  disabled?: boolean;
  /** Screen corner for the stick. 'left' (default) collides with the
   *  Minimap on small screens — pages that mount both should use 'right'. */
  side?: 'left' | 'right';
  /** Distance from the container bottom in px (default 24). Pages whose
   *  h-screen container starts below the site header overflow the visible
   *  viewport by the header height — raise the stick so it isn't clipped. */
  bottomOffset?: number;
}

export function TouchControls({ disabled, side = 'left', bottomOffset = 24 }: TouchControlsProps) {
  const stickRef = useRef<HTMLDivElement>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const activeRef = useRef(false);

  const emitVector = useCallback((dx: number, dy: number) => {
    EventBus.emit('touch-move', { x: dx, y: dy });
  }, []);

  const resetStick = useCallback(() => {
    activeRef.current = false;
    if (stickRef.current) {
      stickRef.current.style.transform = 'translate(-50%, -50%)';
    }
    emitVector(0, 0);
  }, [emitVector]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    originRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    activeRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateStick(e.clientX, e.clientY);
  };

  const updateStick = (clientX: number, clientY: number) => {
    const { x: ox, y: oy } = originRef.current;
    let dx = (clientX - ox) / STICK_RADIUS;
    let dy = (clientY - oy) / STICK_RADIUS;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    if (stickRef.current) {
      const clampedLen = Math.min(len, 1);
      stickRef.current.style.transform = `translate(calc(-50% + ${dx * STICK_RADIUS * clampedLen}px), calc(-50% + ${dy * STICK_RADIUS * clampedLen}px))`;
    }
    if (len < DEAD_ZONE) {
      emitVector(0, 0);
    } else {
      emitVector(dx, dy);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeRef.current || disabled) return;
    updateStick(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    resetStick();
  };

  return (
    <div
      className={`absolute ${side === 'right' ? 'right-6' : 'left-6'} z-20 pointer-events-auto md:hidden touch-none select-none`}
      style={{ bottom: `${bottomOffset}px` }}
      aria-label="Movement joystick"
    >
      <div
        className="relative w-28 h-28 rounded-full bg-black/40 border-2 border-white/30"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={stickRef}
          className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full bg-[#8B5CF6] border-2 border-white shadow-lg"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </div>
  );
}
