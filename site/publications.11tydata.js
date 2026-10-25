// Front-matter data for the publications page: the TOC box entries (one
// level-2 entry per publication category group, mirroring
// pages/publications.tsx) and the GitHub edit target for the section
// [edit] markers.

export default {
  eleventyComputed: {
    editPage: () => 'https://github.com/tani/tani.cc/blob/main/site/publications.liquid',
    publicationsTocEntries: (data) =>
      (data.site.preparedPublications.groups ?? []).map((group) => ({
        level: 2,
        text: group.category,
        rawText: group.category,
        id: group.id,
      })),
    toc: (data) =>
      (data.site.preparedPublications.groups ?? []).map((group) => ({
        level: 2,
        text: group.category,
        id: group.id,
      })),
  },
}
