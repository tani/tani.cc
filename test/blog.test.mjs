import { test } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesDir = path.join(__dirname, 'blog-fixtures')
const distDir = path.join(__dirname, 'blog-dist')

test.afterEach(() => {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true })
  }
  if (fs.existsSync(fixturesDir)) {
    fs.rmSync(fixturesDir, { recursive: true, force: true })
  }
})

const writeCommonFixtures = () => {
  fs.mkdirSync(path.join(fixturesDir, 'content'), { recursive: true })
  fs.mkdirSync(path.join(fixturesDir, 'template'), { recursive: true })

  fs.writeFileSync(
    path.join(fixturesDir, 'site.toml'),
    `[profile]
name = "Test Author"
`,
  )
  fs.writeFileSync(path.join(fixturesDir, 'template', 'preamble.mustache'), '<html><body>{{pageTitle}} ')
  fs.writeFileSync(path.join(fixturesDir, 'template', 'postamble.mustache'), '</body></html>')
}

test('generates a blog index from markdown posts', async () => {
  writeCommonFixtures()
  fs.writeFileSync(
    path.join(fixturesDir, 'content', 'example.md'),
    `---
title: "Example: Post"
date: 2026-05-04
description: "Description: with colon"
---

Body text.
`,
  )
  fs.writeFileSync(
    path.join(fixturesDir, 'template', 'blog.mustache'),
    `{{> @preamble}}
{{#posts}}<article><a href="{{{url}}}">{{title}}</a><time>{{date}}</time><p>{{description}}</p></article>{{/posts}}
{{> @postamble}}`,
  )

  const outputPath = path.join(distDir, 'blog.html')
  await execFileAsync('node', [
    path.join(__dirname, '..', 'script', 'blog.mjs'),
    path.join(fixturesDir, 'site.toml'),
    path.join(fixturesDir, 'content'),
    path.join(fixturesDir, 'template', 'blog.mustache'),
    outputPath,
  ])

  const output = fs.readFileSync(outputPath, 'utf-8')
  assert.ok(output.includes('Blog - Test Author'), 'Should set blog page title')
  assert.ok(output.includes('<a href="blog/example.html">Example: Post</a>'), 'Should link to generated post URL')
  assert.ok(output.includes('<p>Description: with colon</p>'), 'Should parse front matter values with colons')
})

test('generates a blog post from markdown content', async () => {
  writeCommonFixtures()
  const markdownPath = path.join(fixturesDir, 'content', 'example.md')
  fs.writeFileSync(
    markdownPath,
    `---
title: Example Post
date: 2026-05-04
description: Example description
---

This is **markdown**.
`,
  )
  fs.writeFileSync(
    path.join(fixturesDir, 'template', 'blogpost.mustache'),
    `{{> @preamble}}<h1>{{post.title}}</h1><div>{{{content}}}</div>{{> @postamble}}`,
  )

  const outputPath = path.join(distDir, 'blog', 'example.html')
  await execFileAsync('node', [
    path.join(__dirname, '..', 'script', 'blogpost.mjs'),
    path.join(fixturesDir, 'site.toml'),
    markdownPath,
    path.join(fixturesDir, 'template', 'blogpost.mustache'),
    outputPath,
  ])

  const output = fs.readFileSync(outputPath, 'utf-8')
  assert.ok(output.includes('Example Post - Test Author'), 'Should set post page title')
  assert.ok(output.includes('<h1>Example Post</h1>'), 'Should render post title')
  assert.ok(output.includes('<p>This is <strong>markdown</strong>.</p>'), 'Should render markdown body')
})
