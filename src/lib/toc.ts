// Table-of-contents extraction for article-style pages.
//
// Plain-node importable (no Vite-only syntax) so `node --test` can use it
// directly.

export interface TocEntry {
  level: number
  /** Cleaned display text (math delimiters stripped) for the TOC box. */
  text: string
  /** Raw heading text as it appears in the markdown source. */
  rawText: string
  id: string
}

// Display text for the TOC: strip $/$$ math delimiters (keeping the inner
// LaTeX, minus backslash escapes) so entries like
// "提案体系 $L\mu$ と循環証明の導入" read as "提案体系 Lmu と循環証明の導入".
const displayText = (text: string): string =>
  text
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    .replace(/\$([^$]+?)\$/g, (_, inner) => inner.replace(/\\([a-zA-Z]+)/g, '$1'))

// Wikipedia-style heading slug: lowercase, strip markdown emphasis/inline-code
// characters, spaces become underscores, any run of characters outside
// [a-z0-9_], CJK ranges, or '-' collapses to '_', then trim '_'.
export const headingSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[*_`]/g, '')
    .replace(/ /g, '_')
    .replace(/[^a-z0-9_\u3040-\u30ff\u4e00-\u9fff-]+/g, '_')
    .replace(/^_+|_+$/g, '')

const FENCE_OPEN_RE = /^\s{0,3}(`{3,}|~{3,})/
const HEADING_RE = /^(#{2,4})\s+(.+?)(?:\s+#+)?\s*$/

// Extract h2/h3/h4 headings from a markdown body (body only: front matter is
// expected to be stripped by the caller). Headings inside fenced code blocks
// (``` or ~~~) are ignored. Ids are deterministic and unique within the
// document: the second occurrence of a slug gets a `_2` suffix, the third
// `_3`, and so on.
export const extractToc = (markdown: string): TocEntry[] => {
  const entries: TocEntry[] = []
  const seen = new Map<string, number>()
  let fence: { char: string; length: number } | undefined

  for (const line of markdown.split(/\r?\n/)) {
    const fenceMatch = FENCE_OPEN_RE.exec(line)

    if (fence) {
      if (
        fenceMatch &&
        fenceMatch[1][0] === fence.char &&
        fenceMatch[1].length >= fence.length
      ) {
        fence = undefined
      }
      continue
    }

    if (fenceMatch) {
      fence = { char: fenceMatch[1][0], length: fenceMatch[1].length }
      continue
    }

    const headingMatch = HEADING_RE.exec(line)
    if (!headingMatch) {
      continue
    }
    const level = headingMatch[1].length
    const raw = headingMatch[2].trim()
    const slug = headingSlug(raw)
    const count = seen.get(slug) ?? 0
    seen.set(slug, count + 1)

    entries.push({
      level,
      text: displayText(raw),
      rawText: raw,
      id: count === 0 ? slug : `${slug}_${count + 1}`,
    })
  }

  return entries
}
