import { loadFromStorage, saveToStorage } from './storage';

export type FlashcardState = {
  nextDue: string;
  intervalDays: number;
};

export type FlashcardMap = Record<string, FlashcardState>;

const defaultState: FlashcardMap = {};

export const loadFlashcards = () => loadFromStorage('flashcards', defaultState);

export const updateFlashcard = (id: string, confidence: 'low' | 'medium' | 'high') => {
  const state = loadFlashcards();
  const current = state[id] ?? { nextDue: new Date().toISOString(), intervalDays: 1 };
  const multiplier = confidence === 'low' ? 0.5 : confidence === 'medium' ? 1.5 : 2.5;
  const nextInterval = Math.max(1, Math.round(current.intervalDays * multiplier));
  const nextDue = new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000).toISOString();
  const updated = { ...state, [id]: { nextDue, intervalDays: nextInterval } };
  saveToStorage('flashcards', updated);
  return updated;
};
