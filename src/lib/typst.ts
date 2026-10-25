// Typst blog registry for the bundled (Vite/worker) path.
//
// Posts are compiled at BUILD time by src/build/typst-precompile.ts — the
// native typst compiler addon cannot live inside the Cloudflare worker
// bundle — and written to the generated module `.void/typst-posts.ts`,
// which this module re-exports. Under plain Node (node --test), tests use
// the pure helpers in src/lib/typst-pure plus the native compiler directly.

import type { TocEntry } from '../components/Toc'
import type { TypstPostMeta } from './typst-pure'
import { posts as compiledPosts } from '../../.void/typst-posts'
export interface TypstPost extends TypstPostMeta {
  slug: string
  url: string
  content: string
  toc: readonly { level: number; text: string; rawText?: string; id: string }[]
}

export interface TypstPostSummary extends TypstPostMeta {
  slug: string
  url: string
}

export { extractMeta, extractHeadings, injectHeadingIds, headingSlug } from './typst-pure'

// The generated module is `as const` (deeply readonly); widen once at the
// boundary instead of sprinkling casts through the page code.
const compiled: readonly TypstPost[] = compiledPosts

// All compiled posts, sorted by date descending (newest first); ties broken
// by slug for determinism (the sort happens in the precompiler).
export const allPosts = (): readonly TypstPost[] => compiled

export const postSummaries = (): TypstPostSummary[] =>
  allPosts().map(({ slug, url, title, date, description }) => ({
    slug,
    url,
    title,
    date,
    description,
  }))

export const postSlugs = (): string[] => allPosts().map((post) => post.slug)
