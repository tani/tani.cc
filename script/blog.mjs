import fs from 'node:fs'
import path from 'node:path'
import { parseMarkdownPost, readSite, renderToFile } from './site-rendering.mjs'

const [tomlPath, contentDir, templatePath, outputPath] = process.argv.slice(2)

if (!tomlPath || !contentDir || !templatePath || !outputPath) {
  console.error('Usage: node script/blog.mjs <website.toml> <content/dir> <blog.mustache> <outhtml>')
  process.exit(1)
}

const data = readSite(tomlPath)
const posts = fs
  .readdirSync(contentDir)
  .filter((fileName) => fileName.endsWith('.md'))
  .sort()
  .map((fileName) => {
    const markdownPath = path.join(contentDir, fileName)
    const metadata = parseMarkdownPost(fs.readFileSync(markdownPath, 'utf-8'))
    const slug = path.basename(fileName, '.md')

    return {
      ...metadata,
      slug,
      url: `blog/${slug}.html`,
    }
  })

renderToFile(
  templatePath,
  {
    ...data,
    isBlog: true,
    navRoot: '',
    pageTitle: `Blog - ${data.profile?.name ?? ''}`,
    posts,
  },
  outputPath,
)
