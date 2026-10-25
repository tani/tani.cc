import { test } from 'node:test'
import assert from 'node:assert'
import { extractToc, headingSlug } from '../src/lib/toc.ts'

test('extracts h2, h3, and h4 headings with levels 2, 3, 4', () => {
  const entries = extractToc(`
# h1 title (ignored)

intro paragraph

## First section

### Subsection

#### Deep subsection

## Second section
`)

  assert.deepStrictEqual(entries, [
    { level: 2, text: 'First section', rawText: 'First section', id: 'first_section' },
    { level: 3, text: 'Subsection', rawText: 'Subsection', id: 'subsection' },
    { level: 4, text: 'Deep subsection', rawText: 'Deep subsection', id: 'deep_subsection' },
    { level: 2, text: 'Second section', rawText: 'Second section', id: 'second_section' },
  ])
})

test('ignores heading-like lines inside fenced code blocks', () => {
  const entries = extractToc(`
## Real heading

\`\`\`
## Not a heading
### Neither is this
\`\`\`

text

~~~md
## Fenced with tilde and info string
~~~
`)

  assert.deepStrictEqual(entries, [{ level: 2, text: 'Real heading', rawText: 'Real heading', id: 'real_heading' }])
})

test('closes only on a fence marker of the same character and length', () => {
  const entries = extractToc(`
\`\`\`js
const s = \`\`\` + "## stays inside"
\`\`\`

## After code
`)

  assert.deepStrictEqual(entries, [{ level: 2, text: 'After code', rawText: 'After code', id: 'after_code' }])
})

test('strips markdown formatting characters from ids', () => {
  assert.strictEqual(headingSlug('Some *emphasized* and `code`'), 'some_emphasized_and_code')
  assert.strictEqual(headingSlug('  Trailing spaces  '), 'trailing_spaces')
  assert.strictEqual(headingSlug('A & B? C!'), 'a___b__c')
  assert.strictEqual(headingSlug('Strip _under scores_'), 'strip_under_scores')
})

test('collapses runs of non-allowed characters to a single underscore and trims them', () => {
  assert.strictEqual(headingSlug('Hello ... world'), 'hello___world')
  assert.strictEqual(headingSlug('?!'), '')
})
test('suffixed ids on collision within a document', () => {
  const entries = extractToc(`
## Same name

### Same name

## Same name
`)

  assert.deepStrictEqual(entries, [
    { level: 2, text: 'Same name', rawText: 'Same name', id: 'same_name' },
    { level: 3, text: 'Same name', rawText: 'Same name', id: 'same_name_2' },
    { level: 2, text: 'Same name', rawText: 'Same name', id: 'same_name_3' },
  ])
})

test('collision counting is slug-based, not text-based', () => {
  const entries = extractToc(`
## Same **name**

## Same name
`)

  assert.deepStrictEqual(entries, [
    { level: 2, text: 'Same **name**', rawText: 'Same **name**', id: 'same_name' },
    { level: 2, text: 'Same name', rawText: 'Same name', id: 'same_name_2' },
  ])
})

test('body only: front matter delimiters and # h1 never produce entries', () => {
  const entries = extractToc(`---

date: 2025-12-19

---

# Top-level title

## Section one
`)

  assert.deepStrictEqual(entries, [{ level: 2, text: 'Section one', rawText: 'Section one', id: 'section_one' }])
})

test('returns empty toc for a body without headings', () => {
  assert.deepStrictEqual(extractToc('Just a paragraph.\n\nAnother one.\n'), [])
})

test('trailing closing hashes are stripped from heading text', () => {
  const entries = extractToc('## Closed heading ##\n')
  assert.deepStrictEqual(entries, [
    { level: 2, text: 'Closed heading', rawText: 'Closed heading', id: 'closed_heading' },
  ])
})

test('display text strips math delimiters but rawText keeps them', () => {
  const entries = extractToc('## 提案体系 $L\\mu$ と循環証明の導入\n')
  assert.deepStrictEqual(entries, [
    {
      level: 2,
      text: '提案体系 Lmu と循環証明の導入',
      rawText: '提案体系 $L\\mu$ と循環証明の導入',
      id: '提案体系__l_mu__と循環証明の導入',
    },
  ])
})

test('display text strips display math delimiters too', () => {
  const entries = extractToc('## About $$x^2$$ formulas\n')
  assert.deepStrictEqual(entries, [
    {
      level: 2,
      text: 'About x^2 formulas',
      rawText: 'About $$x^2$$ formulas',
      id: 'about__x_2__formulas',
    },
  ])
})
