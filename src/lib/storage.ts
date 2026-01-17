export const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn('Storage load failed', error);
    return fallback;
  }
};

export const saveToStorage = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Storage save failed', error);
  }
};

export const exportStorage = () => {
  const payload: Record<string, unknown> = {};
  Object.keys(localStorage).forEach((key) => {
    payload[key] = loadFromStorage(key, null);
  });
  return JSON.stringify(payload, null, 2);
};

export const importStorage = (json: string) => {
  const data = JSON.parse(json) as Record<string, unknown>;
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value));
  });
};
