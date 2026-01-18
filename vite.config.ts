import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  const env =
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const base = env.GITHUB_ACTIONS ? '/ExamPrep/' : '/';
  return {
    base,
    plugins: [react()]
  };
});
