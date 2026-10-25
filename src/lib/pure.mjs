// Pure, framework-free data helpers.
//
// They exist so the Eleventy data loader (site/_data/site.js) and
// `node --test test/*.test.mjs` can import them under plain Node with no
// bundler features (?raw imports, import.meta.glob).

export const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const preparePublications = (publications = {}) => {
  const items = (publications.items ?? []).map((item) => {
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

  const categories = new Map()
  for (const item of items) {
    const category = item.category || 'Uncategorized'
    if (!categories.has(category)) {
      categories.set(category, [])
    }
    categories.get(category).push(item)
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
