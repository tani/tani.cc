import { Infobox } from '../src/components/Infobox'
import Layout from '../src/components/Layout'
import { Section } from '../src/components/Section'
import type { Props } from './profile.server'

const EDIT_PAGE = 'https://github.com/tani/tani.cc/blob/main/pages/profile.tsx'

export default function ProfilePage({ profile, research, cv }: Props) {
  const name = profile?.name ?? ''
  const role = profile?.role ?? ''
  const affiliationLong = profile?.affiliationLong ?? ''

  return (
    <Layout
      title={name}
      subtitle={role && affiliationLong ? `${role}, ${affiliationLong}` : role || affiliationLong}
      catlinks={['People', 'Researchers', 'CV']}
    >
      <Infobox
        image={profile?.image}
        caption={name}
        rows={[
          { label: 'Role', value: role },
          { label: 'Affiliation', value: affiliationLong },
          { label: 'Section', value: profile?.section ?? '' },
        ]}
      />

      {research?.interests?.length ? (
        <Section id="research-interests" title="Research interests" editHref={EDIT_PAGE}>
          <ul>
            {research.interests.map((interest) => (
              <li key={interest}>{interest}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      {research?.areas?.length ? (
        <Section id="research-areas" title="Research areas" editHref={EDIT_PAGE}>
          <table className="wikitable">
            <thead>
              <tr>
                <th>Discipline</th>
                <th>Field</th>
                <th>Keywords</th>
              </tr>
            </thead>
            <tbody>
              {research.areas.map((area, index) => (
                <tr key={index}>
                  <td>{area.discipline}</td>
                  <td>{area.field}</td>
                  <td>{area.keywords}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      ) : null}

      {cv?.education?.length ? (
        <Section id="education" title="Education" editHref={EDIT_PAGE}>
          <ol>
            {cv.education.map((entry, index) => (
              <li key={index}>
                {entry.degree} — {entry.school}
                {entry.department ? ` (${entry.department})` : ''} {entry.range}
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {cv?.experience?.length ? (
        <Section id="experience" title="Experience" editHref={EDIT_PAGE}>
          <ul>
            {cv.experience.map((entry, index) => (
              <li key={index}>
                {entry.role}
                {entry.affiliation ? ` at ${entry.affiliation}` : ''} {entry.range}
                {entry.section ? ` — ${entry.section}` : ''}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {cv?.projects?.length ? (
        <Section id="projects-grants" title="Projects & grants" editHref={EDIT_PAGE}>
          <ul>
            {cv.projects.map((entry, index) => (
              <li key={index}>
                {entry.title} — {entry.organization}
                {entry.system ? ` (${entry.system})` : ''}
                {entry.category ? `, ${entry.category}` : ''} {entry.range}
                {entry.amount ? ` — ${entry.amount}` : ''}
                {entry.url ? (
                  <>
                    {' '}
                    <a className="external" href={entry.url}>
                      link
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {cv?.teaching?.length ? (
        <Section id="teaching" title="Teaching" editHref={EDIT_PAGE}>
          <ul>
            {cv.teaching.map((entry, index) => (
              <li key={index}>
                {entry.role}
                {entry.institution ? ` at ${entry.institution}` : ''}
                {entry.items?.length ? (
                  <ul>
                    {entry.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        {item.course}
                        {item.period ? ` (${item.period})` : ''}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {cv?.awards?.length ? (
        <Section id="awards" title="Awards" editHref={EDIT_PAGE}>
          <ul>
            {cv.awards.map((entry, index) => (
              <li key={index}>
                {entry.name}
                {entry.organization ? ` — ${entry.organization}` : ''} ({entry.year})
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {cv?.certifications?.length ? (
        <Section id="certifications" title="Certifications" editHref={EDIT_PAGE}>
          <ul>
            {cv.certifications.map((entry, index) => (
              <li key={index}>
                {entry.title}
                {entry.organization ? ` — ${entry.organization}` : ''} ({entry.year})
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {cv?.financialSupport?.length ? (
        <Section id="financial-support" title="Financial support" editHref={EDIT_PAGE}>
          <ul>
            {cv.financialSupport.map((entry, index) => (
              <li key={index}>
                {entry.title}
                {entry.organization ? ` — ${entry.organization}` : ''} ({entry.range})
                {entry.detail ? ` — ${entry.detail}` : ''}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {cv?.physicalSkills?.length ? (
        <Section id="physical-skills" title="Physical skills" editHref={EDIT_PAGE}>
          <ul>
            {cv.physicalSkills.map((entry, index) => (
              <li key={index}>
                {entry.title} — {entry.field}, issued by {entry.organization} {entry.year}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {cv?.socialContributions?.length ? (
        <Section id="social-contributions" title="Social contributions" editHref={EDIT_PAGE}>
          <ul>
            {cv.socialContributions.map((entry, index) => (
              <li key={index}>
                {entry.title}
                {entry.organization ? ` — ${entry.organization}` : ''} ({entry.range})
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {cv?.academicWork?.length ? (
        <Section id="academic-work" title="Academic work" editHref={EDIT_PAGE}>
          <ul>
            {cv.academicWork.map((entry, index) => (
              <li key={index}>
                {entry.title} {entry.year}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {cv?.nonAcademicWork?.length ? (
        <Section id="non-academic-work" title="Non-academic work" editHref={EDIT_PAGE}>
          <ul>
            {cv.nonAcademicWork.map((entry, index) => (
              <li key={index}>
                {entry.title} ({entry.date})
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {cv?.acknowledgements?.length ? (
        <Section id="acknowledgements" title="Acknowledgements" editHref={EDIT_PAGE}>
          <ul>
            {cv.acknowledgements.map((entry, index) => (
              <li key={index}>
                {entry.title}
                {entry.detail ? ` — ${entry.detail}` : ''}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </Layout>
  )
}
