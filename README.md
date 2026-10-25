# tani.cc

Personal site of Masaya Taniguchi, built as a [Void](https://void.cloud) pages app with React
and static prerendering. Pages are rendered from `website.toml`; blog posts are written in
[Typst](https://typst.app) and compiled at build time to HTML with native MathML — no
client-side math JavaScript.

## Structure

- `website.toml`: profile, research, CV, and publications data
- `posts/*.typ`: blog posts (Typst sources with a small `meta` definition) plus
  `posts/lib.typ`, the `prooftree` helper
- `pages/`: Void page components and their `.server.ts` loaders; `pages/blog/` holds the
  blog index and post route
- `src/lib/site.ts`: TOML parsing (`smol-toml`) and publication grouping helpers
- `src/lib/typst.ts`: Typst → HTML compilation via
  `@myriaddreamin/typst-ts-node-compiler` (runs at build time; output includes MathML)
- `src/components/`: shared page chrome — `Layout.tsx` (Vector-style header,
  sidebar, content column, footer), plus `Infobox`, `Toc`, and `Section`
- `public/mediawiki.css`: hand-written MediaWiki Vector-inspired theme (no
  CSS framework, no webfonts)
- `vite.config.ts`: Vite config with the Void and React plugins
- `void.config.ts`: Void config (static output, head defaults, redirects)
- `test/*.test.mjs`: Node test runner tests
- `dist/`: build output (`dist/client/` for the prerendered site)

## Design

The site is styled to resemble Wikipedia's MediaWiki Vector skin. All styling
lives in `public/mediawiki.css`; Bootstrap, Bootswatch, and Google Fonts were
removed entirely, and the page chrome (sidebar, tabs, infobox, table of
contents, category bar) is built by `src/components/`. The "Edit" and
"View history" links (sidebar, tabs, and per-section `[edit]` markers) point at
the GitHub repository: Edit opens the source file that renders the current
route, and View history opens the commit history.

## Content Authoring

Posts are Typst sources at `posts/<slug>.typ`. To add a post:

1. Create `posts/<slug>.typ` and give it a `meta` definition:

   ```typst
   #let meta = (title: "Example Post", date: "2026-05-04", description: "A short example post.")
   ```

   `title` and `description` are strings; `date` is the publication date.

2. Write the body in Typst: `=` / `==` / `===` for headings, inline math in
   `$...$`, display math in `$ ...$` on its own lines.

3. For proof trees, import the helper:

   ```typst
   #import "lib.typ": prooftree
   #prooftree(...)
   ```

The blog index and post pages compile the `.typ` sources with
`@myriaddreamin/typst-ts-node-compiler` at build time (see `src/lib/typst.ts`).
Math is exported as MathML — the browser renders it natively, no client
JavaScript, and the Typst sources remain the single source of truth. Proof
trees are rendered as styled HTML tables (MediaWiki-style, via
`public/mediawiki.css`).

## Build

```sh
npm run build
```

Prerenders every page to `dist/client/` via `vite build` (`output: "static"` in
`void.config.ts`). Typst compilation happens during this build.

## Develop

```sh
npm run dev
```

## Test

```sh
npm test
```

## Deploy

Two ways to deploy; both produce the same pure-static Worker deployment
(thin edge worker + prerendered assets).

### Automatic: GitHub Actions (recommended)

Every push to `main` runs
[`.github/workflows/void-deploy.yml`](.github/workflows/void-deploy.yml):
`npm ci` → `npx void deploy --platform cloudflare`. Watch progress in the
repo's Actions tab.

One-time setup:

1. **GitHub secret** `CLOUDFLARE_API_TOKEN`
   (Settings → Secrets and variables → Actions): an API token with
   **Workers Scripts: Edit** plus read access to bound resources.
2. **GitHub variable** `CLOUDFLARE_WORKERS_SUBDOMAIN`: your account's
   `workers.dev` subdomain (the `my-team` in `my-team.workers.dev`; visible
   on any worker's workers.dev URL, or dash → account → Subdomain). Void
   uses it to probe the uploaded version's readiness when the version has
   no preview URL.
3. **GitHub variable** `CLOUDFLARE_ACCOUNT_ID`: export it into the Deploy
   step's `env:` (add
   `CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}` alongside the
   subdomain). Do **not** pin it in `void.config.ts` — that would make the
   generated config change between runs and the deploy refuses to upload.
4. **Worker `tani` must already exist** in that account: the deploy uploads
   Worker *versions* (it never creates a Worker). If you previously
   connected this repo to Cloudflare "Workers Builds", that same Worker
   works — disconnect Workers Builds from its dashboard and rely on Actions
   instead. If none exists: Workers & Pages → Create → name it exactly
   `tani` (the name is pinned via `cloudflare.name` in `void.config.ts`).

After the first successful deploy: attach the domain (`tani.cc`) to the
Worker in Settings → Domains & Routes, then delete the old Pages project.

### Manual: local deploy

Needs `npx void cloudflare login` (browser OAuth) or `CLOUDFLARE_API_TOKEN`
in the environment:

```sh
npm run deploy
```

`void deploy` runs the build itself (typst compilation included), so no
separate `npm run build` is needed. The workflow and this script deploy
identically.

## Generated Files

`dist/` is generated output and is ignored by Git. To remove it:

```sh
npm run clean
```
