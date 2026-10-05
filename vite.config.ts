/// <reference types="vite/client" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

// GitHub Pages serves 404.html for any path it cannot resolve, so it is the
// only thing that makes client-side routes such as /detail/52772 reachable on
// a hard load or refresh. Copying the built index keeps the hashed asset
// filenames in sync, which a hand-written file in public/ cannot do.
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const index = resolve(import.meta.dirname, 'dist/index.html')
      if (existsSync(index)) copyFileSync(index, resolve(import.meta.dirname, 'dist/404.html'))
    },
  }
}

export default defineConfig({
  plugins: [react(), spaFallback()],
  // Must match the repository name, or the deployed page loads JS/CSS from a
  // path that does not exist and renders blank.
  base: '/mp2/',
})
