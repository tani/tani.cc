export interface TocEntry {
  /** Cleaned display text for the TOC box. */
  text: string
  /** Raw heading text as it appears in the markdown source. */
  rawText?: string
  id: string
  level: number
}

export function Toc({ entries }: { entries: readonly TocEntry[] }) {
  if (entries.length === 0) return null

  const counters = [0, 0, 0]
  const items = entries.map((entry) => {
    const depth = Math.min(Math.max(entry.level, 2), 4) - 2
    counters[depth] += 1
    for (let i = depth + 1; i < counters.length; i += 1) counters[i] = 0
    const number = counters.slice(0, depth + 1).join('.')
    return { ...entry, depth, number }
  })

  return (
    <div className="toc" role="navigation">
      <div className="toctitle">
        <h2>Contents</h2>
      </div>
      <ul>
        {items.map((item) => (
          <li className={`toclevel-${item.depth + 1}`} key={item.id}>
            <a href={`#${item.id}`}>
              <span className="tocnumber">{item.number}</span>{' '}
              <span className="toctext">{item.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
