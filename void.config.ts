import { defineConfig } from 'void/config'

export default defineConfig({
  output: 'static',
  cloudflare: {
    // Deterministic Worker name — must match the dashboard-created Worker.
    name: 'tani',
    // Unblocks non-interactive deploys in Workers Builds (setting
    // CLOUDFLARE_ACCOUNT_ID as a build variable works too; this pins it).
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
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
