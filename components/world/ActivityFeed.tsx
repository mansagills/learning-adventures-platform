'use client';

import { useEffect, useRef, useState } from 'react';
import { EventBus } from '@/components/phaser/EventBus';
import { getIdentity } from '@/game/world/playerIdentity';

/**
 * ActivityFeed — ambient "other students are playing" ticker for the campus.
 *
 * Companion to the simulated students (game/world/simStudents.ts): the same
 * named kids who patrol the map show up here completing games, earning badges,
 * and leveling up. Pure front-end simulation — no networking, no backend.
 *
 * Renders a small stack of feed entries next to the minimap. New entries
 * appear every ~7-13s, each visible for ~14s, max 3 on screen.
 */

// Names match the patrolling sim students, plus a few "off-screen" kids so
// the campus feels bigger than what's visible.
const STUDENT_NAMES = [
  'Zoe', 'Marcus', 'Priya', 'Jayden', 'Ava', 'Leo', 'Mia', 'Sam',
  'Jordan', 'Emma', 'Kai', 'Nia',
];

// Real campus station games (gatherPresentation.ts GATHER_STATIONS)
const GAME_TITLES = [
  'Pizza Fractions', 'Math Race Rally', 'Multiplication Bingo',
  'Number Monsters', 'Math Jeopardy', 'Crystal Chemistry', 'Solar System',
  'Matter Mixer', 'Magnet Puzzle', 'Animal Match', 'Ocean Heroes',
  'Cafeteria Cashier',
];

const BADGES = [
  'Math Whiz', 'Science Explorer', 'Story Master', 'Quick Thinker',
  'Star Student', 'Puzzle Pro',
];

type Template = (name: string) => { icon: string; text: string };

const TEMPLATES: Template[] = [
  (n) => ({ icon: '🎮', text: `${n} finished ${pick(GAME_TITLES)}` }),
  (n) => ({ icon: '🏅', text: `${n} earned the ${pick(BADGES)} badge` }),
  (n) => ({ icon: '⭐', text: `${n} reached Level ${2 + Math.floor(Math.random() * 7)}` }),
  (n) => ({ icon: '🏆', text: `${n} set a high score in ${pick(GAME_TITLES)}` }),
  (n) => ({ icon: '🔥', text: `${n} is on a ${3 + Math.floor(Math.random() * 5)}-day streak` }),
  (n) => ({ icon: '🪙', text: `${n} bought something at the campus shop` }),
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface FeedEntry {
  id: number;
  icon: string;
  text: string;
}

const ENTRY_LIFETIME_MS = 14_000;
const MAX_VISIBLE = 3;

function nextDelay(): number {
  return 7_000 + Math.random() * 6_000; // 7-13s
}

export function ActivityFeed() {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const idRef = useRef(0);
  const lastNameRef = useRef<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const addEntry = () => {
      if (cancelled) return;
      // Avoid the same student twice in a row
      let name = pick(STUDENT_NAMES);
      if (name === lastNameRef.current) name = pick(STUDENT_NAMES);
      lastNameRef.current = name;

      const { icon, text } = pick(TEMPLATES)(name);
      const id = ++idRef.current;
      setEntries((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), { id, icon, text }]);

      // Auto-expire this entry
      setTimeout(() => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }, ENTRY_LIFETIME_MS);

      timer = setTimeout(addEntry, nextDelay());
    };

    // Quest completion: the player's own achievement headlines the feed
    const handleQuestCompleted = (data?: { questId?: string }) => {
      const id = ++idRef.current;
      // Demo identity name when chosen ("Mansa earned..."), else "YOU"
      const playerName = getIdentity().name || 'YOU';
      const entry =
        data?.questId === 'chapter-0-first-spark'
          ? { icon: '✨', text: `${playerName}'s Spark just woke up!` }
          : data?.questId === 'chapter-1-null-run'
          ? { icon: '🧊', text: `${playerName} recovered a Null Fragment!` }
          : { icon: '🏁', text: `${playerName} earned the Racing License!` };
      setEntries((prev) => [
        ...prev.slice(-(MAX_VISIBLE - 1)),
        { id, ...entry },
      ]);
      setTimeout(() => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }, ENTRY_LIFETIME_MS);
    };
    EventBus.on('quest-completed', handleQuestCompleted);

    // First entry appears quickly so the feed reads as "live" on load
    timer = setTimeout(addEntry, 2_500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      EventBus.off('quest-completed', handleQuestCompleted);
    };
  }, []);

  if (entries.length === 0) return null;

  return (
    <div
      className="absolute hidden md:flex flex-col gap-1.5 pointer-events-none"
      style={{ left: '212px', bottom: '80px' }}
      aria-live="polite"
      aria-label="Campus activity feed"
    >
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/90 animate-feed-in"
          style={{
            background: 'rgba(5,8,16,0.72)',
            border: '1px solid color-mix(in srgb, var(--hud-accent, #00ccff) 45%, transparent)',
            borderRadius: '6px',
            boxShadow: '0 0 8px color-mix(in srgb, var(--hud-accent, #00ccff) 18%, transparent)',
          }}
        >
          <span aria-hidden>{entry.icon}</span>
          <span>{entry.text}</span>
        </div>
      ))}
      <style jsx>{`
        @keyframes feed-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-feed-in {
          animation: feed-in 300ms ease-out;
        }
      `}</style>
    </div>
  );
}
