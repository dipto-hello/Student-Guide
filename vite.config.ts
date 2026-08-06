import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const plugins = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  VitePWA({
    registerType: "autoUpdate",
    injectRegister: "auto",
    includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
    manifest: {
      name: "Student Success Hub",
      short_name: "StudentHub",
      description: "Master your university journey with powerful tools.",
      theme_color: "#3B82F6",
      background_color: "#0F172A",
      display: "standalone",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    },
    workbox: {
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      // The SPA navigation fallback serves index.html for any navigation that
      // isn't a precached asset. Without this denylist it also swallows
      // top-level navigations to /api/* — which broke server-side Google OAuth:
      // hitting /api/auth/google (and the /callback return from Google) rendered
      // the SPA's 404 instead of reaching the backend. Excluding /api/ lets the
      // browser take those to the network (Vercel rewrite -> Render).
      navigateFallbackDenylist: [/^\/api\//],
    },
  })
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Split heavy, eagerly-imported vendors out of the entry chunk.
        //
        // WHY a function (not the old object form): the entry chunk was 385 KB
        // because socket.io-client, cmdk, sonner, framer-motion and the Radix
        // tooltip stack are all pulled in *eagerly* by App.tsx (Toaster,
        // CommandMenu, Notifications, SocketProvider, TooltipProvider) and the
        // object form only split a handful of libs — everything else fell into
        // the entry. Giving each heavy vendor its own chunk lets the browser
        // fetch them in parallel with (and cache them independently of) the app
        // shell, so the entry file itself stays small.
        //
        // WHY resolve the real package name instead of a bare `id.includes()`:
        // this is a pnpm install, so module ids look like
        // `.../.pnpm/cmdk@1.1.1_@radix-ui+react-dialog@1.1.15/node_modules/cmdk/...`.
        // A naive `id.includes('@radix-ui')` would misroute cmdk (its peer-dep
        // dir name embeds `@radix-ui`). Matching the trailing package name after
        // the last `node_modules/` avoids that class of bug.
        //
        // WHY the long tail returns undefined (no catch-all "vendor" chunk):
        // most remaining libs (react-hook-form, zod, embla, vaul, streamdown,
        // date-fns, canvas-confetti, …) are reachable *only* from lazy route
        // chunks. Forcing them into one shared "vendor" chunk would make it load
        // eagerly (because tiny eager utils like clsx live there too), dragging
        // all those lazy-only deps into the initial download. Returning undefined
        // lets Rollup keep them inside the lazy route chunks that actually use
        // them, so they never touch first paint.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          const afterModules = id.split('node_modules/').pop() ?? '';
          const pkg = afterModules.startsWith('@')
            ? afterModules.split('/').slice(0, 2).join('/') // scoped: @radix-ui/react-tooltip
            : afterModules.split('/')[0]; // unscoped: react-dom

          // Core framework — needed on every route, cache-stable across deploys.
          if (pkg === 'react' || pkg === 'react-dom' || pkg === 'react-is' || pkg === 'scheduler') {
            return 'vendor-react';
          }
          // socket.io transport — only meaningful once the user is authenticated,
          // but SocketProvider mounts eagerly, so isolate it to keep it parallel.
          if (pkg === 'socket.io-client' || pkg === 'engine.io-client' || pkg === 'socket.io-parser' || pkg === 'engine.io-parser') {
            return 'vendor-socket';
          }
          // Animation library — large and imported eagerly by CommandMenu /
          // Notifications. framer-motion v12 ships its runtime as motion-dom /
          // motion-utils, so group those too.
          if (pkg === 'framer-motion' || pkg === 'motion-dom' || pkg === 'motion-utils') {
            return 'vendor-framer';
          }
          // Charting — already only reachable from the lazy AnalyticsDashboard;
          // pinning it (and its d3 deps) here guarantees it never rejoins the entry.
          if (pkg === 'recharts' || pkg === 'recharts-scale' || pkg === 'victory-vendor' || pkg.startsWith('d3-') || pkg === 'internmap') {
            return 'vendor-recharts';
          }
          // Command palette (Cmd+K) — eager in App but non-critical for paint.
          if (pkg === 'cmdk') return 'vendor-cmdk';
          // Toasts — eager via Toaster/AuthContext but off the critical path.
          if (pkg === 'sonner') return 'vendor-sonner';
          // Icons — 34 KB gzip, referenced from the eager shell and many routes.
          if (pkg === 'lucide-react') return 'vendor-lucide';
          // Router — small, but a stable standalone chunk caches well.
          if (pkg === 'wouter') return 'vendor-wouter';

          // The clsx / tailwind-merge / cva trio backs the `cn()` styling helper
          // used by virtually every component — eager shell *and* lazy routes.
          // WHY pin them here: clsx is also a dependency of recharts, so without
          // an explicit home Rollup folds this shared micro-util into the 383 KB
          // vendor-recharts chunk, which then makes the *entry* statically import
          // (and modulepreload) all of recharts on first paint. A dedicated tiny
          // shared chunk keeps that 383 KB off the critical path entirely.
          if (pkg === 'clsx' || pkg === 'tailwind-merge' || pkg === 'class-variance-authority') {
            return 'vendor-utils';
          }

          // Everything else: let Rollup decide. Lazy-only deps then stay inside
          // the route chunks that use them instead of bloating first paint.
          return undefined;
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: false, // Will find next available port if 3000 is busy
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    allowedHosts: [
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
