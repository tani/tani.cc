import type { InferProps } from 'void'
import { defineHandler, defineHead } from 'void'
import { allPosts } from '../../src/lib/typst'
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
    content: post.content,
    toc: post.toc,
  }
})

export type Props = InferProps<typeof loader>

export const head = defineHead<Props>((_c, props) => ({
  title: `${props.post?.title ?? ''} - ${site.profile?.name ?? ''}`,
}))

export async function getPrerenderPaths() {
  return allPosts().map((post) => ({ slug: post.slug }))
}
