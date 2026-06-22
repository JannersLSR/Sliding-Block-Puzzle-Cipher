import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ponytail: default config is enough; Vercel auto-detects Vite (build → dist).
export default defineConfig({ plugins: [react()] });
