import fs from 'node:fs'
import path from 'node:path'
import mustache from 'mustache'
import TOML from 'smol-toml'

export const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const readSite = (tomlPath) => TOML.parse(fs.readFileSync(tomlPath, 'utf-8'))

export const loadPartials = (templatePath) => {
  const templateDir = path.dirname(templatePath)
  const partials = {}

  for (const fileName of fs.readdirSync(templateDir)) {
    if (!fileName.endsWith('.mustache')) {
      continue
    }

    const name = path.basename(fileName, '.mustache')
    const content = fs.readFileSync(path.join(templateDir, fileName), 'utf-8')
    partials[name] = content
    partials[`@${name}`] = content
  }

  return partials
}

export const renderToFile = (templatePath, view, outputPath) => {
  const template = fs.readFileSync(templatePath, 'utf-8')
  const rendered = mustache.render(template, view, loadPartials(templatePath))
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, rendered, 'utf-8')
}

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

const parseScalar = (value) => {
  const trimmed = value.trim()
  const quoted = trimmed.match(/^(['"])([\s\S]*)\1$/)
  return quoted ? quoted[2] : trimmed
}

export const parseMarkdownPost = (markdown) => {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  const metadata = {}
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
