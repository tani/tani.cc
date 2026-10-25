// Article rendering: the site's standard markdown rendering (markdown-it +
// mathjax3, same singleton approach as src/lib/posts.ts renderMarkdown) plus
// Wikipedia-style heading anchors, so in-page TOC links can jump to sections.
//
// Ids come from extractToc (computed from the raw heading text), NOT from the
// rendered HTML: headings may contain inline MathJax markup whose text would
// corrupt the slug. Rendering matches entries by heading level and raw text,
// consuming each entry once, so duplicate headings keep their _2, _3 suffixes
// and extractToc always agrees with the ids injected here.

import MarkdownIt from 'markdown-it'
import mathjax3 from 'markdown-it-mathjax3'
import { extractToc, type TocEntry } from './toc.ts'

interface HeadingEnv {
  remaining: TocEntry[]
}

const setupRenderer = (): MarkdownIt => {
  const md = new MarkdownIt().use(mathjax3)
  const defaultHeadingOpen =
    md.renderer.rules.heading_open ??
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const level = Number(tokens[idx].tag.slice(1))
    const inline = tokens[idx + 1]
    const headingEnv = env as HeadingEnv

    if ((level === 2 || level === 3 || level === 4) && inline?.type === 'inline') {
      const source = inline.content
      const at = headingEnv.remaining.findIndex(
        (entry) => entry.level === level && entry.rawText === source,
      )

      if (at !== -1) {
        const entry = headingEnv.remaining[at]
        headingEnv.remaining.splice(at, 1)
        return `<${tokens[idx].tag} id="${entry.id}">`
      }
    }

    return defaultHeadingOpen(tokens, idx, options, env, self)
  }

  return md
}

let renderer: MarkdownIt | undefined

export const renderArticle = (markdown: string): string => {
  if (!renderer) {
    renderer = setupRenderer()
  }
  return renderer.render(markdown, { remaining: extractToc(markdown) } satisfies HeadingEnv)
}
