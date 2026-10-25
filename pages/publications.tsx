import Layout from '../src/components/Layout'
import { Section } from '../src/components/Section'
import { Toc } from '../src/components/Toc'
import type { Props } from './publications.server'

export default function PublicationsPage({ name, publications }: Props) {
  const groups = publications.groups

  return (
    <Layout title="Publications" subtitle={name} catlinks={['Publications']}>
      {groups.length ? (
        <>
          <Toc
            entries={groups.map((group) => ({
              level: 2,
              text: group.category,
              rawText: group.category,
              id: group.id,
            }))}
          />
          {groups.map((group) => (
            <Section
              key={group.id}
              id={group.id}
              title={group.category}
              editHref="https://github.com/tani/tani.cc/blob/main/pages/publications.tsx"
            >
              <ol>
                {group.items.map((item, index) => (
                  <li key={index}>
                    <div>
                      <b>{item.title}</b>
                    </div>
                    {item.authorsText ? <div>{item.authorsText}</div> : null}
                    {item.metaText ? (
                      <div>
                        <small>{item.metaText}</small>
                      </div>
                    ) : null}
                    {item.hasLinks ? (
                      <div>
                        {item.url ? (
                          <a className="external" href={item.url}>
                            URL
                          </a>
                        ) : null}
                        {item.archive ? <span>{item.archive}</span> : null}
                        {item.field ? <span>{item.field}</span> : null}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            </Section>
          ))}
        </>
      ) : (
        <p>No publications listed.</p>
      )}
    </Layout>
  )
}
