import type { InferProps } from 'void'
import { defineHandler, defineHead } from 'void'
import { allPosts, postSlugs } from '../../src/lib/posts'
import { extractToc } from '../../src/lib/toc.ts'
import { renderArticle } from '../../src/lib/markdown.ts'
import { site } from '../../src/lib/site'

export const loader = defineHandler(async (c) => {
  const slug = c.req.param('slug')
  const post = allPosts().find((candidate) => candidate.slug === slug)

  if (!post) {
    return c.text('Not Found', 404)
  }

  return {
    post: {
      slug: post.slug,
      url: post.url,
      title: post.title,
      date: post.date,
      description: post.description,
    },
    content: renderArticle(post.body),
    toc: extractToc(post.body),
  }
})

export type Props = InferProps<typeof loader>

export const head = defineHead<Props>((_c, props) => ({
  title: `${props.post?.title ?? ''} - ${site.profile?.name ?? ''}`,
}))

export async function getPrerenderPaths() {
  return postSlugs().map((slug) => ({ slug }))
}
