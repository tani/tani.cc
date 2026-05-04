import fs from 'node:fs'
import path from 'node:path'
import mustache from 'mustache'
import TOML from 'smol-toml'

const [tomlPath, templatePath, outputPath] = process.argv.slice(2)

if (!tomlPath || !templatePath || !outputPath) {
  console.error('Usage: node script/render.mjs <tomlfile> <template> <outhtml>')
  process.exit(1)
}

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const preparePublications = (publications = {}) => {
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

const loadPartials = (templatePath) => {
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

const pageName = path.basename(outputPath, '.html')

const toml = fs.readFileSync(tomlPath, 'utf-8')
const data = TOML.parse(toml)
const template = fs.readFileSync(templatePath, 'utf-8')
const view = {
  ...data,
  isIndex: pageName === 'index',
  isProfile: pageName === 'profile',
  isPublications: pageName === 'publications',
  navRoot: '',
  pageTitle:
    pageName === 'publications'
      ? `Publications - ${data.profile?.name ?? ''}`
      : pageName === 'profile'
        ? `${data.profile?.name ?? ''} - ${data.profile?.affiliation ?? ''}`
        : pageName === 'index'
          ? data.profile?.name || pageName
        : data.title || data.profile?.name || pageName,
  publications: preparePublications(data.publications),
}
const partials = loadPartials(templatePath)

const rendered = mustache.render(template, view, partials)
fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, rendered, 'utf-8')
