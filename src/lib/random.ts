export const seededShuffle = <T,>(items: T[], seed: string) => {
  const result = [...items];
  let hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  for (let i = result.length - 1; i > 0; i -= 1) {
    hash = (hash * 9301 + 49297) % 233280;
    const rand = hash / 233280;
    const j = Math.floor(rand * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const sample = <T,>(items: T[], count: number, seed?: string) => {
  const source = seed ? seededShuffle(items, seed) : [...items].sort(() => Math.random() - 0.5);
  return source.slice(0, count);
};
