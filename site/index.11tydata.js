// Front-matter data for the home page: the infobox rows (Liquid cannot
// build arrays of objects inline) and the biography paragraphs as a
// pre-joined HTML block.

export default {
  eleventyComputed: {
    profileInfoboxRows: (data) => {
      const profile = data.site.profile
      const rows = [
        { label: 'Role', value: profile.role ?? '' },
        { label: 'Affiliation', value: profile.affiliationLong ?? '' },
        { label: 'Section', value: profile.section ?? '' },
      ]
      if (profile.contact) {
        rows.push({
          label: 'Contact',
          value: `<a class="external" href="mailto:${profile.contact}">${profile.contact}</a>`,
        })
      }
      return rows
    },
    bioContent: (data) =>
      (data.site.profile.bio?.en ?? '')
        .split('\n\n')
        .filter(Boolean)
        .map((paragraph) => `<p>${paragraph}</p>`)
        .join('\n'),
  },
}
