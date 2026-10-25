import { defineConfig } from 'void/config'

export default defineConfig({
  output: 'static',
  cloudflare: {
    // Deterministic Worker name — must match the dashboard-created Worker.
    // The account is resolved from CLOUDFLARE_ACCOUNT_ID at deploy time
    // (set it as a Workers Builds build variable); pinning it here from
    // the env would make the generated config change between runs.
    name: 'tani',
    // Void republishes only the triggers declared in config. The
    // dashboard-created Worker ships with these on; declaring them lets
    // the deploy republish the Worker without refusing over
    // "dashboard-managed routes or visibility".
    workers_dev: true,
    preview_urls: true,
    routes: [],
  },
  head: {
    htmlAttrs: { lang: 'ja' },
    meta: [
      { charset: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    ],
    link: [{ rel: 'stylesheet', href: '/mediawiki.css' }],
  },
  routing: {
    redirects: {
      '/index.html': '/',
      '/profile.html': '/profile',
      '/publications.html': '/publications',
      '/blog.html': '/blog',
    },
  },
})
