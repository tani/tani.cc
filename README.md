# tani.cc

Personal site of Masaya Taniguchi, built as an [Eleventy](https://www.11ty.dev)
static site. Pages are rendered from `website.toml`; blog posts are written in
[Typst](https://typst.app) and compiled at build time to HTML with native
MathML — no client-side math JavaScript. Deployed on Cloudflare Pages.

## Structure

- `website.toml`: profile, research, CV, and publications data (single source
  of truth, parsed by `site/_data/site.js`)
- `posts/*.typ`: blog posts (Typst sources with a small `meta` definition) plus
  `posts/lib.typ`, the `prooftree` helper
- `.eleventy.js`: Eleventy config — the dedicated `posts` collection loader
  compiles every `posts/*.typ` through `@myriaddreamin/typst-ts-node-compiler`
  at build time; also registers the `editHref`, `navActive`, and `tocNumbering`
  filters, copies `public/mediawiki.css`, and sets the `site/` → `dist-pages/`
  directories
- `site/*.liquid`: the pages — `index`, `profile`, `publications`, `blog` (index)
  — plus `site/blog/posts.liquid`, a paginated template that renders one page
  per post (`pagination` over `collections.posts`)
- `site/*.11tydata.js`: per-page computed data (infobox rows, section bodies,
  TOC entries) — Liquid cannot build arrays or do conditional joins
- `site/_data/site.js`: global data (`site.*` and
  `site.preparedPublications.groups`)
- `site/_includes/`: shared Liquid — `wiki.liquid` (the MediaWiki Vector page
  chrome), plus `infobox`, `toc`, and `section` partials
- `src/lib/pure.mjs` and `src/lib/typst-pure.mjs`: pure helpers
  (publication grouping, Typst meta/heading extraction) shared by the config,
  the data loader, and the tests
- `public/mediawiki.css`: hand-written MediaWiki Vector-inspired theme (no CSS
  framework, no webfonts), served at `/mediawiki.css`
- `test/*.test.mjs`: Node test runner tests
- `dist-pages/`: build output

## Design

The site is styled to resemble Wikipedia's MediaWiki Vector skin. All styling
lives in `public/mediawiki.css`; Bootstrap, Bootswatch, and Google Fonts were
removed entirely, and the page chrome (sidebar, tabs, infobox, table of
contents, category bar) is built by `site/_includes/wiki.liquid`. The "Edit"
and "View history" links (sidebar, tabs, and per-section `[edit]` markers)
point at the GitHub repository: Edit opens the source file that renders the
current route, and View history opens the commit history.

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

The `posts` collection loader in `.eleventy.js` compiles the `.typ` sources
with `@myriaddreamin/typst-ts-node-compiler` at build time. Math is exported as
MathML — the browser renders it natively, no client JavaScript — and the Typst
sources remain the single source of truth. Proof trees are rendered as styled
HTML tables (MediaWiki-style, via `public/mediawiki.css`). Every post becomes
`/blog/<slug>.html`, rendered by `site/blog/posts.liquid` via Eleventy
pagination.

Profile, CV, and publication content live in `website.toml`; edit that file
(and, for structural changes, the matching template under `site/`).

## Build

```sh
npm run build
```

Renders every page to `dist-pages/` (flat `.html` files: `index.html`,
`profile.html`, `publications.html`, `blog.html`, and
`blog/<slug>.html` per post). Typst compilation happens during this build.

## Develop

```sh
npm run dev
```

Runs `eleventy --serve` with a live-reloading dev server.

## Test

```sh
npm test
```

## Deploy: Cloudflare Pages

The site is deployed on Cloudflare Pages as a plain static build. The existing
Pages project only needs its build settings updated (Workers & Pages → the
project → Settings → Build & deployments):

- **Build command:** `npm run build`
- **Build output directory:** `dist-pages`
- **Production branch:** `main`

Cloudflare runs `npm run build` on every push to `main` and serves
`dist-pages/`. No framework preset is needed; the flat `.html` permalinks keep
legacy URLs (`/blog/<slug>.html`) working, and `index.html` at the output root
serves `/`.

## Generated Files

`dist-pages/` is generated output and is ignored by Git. To remove it:

```sh
npm run clean
```
