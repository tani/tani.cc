import fs from 'node:fs'
import path from 'node:path'
import mustache from 'mustache'
import TOML from 'smol-toml'

const [tomlPath, contentDir, templatePath, outputPath] = process.argv.slice(2)

if (!tomlPath || !contentDir || !templatePath || !outputPath) {
  console.error('Usage: node script/blog.mjs <website.toml> <content/dir> <blog.mustache> <outhtml>')
  process.exit(1)
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

const parseMarkdownMeta = (markdown) => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  const metadata = {}
  const body = match ? match[2] : markdown

  if (match) {
    for (const line of match[1].split('\n')) {
      const separator = line.indexOf(':')
      if (separator === -1) {
        continue
      }
      const key = line.slice(0, separator).trim()
      const value = line.slice(separator + 1).trim()
      metadata[key] = value.replace(/^["']|["']$/g, '')
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

const toml = fs.readFileSync(tomlPath, 'utf-8')
const data = TOML.parse(toml)
const template = fs.readFileSync(templatePath, 'utf-8')
const posts = fs
  .readdirSync(contentDir)
  .filter((fileName) => fileName.endsWith('.md'))
  .sort()
  .map((fileName) => {
    const markdownPath = path.join(contentDir, fileName)
    const markdown = fs.readFileSync(markdownPath, 'utf-8')
    const metadata = parseMarkdownMeta(markdown)
    const slug = path.basename(fileName, '.md')

    return {
      ...metadata,
      slug,
      url: `blog/${slug}.html`,
    }
  })

const rendered = mustache.render(
  template,
  {
    ...data,
    isBlog: true,
    navRoot: '',
    pageTitle: `Blog - ${data.profile?.name ?? ''}`,
    posts,
  },
  loadPartials(templatePath),
)

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, rendered, 'utf-8')
