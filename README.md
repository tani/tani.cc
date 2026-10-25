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

Deployments run on GitHub Actions on every push to `main` — see
[`.github/workflows/void-deploy.yml`](.github/workflows/void-deploy.yml).
(Cloudflare dashboard "Workers Builds" is no longer used; if the repository was
previously connected there, disconnect it or simply stop using it — the
Actions workflow deploys to the same-named Worker.)

Set these in the GitHub repository:

- Secret `CLOUDFLARE_API_TOKEN` (Settings → Secrets and variables → Actions):
  a token scoped to the account, with Workers Scripts: Edit plus read access
  to bound resources.
- Variable `CLOUDFLARE_ACCOUNT_ID`: the account holding the Worker — export it
  into the workflow environment (e.g. add an `env:` entry in the Deploy step
  reading `${{ vars.CLOUDFLARE_ACCOUNT_ID }}`), since the deploy reads it from
  the environment. Do not pin it in `void.config.ts` — that makes the
  generated config change between runs and the deploy refuses to upload.
- Variable `CLOUDFLARE_WORKERS_SUBDOMAIN`: your account's `workers.dev`
  subdomain (the `my-team` in `my-team.workers.dev`; find it on any worker's
  workers.dev URL). Void needs it to probe the uploaded version's readiness
  when the version has no preview URL.

The Worker name is pinned to `tani` via `cloudflare.name` in `void.config.ts`.
The deploy uploads Worker **versions**, so a Worker must already exist under
exactly that name (`tani`) in the same account — if one was previously created
for Workers Builds, that same Worker works; the Actions workflow deploys to
it. If no Worker exists, create one named `tani` in the dashboard.
`CLOUDFLARE_ACCOUNT_ID` must point at the account holding that Worker, or the
upload fails with "was not found in your account".

The site is fully static (all pages prerendered), so Void deploys it as a pure
static site: a thin edge worker for redirects/headers plus static assets. After
the first deploy, attach the domain (`tani.cc`) to the Worker in
Settings → Domains, then remove the old Pages project.

Manual fallback (needs `npx void cloudflare login` or `CLOUDFLARE_API_TOKEN`):

```sh
npm run deploy
```

`void deploy` builds the site itself, so no separate build is needed.

## Generated Files

`dist/` is generated output and is ignored by Git. To remove it:

```sh
npm run clean
```
