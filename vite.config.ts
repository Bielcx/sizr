import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Build 100% estatico: o resultado de `npm run build` e a pasta dist/,
// que sobe em qualquer host de arquivo (Vercel, Netlify, GitHub Pages).
// Nao existe servidor, API nem banco em nenhum ponto do Sizr.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
