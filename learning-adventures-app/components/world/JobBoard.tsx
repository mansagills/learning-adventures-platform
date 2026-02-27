'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Briefcase, Clock, Lock, CheckCircle } from 'lucide-react';

interface Job {
  jobId: string;
  title: string;
  description: string;
  type: 'MINI_GAME' | 'QUIZ' | 'CHALLENGE';
  iconEmoji: string;
  currencyReward: number;
  xpReward: number;
  cooldownHours: number;
  minLevel: number;
  gamePath: string | null;
  available: boolean;
  onCooldown: boolean;
  cooldownEndsAt: string | null;
  meetsLevel: boolean;
  dailyLimitReached: boolean;
}

interface JobBoardProps {
  onClose: () => void;
  onStartJob: (job: Job) => void;
  onJobComplete: (currencyEarned: number, xpEarned: number, newLevel: number, leveledUp: boolean) => void;
}

export function JobBoard({ onClose, onStartJob, onJobComplete }: JobBoardProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(5);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs/available');
      const data = await res.json();
      if (res.ok) {
        setJobs(data.jobs ?? []);
        setCompletedToday(data.completedToday ?? 0);
        setDailyLimit(data.dailyLimit ?? 5);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ESC to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleTakeJob = (job: Job) => {
    if (!job.available) return;
    onStartJob(job);
    onClose();
  };

  const formatCooldown = (endsAt: string): string => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Ready soon';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const availableCount = jobs.filter((j) => j.available).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-[90vw] max-w-2xl max-h-[85vh] flex flex-col bg-[#1a1a2e] rounded-2xl shadow-2xl overflow-hidden border border-[#F59E0B]/40">

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
        >
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Job Board</h2>
              <p className="text-yellow-100 text-xs">Earn coins by helping out around campus!</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white text-xs font-semibold">Today</p>
              <p className="text-yellow-100 text-xs">{completedToday}/{dailyLimit} jobs</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
              aria-label="Close job board"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Daily progress bar */}
        <div className="px-6 py-2 bg-black/30 shrink-0">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Daily jobs ({completedToday}/{dailyLimit})</span>
            {completedToday >= dailyLimit && (
              <span className="text-yellow-400 font-semibold">Daily limit reached!</span>
            )}
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F59E0B] rounded-full transition-all"
              style={{ width: `${Math.min((completedToday / dailyLimit) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Feedback toast */}
        {feedback && (
          <div className={`mx-4 mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-center shrink-0 ${
            feedback.type === 'success'
              ? 'bg-green-900/60 text-green-300 border border-green-600'
              : 'bg-red-900/60 text-red-300 border border-red-600'
          }`}>
            {feedback.message}
          </div>
        )}

        {/* Job list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              Loading jobs...
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 gap-2">
              <p className="text-4xl">📋</p>
              <p>No jobs available right now.</p>
            </div>
          ) : (
            jobs.map((job) => {
              const isLocked = !job.meetsLevel;
              const isDailyLimited = job.dailyLimitReached;
              const isCooldown = job.onCooldown;

              return (
                <div
                  key={job.jobId}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    job.available
                      ? 'border-[#F59E0B]/40 bg-[#F59E0B]/5 hover:bg-[#F59E0B]/10 cursor-pointer'
                      : 'border-white/10 bg-white/5 opacity-60'
                  }`}
                  onClick={() => job.available && handleTakeJob(job)}
                >
                  {/* Icon */}
                  <div className="text-4xl shrink-0">{job.iconEmoji}</div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-bold">{job.title}</p>
                      {job.type === 'MINI_GAME' && (
                        <span className="text-[10px] bg-[#8B5CF6]/30 text-[#C4B5FD] px-1.5 py-0.5 rounded-full font-semibold">
                          MINI-GAME
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm leading-snug line-clamp-2">{job.description}</p>

                    {/* Status tag */}
                    <div className="flex items-center gap-1 mt-1.5">
                      {isCooldown && job.cooldownEndsAt && (
                        <span className="flex items-center gap-1 text-[11px] text-orange-400">
                          <Clock className="w-3 h-3" />
                          Ready in {formatCooldown(job.cooldownEndsAt)}
                        </span>
                      )}
                      {isLocked && (
                        <span className="flex items-center gap-1 text-[11px] text-red-400">
                          <Lock className="w-3 h-3" />
                          Requires Level {job.minLevel}
                        </span>
                      )}
                      {isDailyLimited && !isCooldown && !isLocked && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <CheckCircle className="w-3 h-3" />
                          Daily limit reached
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="shrink-0 text-right space-y-1">
                    <div className="flex items-center justify-end gap-1 text-yellow-400 font-bold text-sm">
                      <span>🪙</span>
                      <span>+{job.currencyReward}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-purple-400 text-xs">
                      <span>⭐</span>
                      <span>+{job.xpReward} XP</span>
                    </div>
                    {job.available && (
                      <div className="mt-2 px-3 py-1 bg-[#F59E0B] text-white text-xs font-bold rounded-lg">
                        Take Job →
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-3 border-t border-white/10 text-center text-xs text-gray-500 shrink-0">
          Complete jobs to earn coins • Max {dailyLimit} jobs per day
        </div>
      </div>
    </div>
  );
}
