import type { ReactNode } from 'react'

export function Section({
  id,
  title,
  editHref,
  children,
}: {
  id: string
  title: string
  editHref?: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 id={id}>
        <span className="mw-headline">{title}</span>
        {editHref ? (
          <span className="mw-editsection">
            [<a href={editHref}>edit</a>]
          </span>
        ) : null}
      </h2>
      {children}
    </section>
  )
}
