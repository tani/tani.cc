// Front-matter data for paginated blog post pages. The TOC must be passed to
// the wiki layout as a real array (not a stringified one — Liquid front
// matter values are not evaluated), so it is computed here from the
// pagination alias. `post` is available on pagination data pages via
// `pagination.resources[0]` equivalent: Eleventy exposes the aliased item
// under the pagination alias name in the data cascade.
export default {
  eleventyComputed: {
    toc: (data) => {
      const post = data.post ?? data.pagination?.items?.[0]
      return (post?.toc ?? []).map((entry) => ({
        level: entry.level,
        text: entry.text,
        id: entry.id,
      }))
    },
  },
}
