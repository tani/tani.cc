# tani.cc

Personal site of Masaya Taniguchi, built as a [Void](https://void.cloud) pages app with React
and static prerendering. Pages are rendered from `website.toml`; blog posts come from
Markdown files rendered with markdown-it + MathJax (static SVG output, no client-side
math JavaScript).

## Structure

- `website.toml`: profile, research, CV, and publications data
- `content/*.md`: blog posts (front matter + Markdown, LaTeX and `prooftree` environments supported)
- `pages/`: Void page components and their `.server.ts` loaders
- `src/lib/site.ts`: TOML parsing (`smol-toml`) and publication grouping helpers
- `src/lib/posts.ts`: Markdown post parsing and MathJax rendering
- `src/components/`: shared page chrome — `Layout.tsx` (Vector-style header,
  sidebar, content column, footer), plus `Infobox`, `Toc`, and `Section`
- `public/mediawiki.css`: hand-written MediaWiki Vector-inspired theme (no
  CSS framework, no webfonts)
- `vite.config.ts`: Vite config with the Void and React plugins
- `void.config.ts`: Void config (static output, head defaults, redirects)
- `test/*.test.mjs`: Node test runner tests
- `dist/`: build output (`dist/client/` for the prerendered site)

## URLs

Pages live at clean URLs: `/`, `/profile`, `/publications`, `/blog`, and `/blog/<slug>`
(the slug is the Markdown file name). The build also emits `dist/client/profile.html`
etc., so legacy `/foo.html` links to the four fixed pages keep resolving. Blog post
URLs changed from `/blog/<slug>.html` to `/blog/<slug>`.

## Design

The site is styled to resemble Wikipedia's MediaWiki Vector skin. All styling
lives in `public/mediawiki.css`; Bootstrap, Bootswatch, and Google Fonts were
removed entirely, and the page chrome (sidebar, tabs, infobox, table of
contents, category bar) is built by `src/components/`. The "Edit" and
"View history" links (sidebar, tabs, and per-section `[edit]` markers) point at
the GitHub repository: Edit opens the source file that renders the current
route, and View history opens the commit history.

## Build

```sh
npm run build
```

Prerenders every page to `dist/client/` via `vite build` (`output: "static"` in
`void.config.ts`).

## Develop

```sh
npm run dev
```

## Test

```sh
npm test
```

## Deploy

Deployments are fully managed by Cloudflare — no local builds, no CI.

Connect the repository once in the Cloudflare dashboard (Workers & Pages →
Create → GitHub → `tani/tani.cc`) and set:

- Build command: `npm run build`
- Deploy command: `npx void deploy --platform cloudflare --skip-build`
- Production branch: `main`
- Build variables:
  - `CLOUDFLARE_ACCOUNT_ID` (the deploy reads it from the environment; do not
    pin it in `void.config.ts` — that makes the generated config change
    between runs and the deploy refuses to upload)
  - `CLOUDFLARE_WORKERS_SUBDOMAIN` — your account's `workers.dev` subdomain
    (the `my-team` in `my-team.workers.dev`; find it on any worker's
    workers.dev URL). Void needs it to probe the uploaded version's
    readiness when the version has no preview URL.

Workers Builds injects `CLOUDFLARE_API_TOKEN` automatically. Every push to
`main` builds and deploys on Cloudflare's infrastructure.

The Worker name is pinned to `tani` via `cloudflare.name` in `void.config.ts`.
The deploy uploads Worker **versions**, so the Git-connected Worker must
already exist under exactly that name (`tani`) in the same account —
"Create application" in the dashboard pre-creates it when you connect the
repo; if you named it differently, either rename it or change
`cloudflare.name` to match. `CLOUDFLARE_ACCOUNT_ID` must point at the account
holding that Worker, or the upload fails with "was not found in your account".

The site is fully static (all pages prerendered), so Void deploys it as a pure
static site: a thin edge worker for redirects/headers plus static assets. After
the first deploy, attach the domain (`tani.cc`) to the Worker in
Settings → Domains, then remove the old Pages project.

Manual fallback (needs `npx void cloudflare login` or `CLOUDFLARE_API_TOKEN`):
`npm run deploy` builds locally and deploys with `--skip-build`.

## Generated Files

`dist/` is generated output and is ignored by Git. To remove it:

```sh
npm run clean
```
