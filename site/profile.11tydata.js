// Front-matter data for the profile page: builds the infobox rows and the
// HTML content of every CV section (mirroring pages/profile.tsx 1:1). Liquid
// cannot do conditional joins or nested object building, so the entry
// formatting lives here.

export default {
  eleventyComputed: {
    editPage: () => 'https://github.com/tani/tani.cc/blob/main/site/profile.liquid',
    profileInfoboxRows: (data) => {
      const profile = data.site.profile
      return [
        { label: 'Role', value: profile.role ?? '' },
        { label: 'Affiliation', value: profile.affiliationLong ?? '' },
        { label: 'Section', value: profile.section ?? '' },
      ]
    },
    researchInterestsContent: (data) => `<ul>\n${(data.site.research.interests ?? [])
      .map((interest) => `<li>${interest}</li>`)
      .join('\n')}\n</ul>`,
    educationContent: (data) => `<ol>\n${(data.site.cv.education ?? [])
      .map((entry) => {
        const department = entry.department ? ` (${entry.department})` : ''
        return `<li>${entry.degree} — ${entry.school}${department} ${entry.range}</li>`
      })
      .join('\n')}\n</ol>`,
    experienceContent: (data) => `<ul>\n${(data.site.cv.experience ?? [])
      .map((entry) => {
        const affiliation = entry.affiliation ? ` at ${entry.affiliation}` : ''
        const section = entry.section ? ` — ${entry.section}` : ''
        return `<li>${entry.role}${affiliation} ${entry.range}${section}</li>`
      })
      .join('\n')}\n</ul>`,
    projectsContent: (data) => `<ul>\n${(data.site.cv.projects ?? [])
      .map((entry) => {
        const system = entry.system ? ` (${entry.system})` : ''
        const category = entry.category ? `, ${entry.category}` : ''
        const amount = entry.amount ? ` — ${entry.amount}` : ''
        const url = entry.url ? ` <a class="external" href="${entry.url}">link</a>` : ''
        return `<li>${entry.title} — ${entry.organization}${system}${category} ${entry.range}${amount}${url}</li>`
      })
      .join('\n')}\n</ul>`,
    teachingContent: (data) => `<ul>\n${(data.site.cv.teaching ?? [])
      .map((entry) => {
        const institution = entry.institution ? ` at ${entry.institution}` : ''
        const items = (entry.items ?? []).length
          ? `\n  <ul>\n${(entry.items ?? [])
              .map((item) => {
                const period = item.period ? ` (${item.period})` : ''
                return `    <li>${item.course}${period}</li>`
              })
              .join('\n')}\n  </ul>`
          : ''
        return `<li>${entry.role}${institution}${items}</li>`
      })
      .join('\n')}\n</ul>`,
    awardsContent: (data) => `<ul>\n${(data.site.cv.awards ?? [])
      .map((entry) => {
        const organization = entry.organization ? ` — ${entry.organization}` : ''
        return `<li>${entry.name}${organization} (${entry.year})</li>`
      })
      .join('\n')}\n</ul>`,
    certificationsContent: (data) => `<ul>\n${(data.site.cv.certifications ?? [])
      .map((entry) => {
        const organization = entry.organization ? ` — ${entry.organization}` : ''
        return `<li>${entry.title}${organization} (${entry.year})</li>`
      })
      .join('\n')}\n</ul>`,
    financialSupportContent: (data) => `<ul>\n${(data.site.cv.financialSupport ?? [])
      .map((entry) => {
        const organization = entry.organization ? ` — ${entry.organization}` : ''
        const detail = entry.detail ? ` — ${entry.detail}` : ''
        return `<li>${entry.title}${organization} (${entry.range})${detail}</li>`
      })
      .join('\n')}\n</ul>`,
    physicalSkillsContent: (data) => `<ul>\n${(data.site.cv.physicalSkills ?? [])
      .map(
        (entry) =>
          `<li>${entry.title} — ${entry.field}, issued by ${entry.organization} ${entry.year}</li>`,
      )
      .join('\n')}\n</ul>`,
    socialContributionsContent: (data) => `<ul>\n${(data.site.cv.socialContributions ?? [])
      .map((entry) => {
        const organization = entry.organization ? ` — ${entry.organization}` : ''
        return `<li>${entry.title}${organization} (${entry.range})</li>`
      })
      .join('\n')}\n</ul>`,
    academicWorkContent: (data) => `<ul>\n${(data.site.cv.academicWork ?? [])
      .map((entry) => `<li>${entry.title} ${entry.year ?? ''}</li>`)
      .join('\n')}\n</ul>`,
    nonAcademicWorkContent: (data) => `<ul>\n${(data.site.cv.nonAcademicWork ?? [])
      .map((entry) => `<li>${entry.title} (${entry.date})</li>`)
      .join('\n')}\n</ul>`,
    acknowledgementsContent: (data) => `<ul>\n${(data.site.cv.acknowledgements ?? [])
      .map((entry) => {
        const detail = entry.detail ? ` — ${entry.detail}` : ''
        return `<li>${entry.title}${detail}</li>`
      })
      .join('\n')}\n</ul>`,
  },
}
