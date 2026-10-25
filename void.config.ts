import { defineConfig } from 'void/config'

export default defineConfig({
  output: 'static',
  cloudflare: {
    // Deterministic Worker name — must match the dashboard-created Worker.
    // The account is resolved from CLOUDFLARE_ACCOUNT_ID at deploy time
    // (set it as a Workers Builds build variable); pinning it here from
    // the env would make the generated config change between runs.
    name: 'tani',
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
