import Layout from '../../src/components/Layout'
import { Toc } from '../../src/components/Toc'
import type { Props } from './[slug].server'

export default function BlogPostPage({ post, content, toc }: Props) {
  return (
    <Layout title={post.title} subtitle={post.date} catlinks={['Blog']}>
      {toc.length ? <Toc entries={toc} /> : null}
      <div className="void-article" dangerouslySetInnerHTML={{ __html: content }} />
    </Layout>
  )
}
