import type { ReactNode } from 'react'

export function Infobox({
  image,
  caption,
  rows,
}: {
  image?: string
  caption?: string
  rows: { label: string; value: ReactNode }[]
}) {
  return (
    <aside className="infobox">
      {image ? <img className="infobox-image" src={image} alt={caption ?? ''} /> : null}
      {caption ? <div className="infobox-title">{caption}</div> : null}
      <table className="infobox-table">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </aside>
  )
}
