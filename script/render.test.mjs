import { test } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const fixturesDir = path.join(__dirname, 'render-fixtures')
const distDir = path.join(__dirname, 'render-dist')

test.afterEach(() => {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true })
  }
  if (fs.existsSync(fixturesDir)) {
    fs.rmSync(fixturesDir, { recursive: true, force: true })
  }
})

test('renders HTML from TOML with a mustache template', async () => {
  fs.mkdirSync(fixturesDir, { recursive: true })
  const tomlPath = path.join(fixturesDir, 'site.toml')
  const templatePath = path.join(fixturesDir, 'page.mustache')
  const outputPath = path.join(distDir, 'page.html')

  fs.writeFileSync(tomlPath, `[profile]
name = "Masaya Taniguchi"
role = "Researcher"
`)
  fs.writeFileSync(templatePath, '<h1>{{profile.name}}</h1><p>{{profile.role}}</p>')

  await execFileAsync('node', [
    path.join(__dirname, 'render.mjs'),
    tomlPath,
    templatePath,
    outputPath,
  ])

  assert.ok(fs.existsSync(outputPath), 'output HTML should exist')
  const output = fs.readFileSync(outputPath, 'utf-8')
  assert.ok(output.includes('<h1>Masaya Taniguchi</h1>'), 'Should include profile name')
  assert.ok(output.includes('<p>Researcher</p>'), 'Should include profile role')
})

test('prepares publication groups and display fields', async () => {
  fs.mkdirSync(fixturesDir, { recursive: true })
  const tomlPath = path.join(fixturesDir, 'site.toml')
  const templatePath = path.join(fixturesDir, 'publications.mustache')
  const outputPath = path.join(distDir, 'publications.html')

  fs.writeFileSync(tomlPath, `[[publications.items]]
category = "Peer-reviewed International Conference"
title = "Test Paper"
authors = [ "A. Author", "B. Author" ]
venue = "TestConf"
location = "Tokyo"
year = 2026
pages = "1-10"
url = "https://example.com"

[[publications.items]]
category = "Preprint"
title = "Draft Paper"
authors = [ "C. Author" ]
archive = "arXiv:0000.00000"
`)
  fs.writeFileSync(templatePath, `{{#publications.groups}}
<section id="{{id}}">
<h2>{{category}}</h2>
{{#items}}
<article>
<h3>{{title}}</h3>
<p>{{authorsText}}</p>
<p>{{metaText}}</p>
{{#hasLinks}}<p>{{#url}}{{{url}}}{{/url}}{{#archive}}{{archive}}{{/archive}}</p>{{/hasLinks}}
</article>
{{/items}}
</section>
{{/publications.groups}}`)

  await execFileAsync('node', [
    path.join(__dirname, 'render.mjs'),
    tomlPath,
    templatePath,
    outputPath,
  ])

  const output = fs.readFileSync(outputPath, 'utf-8')
  assert.ok(output.includes('id="peer-reviewed-international-conference"'), 'Should create category slug')
  assert.ok(output.includes('<h2>Peer-reviewed International Conference</h2>'), 'Should include grouped category')
  assert.ok(output.includes('<p>A. Author, B. Author</p>'), 'Should join authors')
  assert.ok(output.includes('<p>TestConf, Tokyo, 2026, pp. 1-10</p>'), 'Should create metadata text')
  assert.ok(output.includes('arXiv:0000.00000'), 'Should expose archive metadata')
})

test('writes to the explicit output path', async () => {
  fs.mkdirSync(fixturesDir, { recursive: true })
  const nestedDir = path.join(distDir, 'nested')
  const tomlPath = path.join(fixturesDir, 'site.toml')
  const templatePath = path.join(fixturesDir, 'page.mustache')
  const outputPath = path.join(nestedDir, 'custom.html')

  fs.writeFileSync(tomlPath, 'title = "Nested"')
  fs.writeFileSync(templatePath, '<title>{{title}}</title>')

  await execFileAsync('node', [
    path.join(__dirname, 'render.mjs'),
    tomlPath,
    templatePath,
    outputPath,
  ])

  assert.ok(fs.existsSync(outputPath), 'explicit nested output path should exist')
  assert.ok(fs.readFileSync(outputPath, 'utf-8').includes('<title>Nested</title>'))
})
