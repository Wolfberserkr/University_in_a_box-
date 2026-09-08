import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* The original reader opened straight off disk as well as from GitHub Pages, and
 * that is worth keeping: a study record you can only read when a server is up is
 * a study record you stop reading. ES modules are blocked under file:// by CORS,
 * so the bundle is emitted as a single classic script and the tags are rewritten
 * to match. Relative base, hash routing, no server rewrite rules. */
function classicScriptTags() {
  return {
    name: 'classic-script-tags',
    enforce: 'post',
    transformIndexHtml(html) {
      return html
        .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g,
                 '<script defer src="$1"></script>')
        .replace(/ crossorigin(?=[ >])/g, '');
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), classicScriptTags()],
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    modulePreload: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
});
