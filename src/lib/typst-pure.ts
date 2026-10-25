// Pure typst-source helpers shared by the build-time precompiler
// (src/build/typst-precompile.ts) and the plain-node tests. No Vite-only
// syntax, no native imports — importable from anywhere.

export interface TypstPostMeta {
  title: string
  date: string
  description: string
}

// Extract the `#let meta = (...)` dictionary from a post source.
//
// The dictionary body is scanned with a quote-aware walker: quoted strings
// ("..." with backslash escapes, or '...') are skipped whole, so values may
// contain commas, parens, and colons. Only string fields are supported
// (title/date/description); anything else is ignored.
export const extractMeta = (source: string): TypstPostMeta => {
  const open = /#let\s+meta\s*=\s*\(/.exec(source)
  const meta: TypstPostMeta = { title: '', date: '', description: '' }
  if (!open) return meta

  // Slice off the dictionary body: everything up to the first unquoted ')'.
  const rest = source.slice(open.index + open[0].length)
  let end = rest.length
  let i = 0
  while (i < rest.length) {
    const char = rest[i]
    if (char === '"' || char === "'") {
      i += 1
      while (i < rest.length && rest[i] !== char) {
        if (rest[i] === '\\') i += 1
        i += 1
      }
      i += 1
    } else if (char === ')') {
      end = i
      break
    } else {
      i += 1
    }
  }
  const header = rest.slice(0, end)

  // Field values: double-quoted (with escapes), single-quoted, or a bare
  // token up to the next comma or the closing paren.
  const META_STRING =
    /(?:"((?:[^"\\]|\\.)*)"|'([^']*)'|([^,)]*[^,)\s])[^,)]*)/g
  const fields = /\b(title|date|description)\s*:\s*/g
  let fieldMatch: RegExpExecArray | null

  while ((fieldMatch = fields.exec(header))) {
    META_STRING.lastIndex = fields.lastIndex
    const value = META_STRING.exec(header)
    if (!value) continue
    const double = value[1]
    const single = value[2]
    const bare = value[3]
    meta[fieldMatch[1] as keyof TypstPostMeta] =
      double !== undefined
        ? double.replace(/\\([\s\S])/g, '$1')
        : single !== undefined
          ? single
          : (bare ?? '').trim()
    fields.lastIndex = META_STRING.lastIndex
  }

  return meta
}

// Wikipedia-style heading slug (the site's legacy anchor algorithm):
// lowercase, spaces become underscores, any run outside [a-z0-9_], CJK
// ranges, or '-' collapses to '_', then trim '_'.
export const headingSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/[^a-z0-9_\u3040-\u30ff\u4e00-\u9fff-]+/g, '_')
    .replace(/^_+|_+$/g, '')

// Display text for the TOC box: strip typst math `$...$` delimiters, keep
// the inner source as plain text ("$L mu$" reads as "L mu").
const displayText = (text: string): string =>
  text.replace(/\$([^$]+)\$/g, (_, inner) => ` ${inner.trim()} `).replace(/\s+/g, ' ').trim()

// Extract `=`, `==`, ... headings from typst source. Levels are the typst
// level + 1 (typst's `=` is h2 in the HTML export, `==` is h3). Ids are
// deterministic and unique within a document: the second occurrence of a
// slug gets a `_2` suffix, the third `_3`, and so on.
export const extractHeadings = (
  source: string,
): { level: number; text: string; id: string }[] => {
  const entries: { level: number; text: string; id: string }[] = []
  const seen = new Map<string, number>()

  for (const line of source.split(/\r?\n/)) {
    const match = /^(={1,4})\s+(.+?)\s*$/.exec(line)
    if (!match) continue
    const raw = match[2].trim()
    const slug = headingSlug(raw)
    const count = seen.get(slug) ?? 0
    seen.set(slug, count + 1)

    entries.push({
      level: match[1].length + 1,
      text: displayText(raw),
      id: count === 0 ? slug : `${slug}_${count + 1}`,
    })
  }

  return entries
}

// Inject heading ids into compiled HTML: typst's HTML export emits bare
// `<h2>`/`<h3>`/... tags without anchors, so the nth heading tag of each
// level gets the id of the nth extracted heading of that level.
export const injectHeadingIds = (
  html: string,
  headings: { level: number; id: string }[],
): string => {
  const byLevel = new Map<number, string[]>()
  for (const heading of headings) {
    const list = byLevel.get(heading.level) ?? []
    list.push(heading.id)
    byLevel.set(heading.level, list)
  }

  return html.replace(/<h([2345])>/g, (tag, level) => {
    const list = byLevel.get(Number(level))
    const id = list?.shift()
    return id === undefined ? tag : `<h${level} id="${id}">`
  })
}
