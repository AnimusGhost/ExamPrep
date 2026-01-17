import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  const env =
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const repo = env.GITHUB_REPOSITORY?.split('/')[1];
  const base = env.GITHUB_ACTIONS && repo ? `/${repo}/` : '/';
  return {
    base,
    plugins: [react()]
  };
});
