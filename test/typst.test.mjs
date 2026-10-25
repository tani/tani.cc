import { test } from 'node:test'
import assert from 'node:assert'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  extractHeadings,
  extractMeta,
  headingSlug,
  injectHeadingIds,
} from '../src/lib/typst-pure.mjs'

test('extractMeta reads the #let meta dictionary', () => {
  const meta = extractMeta(`#let meta = (
  title: "Example Post",
  date: "2026-05-04",
  description: "A short example blog post.",
)

Body text.`)

  assert.strictEqual(meta.title, 'Example Post')
  assert.strictEqual(meta.date, '2026-05-04')
  assert.strictEqual(meta.description, 'A short example blog post.')
})

test('extractMeta handles commas and parens inside quoted values', () => {
  const meta = extractMeta(
    `#let meta = (title: "T, (with parens)", date: '2026-05-04', description: "d")`,
  )

  assert.strictEqual(meta.title, 'T, (with parens)')
  assert.strictEqual(meta.date, '2026-05-04')
  assert.strictEqual(meta.description, 'd')
})

test('extractMeta unescapes \\" and \\\\ in double-quoted values', () => {
  const meta = extractMeta(
    `#let meta = (title: "a \\"quoted\\" title", date: "2026-05-04", description: "x")`,
  )

  assert.strictEqual(meta.title, 'a "quoted" title')
})

test('extractMeta defaults missing fields to empty strings', () => {
  const meta = extractMeta('#let meta = (title: "Only Title")\n\nBody.\n')

  assert.strictEqual(meta.title, 'Only Title')
  assert.strictEqual(meta.date, '')
  assert.strictEqual(meta.description, '')
})

test('extractMeta returns empty metadata without a meta binding', () => {
  const meta = extractMeta('Just body text.\n')

  assert.deepStrictEqual(meta, { title: '', date: '', description: '' })
})

test('extractHeadings maps = to level 2 and counts nesting depth', () => {
  const entries = extractHeadings(`Intro line

= Top section

== Subsection

=== Deep subsection

= Second top
`)

  assert.deepStrictEqual(entries, [
    { level: 2, text: 'Top section', id: 'top_section' },
    { level: 3, text: 'Subsection', id: 'subsection' },
    { level: 4, text: 'Deep subsection', id: 'deep_subsection' },
    { level: 2, text: 'Second top', id: 'second_top' },
  ])
})

test('extractHeadings strips math delimiters for display text', () => {
  const entries = extractHeadings('== 提案体系 $L mu$ と循環証明の導入\n')

  assert.deepStrictEqual(entries, [
    {
      level: 3,
      text: '提案体系 L mu と循環証明の導入',
      id: '提案体系__l_mu__と循環証明の導入',
    },
  ])
})

test('extractHeadings suffixed ids on slug collision', () => {
  const entries = extractHeadings('== Same name\n\n=== Same name\n\n== Same name\n')

  assert.deepStrictEqual(entries, [
    { level: 3, text: 'Same name', id: 'same_name' },
    { level: 4, text: 'Same name', id: 'same_name_2' },
    { level: 3, text: 'Same name', id: 'same_name_3' },
  ])
})

test('headingSlug produces Wikipedia-style ids', () => {
  assert.strictEqual(headingSlug('背景と動機：論理と形式言語の階層構造'), '背景と動機_論理と形式言語の階層構造')
  assert.strictEqual(headingSlug('解析例：Alice runs'), '解析例_alice_runs')
  assert.strictEqual(headingSlug('推論規則と大域的トレース条件 (GTC)'), '推論規則と大域的トレース条件__gtc')
  assert.strictEqual(headingSlug('Plain'), 'plain')
  assert.strictEqual(headingSlug('?!'), '')
})

test('injectHeadingIds adds ids to matching heading tags in order', () => {
  const html = '<body><h2>a</h2><h3>b</h3><h3>c</h3><h2>d</h2></body>'

  const out = injectHeadingIds(html, [
    { level: 2, id: 'one' },
    { level: 3, id: 'two' },
    { level: 3, id: 'three' },
    { level: 2, id: 'four' },
  ])

  assert.strictEqual(
    out,
    '<body><h2 id="one">a</h2><h3 id="two">b</h3><h3 id="three">c</h3><h2 id="four">d</h2></body>',
  )
})

test('injectHeadingIds leaves unmatched heading tags untouched', () => {
  const out = injectHeadingIds('<h5>extra</h5><h2>x</h2>', [{ level: 2, id: 'x' }])

  assert.strictEqual(out, '<h5>extra</h5><h2 id="x">x</h2>')
})

test('posts compile through NodeCompiler to MathML', async () => {
  const { NodeCompiler } = await import('@myriaddreamin/typst-ts-node-compiler')
  const lib = readFileSync(new URL('../posts/lib.typ', import.meta.url), 'utf8')
  const source = `#import "lib.typ": prooftree

= Test heading

Inline $a + b$ and display $ x^2 $ math.

#prooftree([$#"p ⇒ q"$], [$#"p, q ⇒ r"$], [$#"p ⇒ r"$], label: [$#"(cut)"$])
`

  const workspace = mkdtempSync(join(tmpdir(), 'typst-test-'))
  const compiler = NodeCompiler.create({ workspace })
  compiler.addSource(join(workspace, 'lib.typ'), lib)
  compiler.addSource(join(workspace, 'test-post.typ'), source)
  const result = compiler.compileHtml({ mainFilePath: join(workspace, 'test-post.typ') })
  assert.ok(!result.hasError(), 'test post must compile cleanly')

  const html = compiler.html(result.result)
  assert.match(html, /<h2>Test heading<\/h2>/)
  assert.match(html, /<math><mi>𝑎<\/mi><mo>\+<\/mo><mi>𝑏<\/mi><\/math>/)
  assert.match(html, /<math display="block">/)
  assert.match(html, /class="typst-prooftree"/)
  assert.match(html, /<mtext>p ⇒ q<\/mtext>/)
})

test('the lambek post compiles with the same math count as its source', async () => {
  const { NodeCompiler } = await import('@myriaddreamin/typst-ts-node-compiler')
  const lib = readFileSync(new URL('../posts/lib.typ', import.meta.url), 'utf8')
  const source = readFileSync(
    new URL('../posts/lambek-calculus-cyclic-proofs.typ', import.meta.url),
    'utf8',
  )

  // Math parity gate: every `$...$` span in the source must surface as a
  // MathML element in the compiled HTML (46 in this post as of this writing).
  const sourceMathSpans = source
    .split(/\r?\n/)
    .reduce((count, line) => count + (line.match(/\$[^$]+\$/g)?.length ?? 0), 0)

  const workspace = mkdtempSync(join(tmpdir(), 'typst-test-'))
  const compiler = NodeCompiler.create({ workspace })
  compiler.addSource(join(workspace, 'lib.typ'), lib)
  compiler.addSource(join(workspace, 'lambek-calculus-cyclic-proofs.typ'), source)
  const result = compiler.compileHtml({
    mainFilePath: join(workspace, 'lambek-calculus-cyclic-proofs.typ'),
  })
  assert.ok(!result.hasError(), 'lambek post must compile cleanly')

  const html = compiler.html(result.result)
  const mathElements = (html.match(/<math[ >]/g) ?? []).length

  assert.strictEqual(sourceMathSpans, 46)
  assert.strictEqual(mathElements, sourceMathSpans)
})
