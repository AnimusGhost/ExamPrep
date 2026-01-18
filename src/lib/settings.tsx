import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { loadFromStorage, saveToStorage } from './storage';

export type Settings = {
  funMode: boolean;
  reducedMotion: boolean;
  fontScale: number;
  defaultTimer: number;
  passThreshold: number;
  authorMode: boolean;
  theme: 'system' | 'light' | 'dark';
};

const defaultSettings: Settings = {
  funMode: false,
  reducedMotion: false,
  fontScale: 1,
  defaultTimer: 60,
  passThreshold: 70,
  authorMode: false,
  theme: 'system'
};

const SettingsContext = createContext<{
  settings: Settings;
  update: (next: Partial<Settings>) => void;
} | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => ({
    ...defaultSettings,
    ...loadFromStorage('settings', defaultSettings)
  }));

  useEffect(() => {
    const updateTheme = () => {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
      const nextTheme = settings.theme === 'system' ? (prefersDark ? 'dark' : 'light') : settings.theme;
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      document.documentElement.style.colorScheme = nextTheme;
    };
    updateTheme();
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    const handler = () => updateTheme();
    media?.addEventListener?.('change', handler);
    return () => media?.removeEventListener?.('change', handler);
  }, [settings.theme]);

  const update = (next: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...next };
      saveToStorage('settings', updated);
      return updated;
    });
  };

  const value = useMemo(() => ({ settings, update }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }
  return ctx;
};
