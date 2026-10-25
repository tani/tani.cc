// Pure, Vite-free data helpers.
//
// Behavior-identical copies of the parsing/grouping logic originally in
// script/site-rendering.mjs (and now in src/lib/site.ts and src/lib/posts.ts).
// They exist so `node --test test/*.test.mjs` can import them under plain
// Node (type stripping) without any Vite-only features (?raw imports,
// import.meta.glob). Main agent: reconcile with the src/lib/site.ts and
// src/lib/posts.ts copies after both slices land.

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const parseScalar = (value: string): string => {
  const trimmed = value.trim()
  const quoted = trimmed.match(/^(['"])([\s\S]*)\1$/)
  return quoted ? quoted[2] : trimmed
}

export interface ParsedPost {
  body: string
  date: string
  description: string
  title: string
}

export const parseMarkdownPost = (markdown: string): ParsedPost => {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  const metadata: Record<string, string> = {}
  const body = match ? match[2] : markdown

  if (match) {
    const lines = match[1].split(/\r?\n/)
    let currentKey = ''

    for (const line of lines) {
      if (!line.trim() || line.trim().startsWith('#')) {
        continue
      }

      if (/^\s+/.test(line) && currentKey) {
        metadata[currentKey] = `${metadata[currentKey]}\n${line.trim()}`
        continue
      }

      const separator = line.indexOf(':')
      if (separator === -1) {
        continue
      }

      currentKey = line.slice(0, separator).trim()
      metadata[currentKey] = parseScalar(line.slice(separator + 1))
    }
  }

  const heading = body.match(/^#\s+(.+)$/m)?.[1]
  return {
    body,
    date: metadata.date || '',
    description: metadata.description || '',
    title: metadata.title || heading || 'Untitled',
  }
}

export interface PublicationItem {
  category?: string
  title?: string
  authors?: string[]
  venue?: string
  location?: string
  date?: string
  volume?: string
  pages?: string
  year?: number | string
  url?: string
  archive?: string
  field?: string
}

export interface PublicationsData {
  items?: PublicationItem[]
}

export interface PreparedPublicationItem extends PublicationItem {
  authorsText: string
  hasLinks: boolean
  metaText: string
  yearText: string
}

export interface PublicationGroup {
  category: string
  id: string
  items: PreparedPublicationItem[]
}

export interface PreparedPublications extends PublicationsData {
  items: PreparedPublicationItem[]
  groups: PublicationGroup[]
}

export const preparePublications = (publications: PublicationsData = {}): PreparedPublications => {
  const items = (publications.items ?? []).map((item): PreparedPublicationItem => {
    const yearText = item.year ? String(item.year) : ''
    const metaText = [
      item.venue,
      item.location,
      item.date || yearText,
      item.volume ? `vol. ${item.volume}` : '',
      item.pages ? `pp. ${item.pages}` : '',
    ]
      .filter(Boolean)
      .join(', ')

    return {
      ...item,
      authorsText: (item.authors ?? []).join(', '),
      hasLinks: Boolean(item.url || item.archive || item.field),
      metaText,
      yearText,
    }
  })

  const categories = new Map<string, PreparedPublicationItem[]>()
  for (const item of items) {
    const category = item.category || 'Uncategorized'
    if (!categories.has(category)) {
      categories.set(category, [])
    }
    categories.get(category)!.push(item)
  }

  return {
    ...publications,
    items,
    groups: [...categories.entries()].map(([category, groupItems]) => ({
      category,
      id: slugify(category || 'uncategorized'),
      items: groupItems,
    })),
  }
}
