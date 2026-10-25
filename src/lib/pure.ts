// Pure, Vite-free data helpers.
//
// They exist so `node --test test/*.test.mjs` can import them under plain
// Node (type stripping) without any Vite-only features (?raw imports,
// import.meta.glob).

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

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
