// Eleventy configuration for tani.cc.
//
// Build pipeline:
//   posts/*.typ   → compiled to HTML (MathML) at build time by the dedicated
//                   `posts` collection loader below (NodeCompiler singleton),
//                   with heading anchors + TOC derived from the sources.
//   website.toml  → parsed by site/_data/site.js into `site` /
//                   `preparedPublications` data.
//   site/*.liquid → pages, rendered into site/_includes/wiki.liquid (the
//                   MediaWiki Vector chrome).
//   public/       → passthrough copies (mediawiki.css).
//
// Output is flat .html files (permalink: false everywhere) so Cloudflare
// Pages serves the same URLs the pre-Void site had (e.g.
// /blog/<slug>.html).

import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler'
import {
  extractHeadings,
  extractMeta,
  injectHeadingIds,
} from './src/lib/typst-pure.mjs'

const REPO_URL = 'https://github.com/tani/tani.cc'
const NAVIGATION = [
  { href: '/index.html', label: 'Home' },
  { href: '/profile.html', label: 'Profile' },
  { href: '/publications.html', label: 'Publications' },
  { href: '/blog.html', label: 'Blog' },
]

// GitHub source-file target for the Edit links: each route maps to the file
// that renders it (post pages map to their Typst source).
const editFileForPage = (url) => {
  if (url === '/' || url === '/index.html') return 'site/index.liquid'
  if (url === '/profile.html') return 'site/profile.liquid'
  if (url === '/publications.html') return 'site/publications.liquid'
  if (url === '/blog.html') return 'site/blog.liquid'
  if (url.startsWith('/blog/')) {
    return `posts/${url.slice('/blog/'.length).replace(/\.html$/, '')}.typ`
  }
  return ''
}

// The dedicated Typst loader: compiles every posts/*.typ through a single
// NodeCompiler instance (the native addon cannot ship to the browser, and
// sharing one compiler across posts reuses its font/parse caches).
const loadTypstPosts = () => {
  const postsDir = resolve(process.cwd(), 'posts')
  const names = readdirSync(postsDir)
    .filter((name) => name.endsWith('.typ') && name !== 'lib.typ')
    .sort()

  const compiler = NodeCompiler.create({ workspace: resolve(postsDir, '..') })
  const libSource = readFileSync(join(postsDir, 'lib.typ'), 'utf8')
  compiler.addSource(join(postsDir, 'lib.typ'), libSource)

  const posts = []
  for (const name of names) {
    const slug = name.replace(/\.typ$/, '')
    const source = readFileSync(join(postsDir, name), 'utf8')
    const file = join(postsDir, name)
    compiler.addSource(file, source)

    const result = compiler.compileHtml({ mainFilePath: file })
    if (result.hasError()) {
      result.printErrors()
      throw new Error(`typst compilation failed for ${slug}`)
    }
    const document = result.result
    if (document === null) {
      throw new Error(`typst compilation produced no document for ${slug}`)
    }
    const full = compiler.html(document)
    if (full === null) {
      throw new Error(`typst compilation produced no HTML for ${slug}`)
    }
    const body = full.slice(full.indexOf('<body>') + 6, full.lastIndexOf('</body>'))
    const meta = extractMeta(source)
    const toc = extractHeadings(source).map((entry) => ({ ...entry, rawText: entry.text }))

    posts.push({
      slug,
      url: `blog/${slug}.html`,
      title: meta.title,
      date: meta.date,
      description: meta.description,
      content: injectHeadingIds(body, toc),
      toc,
      tocNumbered: tocNumbering(toc),
      editHref: `${REPO_URL}/blob/main/posts/${slug}.typ`,
    })
  }

  // Newest first; ties broken by slug for determinism (same order the
  // pre-Void precompiler produced).
  posts.sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug),
  )
  return posts
}

// Hierarchical section numbers for the TOC box (mirrors the React Toc
// component: levels clamp to 2..4, deeper counters reset on shallower
// headings). Liquid cannot do stateful iteration on its own.
const tocNumbering = (entries) => {
  const counters = [0, 0, 0]
  return (entries ?? []).map((entry) => {
    const depth = Math.min(Math.max(entry.level, 2), 4) - 2
    counters[depth] += 1
    for (let i = depth + 1; i < counters.length; i += 1) counters[i] = 0
    return { ...entry, depth, number: counters.slice(0, depth + 1).join('.') }
  })
}

export default function (eleventyConfig) {
  eleventyConfig.addCollection('posts', loadTypstPosts)

  // Edit-link target resolution for the wiki chrome (sidebar + tabs).
  eleventyConfig.addFilter('editHref', (url) =>
    url ? `${REPO_URL}/blob/main/${editFileForPage(url)}` : `${REPO_URL}/`,
  )

  // Sidebar active state: the current page is active when it IS the nav
  // target or lives under its section (/blog/<slug>.html lives under
  // /blog); Home is active only on the exact index. (Computed in JS —
  // liquidjs's `starts_with` operator mis-evaluates in this version.)
  eleventyConfig.addFilter('navActive', (href, url) => {
    if (!url) return ''
    if (href === '/index.html') {
      return url === '/index.html' || url === '/' ? 'active' : ''
    }
    const section = href.replace(/\.html$/, '')
    return url === href || url.startsWith(`${section}/`) ? 'active' : ''
  })

  // Global chrome data.
  eleventyConfig.addGlobalData('repoUrl', () => REPO_URL)
  eleventyConfig.addGlobalData('navigation', () => NAVIGATION)

  // Hierarchical TOC numbering filter for templates using toc.liquid.
  eleventyConfig.addFilter('tocNumbering', tocNumbering)

  // Theme assets: served at /mediawiki.css and /logo.svg.
  eleventyConfig.addPassthroughCopy({
    'public/mediawiki.css': 'mediawiki.css',
    'public/logo.svg': 'logo.svg',
  })

  return {
    dir: {
      input: 'site',
      output: 'dist-pages',
      includes: '_includes',
      data: '_data',
    },
    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'liquid',
  }
}
