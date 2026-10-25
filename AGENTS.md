<!--injected-by-void-v1.2.1-->
## Void

- This project uses [Void](https://void.cloud), a full-stack Vite framework for Cloudflare Workers with file-based API routing, server-rendered pages, and typed backend services.
- Use Void's CLI and typed APIs. Before working with Void, read the relevant Markdown docs in `node_modules/void/docs/`; start with `guide/quickstart.md` for setup and `reference/cli.md` for commands.
<!--/injected-by-void-->

## Project

This is `tani.cc` — a Void static site (React pages mode, `output: 'static'`, fully
prerendered). Blog posts are Typst sources in `posts/*.typ` (plus the `prooftree` helper
in `posts/lib.typ`), compiled to HTML with native MathML at build time by
`@myriaddreamin/typst-ts-node-compiler` — no client-side math JavaScript. The visual
design mimics MediaWiki's Vector skin and lives entirely in `public/mediawiki.css`.
Content data comes from `website.toml`. Deploy targets the Cloudflare Worker named
`tani` via GitHub Actions on push to `main`.

- `npm run dev` — dev server
- `npm run build` — build to `dist/client/` (runs Typst compilation)
- `npm test` — Node test runner (`test/*.test.mjs`)
- `npm run deploy` — build + deploy to Cloudflare via Void
- `void prepare` — regenerate `.void/` types after dependency changes; run it before
  typechecking in a fresh checkout
