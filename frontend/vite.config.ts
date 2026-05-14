// vite.config.ts
// Uses @lovable.dev/vite-tanstack-config which wraps TanStack Start's vite plugin.
//
// SPA mode (tanstackStart.spa.enabled) is enabled so the build produces:
//   - dist/client/         — static JS/CSS assets
//   - dist/client/_shell.html — the HTML shell (a static entry point)
//
// Vercel then serves _shell.html as a catch-all for all routes, while
// the client-side TanStack Router handles navigation. This requires no
// Node.js server on Vercel — only CDN-served static files.
//
// Why SPA mode instead of SSR?
//   TanStack Start's default build targets Cloudflare Workers runtime.
//   Vercel's free tier cannot run Cloudflare Workers.
//   SPA mode outputs a static HTML shell that any CDN/static host can serve.

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    spa: {
      enabled: true,
    },
  },
});
