import Layout from '../src/components/Layout'
import { Section } from '../src/components/Section'
import type { Props } from './blog.server'

export default function BlogPage({ name, posts }: Props) {
  return (
    <Layout title="Blog" subtitle={name} catlinks={['Blog']}>
      {posts.length ? (
        <Section id="posts" title="Posts">
          <ol>
            {posts.map((post) => (
              <li key={post.slug}>
                <h3>
                  <a href={post.url}>{post.title}</a>
                </h3>
                {post.date ? (
                  <p>
                    <small>{post.date}</small>
                  </p>
                ) : null}
                {post.description ? <p>{post.description}</p> : null}
              </li>
            ))}
          </ol>
        </Section>
      ) : (
        <p>No posts yet.</p>
      )}
    </Layout>
  )
}
