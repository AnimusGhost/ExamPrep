import { loadFromStorage, saveToStorage } from './storage';

export type FlashcardState = {
  nextDueAt: string;
  intervalDays: number;
  timesSeen: number;
  timesCorrect: number;
  lastSeenAt?: string;
  lastMissedAt?: string;
  confidence: number;
};

export type FlashcardMap = Record<string, FlashcardState>;

const defaultState: FlashcardMap = {};

export const loadFlashcards = () => loadFromStorage('flashcards', defaultState);

const confidenceMultiplier = (rating: 'again' | 'hard' | 'good' | 'easy') => {
  switch (rating) {
    case 'again':
      return 0.4;
    case 'hard':
      return 1;
    case 'good':
      return 1.6;
    case 'easy':
      return 2.4;
    default:
      return 1;
  }
};

export const updateFlashcard = (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
  const state = loadFlashcards();
  const current = state[id] ?? {
    nextDueAt: new Date().toISOString(),
    intervalDays: 1,
    timesSeen: 0,
    timesCorrect: 0,
    confidence: 0
  };
  const multiplier = confidenceMultiplier(rating);
  const nextInterval = Math.max(1, Math.round(current.intervalDays * multiplier));
  const nextDueAt = new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000).toISOString();
  const updated: FlashcardState = {
    ...current,
    nextDueAt,
    intervalDays: nextInterval,
    timesSeen: current.timesSeen + 1,
    timesCorrect: current.timesCorrect + (rating === 'good' || rating === 'easy' ? 1 : 0),
    lastSeenAt: new Date().toISOString(),
    lastMissedAt: rating === 'again' ? new Date().toISOString() : current.lastMissedAt,
    confidence: Math.min(3, Math.max(0, current.confidence + (rating === 'easy' ? 2 : rating === 'good' ? 1 : rating === 'again' ? -2 : -1)))
  };
  const next = { ...state, [id]: updated };
  saveToStorage('flashcards', next);
  return next;
};
