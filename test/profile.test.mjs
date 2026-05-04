import { test, after } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const execFileAsync = promisify(execFile)

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const fixturesDir = path.join(__dirname, 'profile-fixtures')
const distDir = path.join(__dirname, 'profile-dist')

test.afterEach(() => {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true })
  }
})

test('renders profile from website.toml using profile.mustache', async () => {
  const tomlPath = path.join(fixturesDir, 'test.toml')
  const templatePath = path.join(fixturesDir, 'profile.mustache')
  const customTemplate = `<!DOCTYPE html>
<html lang="ja">
<head><title>{{profile.name}}</title></head>
<body>
<h1>{{profile.name}}</h1>
<p class="role">{{profile.role}}</p>
<p class="affiliation">{{profile.affiliationLong}}</p>
<div id="bio">
{{#bio.en}}{{{.}}}{{/bio.en}}
</div>
<div class="links">
{{#profile.links}}
<a href="{{{url}}}">{{label}}</a>
{{/profile.links}}
</div>
<h2>Research Interests</h2>
<ul>
{{#research.interests}}<li>{{.}}</li>{{/research.interests}}
</ul>
</body>
</html>`

  fs.mkdirSync(fixturesDir, { recursive: true })

  const tomlData = `[profile]
name = "Masaya Taniguchi"
role = "Assistant Professor"
affiliation = "Department of Policy and Management, Keio University"
affiliationLong = "Dept. of Policy and Management, Keio Univ."
section = "Policy and Management, Faculty of Policy Management"

[profile.bio]
en = "Researcher in computational linguistics."
ja = "計算言語学の研究者です。"

[[profile.links]]
label = "Google Scholar"
url = "https://scholar.google.com"

[[profile.links]]
label = "GitHub"
url = "https://github.com"

[research]
interests = [
  "Computational Linguistics",
  "Language Technology"
]

[[research.areas]]
discipline = "Humanities & Social Sciences"
field = "Language Sciences"
keywords = "linguistics, NLP"
`

  fs.writeFileSync(tomlPath, tomlData)
  fs.writeFileSync(templatePath, customTemplate)

  try {
    await execFileAsync('node', [
      path.join(__dirname, '..', 'script', 'render.mjs'),
      tomlPath,
      templatePath,
      path.join(distDir, 'profile.html'),
    ])

    const outputPath = path.join(distDir, 'profile.html')
    assert.ok(fs.existsSync(outputPath), 'dist/profile.html should exist')

    const output = fs.readFileSync(outputPath, 'utf-8')
    assert.ok(output.includes('<h1>Masaya Taniguchi</h1>'), 'Should include profile name')
    assert.ok(output.includes('Assistant Professor'), 'Should include role')
    assert.ok(output.includes('<a href="https://scholar.google.com">Google Scholar</a>'), 'Should include links')
    assert.ok(output.includes('<li>Computational Linguistics</li>'), 'Should include research interests')
    assert.ok(!output.includes('計算言語学の研究者です。'), 'Should not include bio.ja')
  } finally {
    fs.rmSync(fixturesDir, { recursive: true, force: true })
  }
})

test('excludes publications from output', async () => {
  const tomlPath = path.join(fixturesDir, 'test.toml')
  const templatePath = path.join(fixturesDir, 'profile.mustache')
  const customTemplate = `<!DOCTYPE html>
<html>
<body>
{{#profile.name}}<h1>{{profile.name}}</h1>{{/profile.name}}
<h2>Profile</h2>
{{#cv}}
<h2>CV</h2>
{{/cv}}
<h2>Publications</h2>
</body>
</html>`

  fs.mkdirSync(fixturesDir, { recursive: true })

  const tomlData = `[profile]
name = "Test Person"
role = "Researcher"
affiliation = "Test University"
affiliationLong = "Test University"
section = "Test Faculty"

[[profile.links]]
label = "Website"
url = "https://example.com"

[research]
interests = ["Research"]

[[research.areas]]
discipline = "Science"
field = "Physics"
keywords = "physics"

[cv]

[[cv.education]]
degree = "Ph.D."
school = "Test University"
range = "2015-2020"
department = "Computer Science"

[[cv.experience]]
role = "Researcher"
affiliation = "Test Lab"
range = "2020-2023"

[[publications.items]]
category = "Journal Article"
title = "Test Paper"
authors = [ "Test Author" ]
`

  fs.writeFileSync(tomlPath, tomlData)
  fs.writeFileSync(templatePath, customTemplate)

  try {
    await execFileAsync('node', [
      path.join(__dirname, '..', 'script', 'render.mjs'),
      tomlPath,
      templatePath,
      path.join(distDir, 'profile.html'),
    ])

    const outputPath = path.join(distDir, 'profile.html')
    assert.ok(fs.existsSync(outputPath), 'dist/profile.html should exist')

    const output = fs.readFileSync(outputPath, 'utf-8')
    // publications data should not render unless the template asks for it
    assert.ok(!output.includes('Test Paper'), 'Should not include publication content')
    // cv data should be available
    assert.ok(output.includes('<h1>Test Person</h1>'), 'Should include profile')
  } finally {
    fs.rmSync(fixturesDir, { recursive: true, force: true })
  }
})

test('handles empty toml profile section', async () => {
  const tomlPath = path.join(fixturesDir, 'test.toml')
  const templatePath = path.join(fixturesDir, 'profile.mustache')
  const customTemplate = `<!DOCTYPE html>
<html>
<body>
{{#profile.name}}{{{profile.name}}}{{/profile.name}}{{^profile.name}}No name{{/profile.name}}
</body>
</html>`

  fs.mkdirSync(fixturesDir, { recursive: true })

  const tomlData = `[profile]
name = ""

[research]
interests = []

[[research.areas]]
discipline = ""
field = ""
keywords = ""
`

  fs.writeFileSync(tomlPath, tomlData)
  fs.writeFileSync(templatePath, customTemplate)

  try {
    await execFileAsync('node', [
      path.join(__dirname, '..', 'script', 'render.mjs'),
      tomlPath,
      templatePath,
      path.join(distDir, 'profile.html'),
    ])

    const outputPath = path.join(distDir, 'profile.html')
    assert.ok(fs.existsSync(outputPath), 'dist/profile.html should exist')

    const output = fs.readFileSync(outputPath, 'utf-8')
    assert.ok(output.includes('No name'), 'Should handle missing profile.name')
  } finally {
    fs.rmSync(fixturesDir, { recursive: true, force: true })
  }
})
