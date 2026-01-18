import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { loadFromStorage, saveToStorage } from './storage';
import { Domain, QuestionAttempt } from '../types/questions';

export type AttemptSummary = {
  id: string;
  date: string;
  mode: 'exam' | 'practice';
  score: number;
  durationMinutes: number;
  domainBreakdown: Record<Domain, { correct: number; total: number }>;
};

export type ProgressState = {
  attempts: AttemptSummary[];
  statsByQuestion: Record<string, QuestionAttempt>;
};

const defaultState: ProgressState = {
  attempts: [],
  statsByQuestion: {}
};

const ProgressContext = createContext<{
  state: ProgressState;
  recordAttempt: (attempt: AttemptSummary, questionStats: Record<string, QuestionAttempt>) => void;
} | null>(null);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ProgressState>(() => loadFromStorage('progress', defaultState));

  const recordAttempt = (attempt: AttemptSummary, questionStats: Record<string, QuestionAttempt>) => {
    setState((prev) => {
      const updated: ProgressState = {
        attempts: [attempt, ...prev.attempts].slice(0, 50),
        statsByQuestion: { ...prev.statsByQuestion, ...questionStats }
      };
      saveToStorage('progress', updated);
      return updated;
    });
  };

  const value = useMemo(() => ({ state, recordAttempt }), [state]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used inside ProgressProvider');
  }

  const summary = useMemo(() => {
    const attempts = ctx.state.attempts;
    const lastScore = attempts[0]?.score ?? 0;
    const bestScore = attempts.reduce((max, item) => Math.max(max, item.score), 0);
    const readiness = attempts.length
      ? Math.round(attempts.reduce((acc, item) => acc + item.score, 0) / attempts.length)
      : 0;
    const streak = attempts.length ? Math.min(attempts.length, 7) : 0;
    return {
      attempts: attempts.length,
      lastScore,
      bestScore,
      readiness,
      streak
    };
  }, [ctx.state.attempts]);

  return { ...ctx, summary };
};
