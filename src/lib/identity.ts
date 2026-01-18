const STORAGE_KEY = 'anonymousId';

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `anon-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
};

const readCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  return document.cookie
    .split('; ')
    .find((value) => value.startsWith(`${name}=`))
    ?.split('=')[1];
};

const writeCookie = (name: string, value: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=31536000`;
};

export const getAnonymousId = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const next = generateId();
    localStorage.setItem(STORAGE_KEY, next);
    return next;
  } catch (error) {
    console.warn('Anonymous id unavailable', error);
    const cookieValue = readCookie(STORAGE_KEY);
    if (cookieValue) return cookieValue;
    const next = generateId();
    writeCookie(STORAGE_KEY, next);
    return next;
  }
};
