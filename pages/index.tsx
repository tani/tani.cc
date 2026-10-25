import { Infobox } from '../src/components/Infobox'
import Layout from '../src/components/Layout'
import { Section } from '../src/components/Section'
import type { Props } from './index.server'

export default function IndexPage({ profile, research }: Props) {
  const contact = profile?.contact
  const bio = profile?.bio?.en ?? ''
  const bioParagraphs = bio.split('\n\n').filter(Boolean)

  return (
    <Layout
      title={profile?.name ?? ''}
      subtitle={profile?.headline}
      catlinks={['People', 'Researchers', 'RIKEN']}
    >
      <Infobox
        image={profile?.image}
        caption={profile?.name}
        rows={[
          { label: 'Role', value: profile?.role ?? '' },
          { label: 'Affiliation', value: profile?.affiliationLong ?? '' },
          { label: 'Section', value: profile?.section ?? '' },
          {
            label: 'Contact',
            value: contact ? (
              <a className="external" href={`mailto:${contact}`}>
                {contact}
              </a>
            ) : (
              ''
            ),
          },
        ]}
      />

      {bioParagraphs.length ? (
        <Section id="bio" title="Biography">
          {bioParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </Section>
      ) : null}

      {research?.interests?.length ? (
        <Section id="research" title="Research interests">
          <ul>
            {research.interests.map((interest) => (
              <li key={interest}>{interest}</li>
            ))}
          </ul>
        </Section>
      ) : null}
    </Layout>
  )
}
