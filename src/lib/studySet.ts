import { loadFromStorage, saveToStorage } from './storage';

export const saveStudySet = (ids: string[]) => {
  saveToStorage('studySet', ids);
};

export const loadStudySet = () => loadFromStorage<string[]>('studySet', []);

export const clearStudySet = () => saveToStorage('studySet', []);
