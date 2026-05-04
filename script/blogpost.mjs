import fs from 'node:fs'
import MarkdownIt from 'markdown-it'
import { parseMarkdownPost, readSite, renderToFile } from './site-rendering.mjs'

const [tomlPath, markdownPath, templatePath, outputPath] = process.argv.slice(2)

if (!tomlPath || !markdownPath || !templatePath || !outputPath) {
  console.error('Usage: node script/blogpost.mjs <website.toml> <content/post.md> <blogpost.mustache> <outhtml>')
  process.exit(1)
}

const data = readSite(tomlPath)
const post = parseMarkdownPost(fs.readFileSync(markdownPath, 'utf-8'))
const content = new MarkdownIt().render(post.body)

renderToFile(
  templatePath,
  {
    ...data,
    content,
    isBlog: true,
    navRoot: '../',
    pageTitle: `${post.title} - ${data.profile?.name ?? ''}`,
    post,
  },
  outputPath,
)
