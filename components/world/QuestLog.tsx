'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, Lock, Circle, Star } from 'lucide-react';

type QuestStatus = 'completed' | 'active' | 'available' | 'locked';

interface Objective {
  id: string;
  label: string;
  gameId?: string;
}

interface Quest {
  id: string;
  questId: string;
  title: string;
  description: string;
  subject: string;
  buildingId: string;
  xpReward: number;
  coinReward: number;
  objectives: Objective[];
  prerequisites: string[];
  order: number;
  status: QuestStatus;
}

interface QuestLogProps {
  onClose: () => void;
}

const SUBJECT_ICONS: Record<string, string> = {
  MATH: '📐',
  SCIENCE: '🔬',
  BUSINESS: '💼',
  ENGLISH: '📚',
};

const SUBJECT_COLORS: Record<string, string> = {
  MATH: 'bg-blue-500/20 border-blue-400/40 text-blue-300',
  SCIENCE: 'bg-green-500/20 border-green-400/40 text-green-300',
  BUSINESS: 'bg-amber-500/20 border-amber-400/40 text-amber-300',
  ENGLISH: 'bg-purple-500/20 border-purple-400/40 text-purple-300',
};

const STATUS_TABS = ['active', 'available', 'completed', 'locked'] as const;

function StatusBadge({ status }: { status: QuestStatus }) {
  const styles: Record<QuestStatus, string> = {
    active: 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30',
    available: 'bg-teal-400/20 text-teal-300 border border-teal-400/30',
    completed: 'bg-green-400/20 text-green-300 border border-green-400/30',
    locked: 'bg-gray-400/20 text-gray-400 border border-gray-400/30',
  };
  const labels: Record<QuestStatus, string> = {
    active: 'In Progress',
    available: 'Available',
    completed: 'Completed',
    locked: 'Locked',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function QuestCard({ quest }: { quest: Quest }) {
  const [expanded, setExpanded] = useState(quest.status === 'active');
  const subjectColor = SUBJECT_COLORS[quest.subject] ?? SUBJECT_COLORS.MATH;
  const icon = SUBJECT_ICONS[quest.subject] ?? '⭐';
  const isLocked = quest.status === 'locked';

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${subjectColor} ${isLocked ? 'opacity-60' : 'cursor-pointer hover:brightness-110'}`}
      onClick={() => !isLocked && setExpanded((v) => !v)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <p className="font-bold text-white truncate">{quest.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={quest.status} />
              {isLocked && <Lock size={12} className="text-gray-400" />}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 text-sm font-semibold">
          <span className="flex items-center gap-1 text-yellow-300">
            <Star size={13} /> {quest.xpReward}
          </span>
          <span className="flex items-center gap-1 text-yellow-200">
            🪙 {quest.coinReward}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-white/80 leading-relaxed">{quest.description}</p>
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-white/60 uppercase tracking-wide">Objectives</p>
            {quest.objectives.map((obj) => (
              <div key={obj.id} className="flex items-center gap-2 text-sm">
                {quest.status === 'completed' ? (
                  <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                ) : (
                  <Circle size={14} className="text-white/40 flex-shrink-0" />
                )}
                <span className={quest.status === 'completed' ? 'line-through text-white/40' : 'text-white/90'}>
                  {obj.label}
                </span>
              </div>
            ))}
          </div>
          {quest.prerequisites.length > 0 && quest.status === 'locked' && (
            <p className="text-xs text-gray-400 italic">
              Complete prerequisites first: {quest.prerequisites.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function QuestLog({ onClose }: QuestLogProps) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeTab, setActiveTab] = useState<QuestStatus>('available');

  const fetchQuests = useCallback(async () => {
    try {
      const res = await fetch('/api/quests/active');
      const data = await res.json();
      if (res.ok) {
        setQuests(data.quests ?? []);
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  // ESC to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const tabQuests = quests.filter((q) => q.status === activeTab);

  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab] = quests.filter((q) => q.status === tab).length;
    return acc;
  }, {} as Record<QuestStatus, number>);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-[#1A1A2E] rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-extrabold text-xl">📋 Quest Log</h2>
            <p className="text-white/50 text-xs mt-0.5">
              {counts.active} active · {counts.completed} completed
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-bold capitalize transition-colors relative ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab === 'active' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {counts[tab] > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'
                }`}>
                  {counts[tab]}
                </span>
              )}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5CF6] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Quest list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]" />
            </div>
          ) : fetchError ? (
            <div className="text-center py-12 text-white/40">
              <p className="text-4xl mb-3">⚠️</p>
              <p className="text-sm">Couldn't load quests. Try closing and reopening.</p>
            </div>
          ) : tabQuests.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <p className="text-4xl mb-3">
                {activeTab === 'completed' ? '🏆' : activeTab === 'locked' ? '🔒' : '🗺️'}
              </p>
              <p className="text-sm">
                {activeTab === 'active' && 'No quests in progress. Check Available quests!'}
                {activeTab === 'available' && 'No quests available right now.'}
                {activeTab === 'completed' && 'No quests completed yet. Get started!'}
                {activeTab === 'locked' && 'No locked quests.'}
              </p>
            </div>
          ) : (
            tabQuests.map((quest) => <QuestCard key={quest.questId} quest={quest} />)
          )}
        </div>
      </div>
    </div>
  );
}
