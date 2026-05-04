# tani.cc-v6

Static site generator for `website.toml`, Mustache templates, and Markdown blog posts.

## Structure

- `website.toml`: profile, research, CV, and publications data
- `content/*.md`: blog posts
- `template/*.mustache`: page templates and shared partials
- `script/render.mjs`: generic TOML + Mustache page renderer
- `script/blog.mjs`: blog index generator
- `script/blogpost.mjs`: Markdown blog post generator
- `script/site-rendering.mjs`: shared rendering and metadata helpers
- `test/*.test.mjs`: Node test runner tests
- `dist/`: generated HTML output

## Build

```sh
pnpm build
```

This runs `just all` and generates:

- `dist/index.html`
- `dist/profile.html`
- `dist/publications.html`
- `dist/blog.html`
- `dist/blog/*.html`

Individual targets are available through `just`:

```sh
just index
just profile
just publications
just blog
just blog-index
just blog-posts
```

## Blog Posts

Add Markdown files to `content/`. Each file may start with front matter:

```md
---
title: Post Title
date: 2026-05-04
description: Short summary
---

Post body.
```

`just blog-posts` renders every `content/*.md` file to `dist/blog/<slug>.html` using shell expansion in the Justfile.

## Templates

All page templates use shared partials:

- `template/preamble.mustache`: document head, Bootstrap/Bootswatch, fonts, navbar, opening `<main>`
- `template/postamble.mustache`: closing `<main>`, Bootstrap bundle, closing document tags

## Generated Files

`dist/` is generated output and is ignored by Git. Rebuild it with `pnpm build`.

To remove generated output:

```sh
pnpm clean
```

## Test

```sh
pnpm test
```
