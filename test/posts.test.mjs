import { test } from 'node:test'
import assert from 'node:assert'
import { parseMarkdownPost, parseScalar } from '../src/lib/pure.ts'

test('parses front matter and body', () => {
  const post = parseMarkdownPost(`---
title: Example Post
date: 2026-05-04
description: Example description
---

This is **markdown**.
`)

  assert.strictEqual(post.title, 'Example Post')
  assert.strictEqual(post.date, '2026-05-04')
  assert.strictEqual(post.description, 'Example description')
  assert.strictEqual(post.body, '\nThis is **markdown**.\n')
})

test('parses quoted front matter values', () => {
  const post = parseMarkdownPost(`---
title: "Example: Post"
date: 2026-05-04
description: "Description: with colon"
---
Body text.
`)

  assert.strictEqual(post.title, 'Example: Post')
  assert.strictEqual(post.description, 'Description: with colon')
  assert.strictEqual(post.body, 'Body text.\n')
})

test('parses single-quoted front matter values', () => {
  const post = parseMarkdownPost(`---
title: 'A quoted: title'
---

Body.
`)

  assert.strictEqual(post.title, 'A quoted: title')
})

test('strips only matching quote pairs', () => {
  assert.strictEqual(parseScalar('  "quoted"  '), 'quoted')
  assert.strictEqual(parseScalar("'quoted'"), 'quoted')
  assert.strictEqual(parseScalar('"unbalanced'), '"unbalanced')
  assert.strictEqual(parseScalar('plain'), 'plain')
  assert.strictEqual(parseScalar('  trimmed  '), 'trimmed')
})

test('handles colons in unquoted values', () => {
  const post = parseMarkdownPost(`---
url: https://example.com/path
---

Body.
`)

  assert.strictEqual(post.title, 'Untitled')
  const metadata = parseMarkdownPost('---\nurl: https://example.com/path\n---\nBody.\n')
  assert.strictEqual(metadata.body, 'Body.\n')
})

test('joins continuation lines with newlines', () => {
  const post = parseMarkdownPost(`---
description: first line
  second line
---

Body.
`)

  assert.strictEqual(post.description, 'first line\nsecond line')
})

test('skips comments and blank lines in front matter', () => {
  const post = parseMarkdownPost(`---
# a comment

title: Kept
---

Body.
`)

  assert.strictEqual(post.title, 'Kept')
})

test('falls back to the first heading for the title', () => {
  const post = parseMarkdownPost('# Heading Title\n\nBody text.\n')

  assert.strictEqual(post.title, 'Heading Title')
  assert.strictEqual(post.body, '# Heading Title\n\nBody text.\n')
})

test('falls back to Untitled without metadata or heading', () => {
  assert.strictEqual(parseMarkdownPost('Just body text.\n').title, 'Untitled')
})

test('missing front matter yields empty date and description', () => {
  const post = parseMarkdownPost('Body only.\n')

  assert.strictEqual(post.date, '')
  assert.strictEqual(post.description, '')
})

test('missing metadata keys default to empty strings', () => {
  const post = parseMarkdownPost('---\ntitle: Only Title\n---\nBody.\n')

  assert.strictEqual(post.title, 'Only Title')
  assert.strictEqual(post.date, '')
  assert.strictEqual(post.description, '')
})

test('handles CRLF front matter', () => {
  const post = parseMarkdownPost('---\r\ntitle: CRLF Post\r\n---\r\nBody.\r\n')

  assert.strictEqual(post.title, 'CRLF Post')
  assert.strictEqual(post.body, 'Body.\r\n')
})

test('front matter without a closing delimiter is treated as body', () => {
  const post = parseMarkdownPost('---\ntitle: No Closing\n')

  assert.strictEqual(post.title, 'Untitled')
  assert.strictEqual(post.date, '')
  assert.strictEqual(post.body, '---\ntitle: No Closing\n')
})
