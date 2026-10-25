import { parseMarkdownPost, type ParsedPost } from './pure'

export { parseMarkdownPost }
export type { ParsedPost }

export interface Post extends ParsedPost {
  slug: string
  url: string
}

const modules = import.meta.glob('/content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// parseScalar/parseMarkdownPost live in ./pure (single tested source).
// Article rendering goes through renderArticle in ./markdown.

let postsCache: Post[] | undefined

export const allPosts = (): Post[] => {
  if (!postsCache) {
    postsCache = Object.entries(modules)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([filePath, markdown]) => {
        const slug = filePath.slice(filePath.lastIndexOf('/') + 1).replace(/\.md$/, '')
        const post = parseMarkdownPost(markdown)
        return {
          slug,
          url: `/blog/${slug}`,
          title: post.title,
          date: post.date,
          description: post.description,
          body: post.body,
        }
      })
  }
  return postsCache
}

export interface PostSummary {
  slug: string
  url: string
  title: string
  date: string
  description: string
}

export const postSummaries = (): PostSummary[] =>
  allPosts().map(({ slug, url, title, date, description }) => ({
    slug,
    url,
    title,
    date,
    description,
  }))

export const postSlugs = (): string[] => allPosts().map((post) => post.slug)
