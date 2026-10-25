import { test } from 'node:test'
import assert from 'node:assert'
import { preparePublications, slugify } from '../src/lib/pure.ts'

test('slugify lowercases and hyphenates text', () => {
  assert.strictEqual(slugify('Peer-reviewed International Conference'), 'peer-reviewed-international-conference')
  assert.strictEqual(slugify('Hello, World! & Stuff'), 'hello-world-stuff')
  assert.strictEqual(slugify('  spaced  out  '), 'spaced-out')
})

test('slugify strips leading and trailing hyphens', () => {
  assert.strictEqual(slugify('--edges--'), 'edges')
  assert.strictEqual(slugify(''), '')
})

test('slugify hyphenates non-alphanumeric runs', () => {
  assert.strictEqual(slugify('a--b__c..d'), 'a-b-c-d')
})

test('prepares publication groups and display fields', () => {
  const prepared = preparePublications({
    items: [
      {
        category: 'Peer-reviewed International Conference',
        title: 'Test Paper',
        authors: ['A. Author', 'B. Author'],
        venue: 'TestConf',
        location: 'Tokyo',
        year: 2026,
        pages: '1-10',
        url: 'https://example.com',
      },
      {
        category: 'Preprint',
        title: 'Draft Paper',
        authors: ['C. Author'],
        archive: 'arXiv:0000.00000',
      },
    ],
  })

  assert.strictEqual(prepared.groups.length, 2)
  assert.strictEqual(prepared.groups[0].category, 'Peer-reviewed International Conference')
  assert.strictEqual(prepared.groups[0].id, 'peer-reviewed-international-conference')
  assert.strictEqual(prepared.groups[0].items.length, 1)
  assert.strictEqual(prepared.groups[1].category, 'Preprint')
  assert.strictEqual(prepared.groups[1].id, 'preprint')
  assert.strictEqual(prepared.items.length, 2)

  const [first, second] = prepared.items
  assert.strictEqual(first.authorsText, 'A. Author, B. Author')
  assert.strictEqual(first.metaText, 'TestConf, Tokyo, 2026, pp. 1-10')
  assert.strictEqual(first.yearText, '2026')
  assert.strictEqual(first.hasLinks, true)
  assert.strictEqual(second.authorsText, 'C. Author')
  assert.strictEqual(second.hasLinks, true)
  assert.strictEqual(second.metaText, '')
})

test('groups items by first-appearance category order', () => {
  const prepared = preparePublications({
    items: [
      { category: 'Preprint', title: 'B' },
      { category: 'Domestic Conference', title: 'C' },
      { category: 'Preprint', title: 'A' },
    ],
  })

  assert.deepStrictEqual(
    prepared.groups.map((group) => group.category),
    ['Preprint', 'Domestic Conference'],
  )
  assert.deepStrictEqual(
    prepared.groups[0].items.map((item) => item.title),
    ['B', 'A'],
  )
})

test('defaults missing categories to Uncategorized', () => {
  const prepared = preparePublications({ items: [{ title: 'No Category' }] })

  assert.strictEqual(prepared.groups.length, 1)
  assert.strictEqual(prepared.groups[0].category, 'Uncategorized')
  assert.strictEqual(prepared.groups[0].id, 'uncategorized')
})

test('metaText joins venue, location, date, volume, and pages', () => {
  const [item] = preparePublications({
    items: [
      {
        venue: 'TestConf',
        location: 'Tokyo',
        date: 'Nov 2025',
        volume: '31st',
        pages: '4K3IS2f04-4K3IS2f04',
      },
    ],
  }).items

  assert.strictEqual(item.metaText, 'TestConf, Tokyo, Nov 2025, vol. 31st, pp. 4K3IS2f04-4K3IS2f04')
})

test('prefers date over year for metaText', () => {
  const [item] = preparePublications({
    items: [{ date: 'Mar 2025', year: 2025 }],
  }).items

  assert.strictEqual(item.metaText, 'Mar 2025')
  assert.strictEqual(item.yearText, '2025')
})

test('hasLinks is false without url, archive, or field', () => {
  const [item] = preparePublications({ items: [{ title: 'Plain' }] }).items

  assert.strictEqual(item.hasLinks, false)
  assert.strictEqual(item.authorsText, '')
})

test('handles empty and missing publications', () => {
  assert.deepStrictEqual(preparePublications({ items: [] }).groups, [])
  assert.deepStrictEqual(preparePublications({}).groups, [])
  assert.deepStrictEqual(preparePublications({}).items, [])
  assert.deepStrictEqual(preparePublications().groups, [])
})
