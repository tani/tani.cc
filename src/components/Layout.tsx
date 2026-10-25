import type { ReactNode } from 'react'
import { Link, useRouter } from '@void/react'
import { site } from '../lib/site'

const NAV_ITEMS: Array<{ href: string; label: string }> = [
  { href: '/', label: 'Home' },
  { href: '/profile', label: 'Profile' },
  { href: '/publications', label: 'Publications' },
  { href: '/blog', label: 'Blog' },
]

const REPO = 'https://github.com/tani/tani.cc'
const EDIT_HISTORY = `${REPO}/commits/main`
const DISCUSSION = `${REPO}/issues`

const repoFileForPath = (path: string): string => {
  if (path === '/') return 'pages/index.tsx'
  if (path === '/profile') return 'pages/profile.tsx'
  if (path === '/publications') return 'pages/publications.tsx'
  if (path === '/blog') return 'pages/blog.tsx'
  if (path.startsWith('/blog/')) return `posts${path.slice('/blog'.length)}.typ`
  return ''
}

export default function Layout({
  title,
  subtitle,
  catlinks,
  children,
}: {
  title: string
  subtitle?: string
  catlinks?: string[]
  children: ReactNode
}) {
  const { path } = useRouter()

  const file = repoFileForPath(path)
  const editHref = `${REPO}/blob/main/${file}`
  const profileLinks = site.profile?.links ?? []

  return (
    <div className="mw-page-container">
      <header className="site-header">
        <Link className="site-wordmark" href="/">
          tani.cc
        </Link>
        <span className="site-tagline">The Free Encyclopedia</span>
      </header>

      <div className="mw-body-grid">
        <nav className="mw-sidebar">
          <div className="sidebar-section">
            <h3>Navigation</h3>
            <ul>
              {NAV_ITEMS.map(({ href, label }) => {
                const active =
                  href === '/' ? path === '/' : path.startsWith(href)
                return (
                  <li key={href}>
                    <Link
                      className={active ? 'active' : undefined}
                      href={href}
                    >
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>Tools</h3>
            <ul>
              <li>
                <a className="external" href={editHref}>
                  Edit
                </a>
              </li>
              <li>
                <a className="external" href={EDIT_HISTORY}>
                  View history
                </a>
              </li>
              <li>
                <a className="external" href={DISCUSSION}>
                  Discussion
                </a>
              </li>
              {profileLinks.map((link, index) => (
                <li key={`${link.label ?? 'link'}-${index}`}>
                  <a className="external" href={link.url}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="mw-body">
          <div className="vector-tabs">
            <ul>
              <li className="selected">
                <span>Read</span>
              </li>
              <li>
                <a href={editHref}>Edit</a>
              </li>
              <li>
                <a href={EDIT_HISTORY}>View history</a>
              </li>
            </ul>
          </div>

          <h1 className="firstHeading">{title}</h1>
          {subtitle ? <div className="contentSub">{subtitle}</div> : null}
          <div className="mw-body-content">{children}</div>

          {catlinks && catlinks.length > 0 ? (
            <div className="catlinks">
              <b>Categories:</b> {catlinks.join(' | ')}
            </div>
          ) : null}

          <div className="printfooter">
            Retrieved from &quot;https://tani.cc{path}&quot;
          </div>
        </main>
      </div>

      <footer className="mw-footer">
        <p>
          This site uses Cloudflare Web Analytics. These services may collect
          data including IP addresses. Your use of this site constitutes
          consent.
        </p>
        <p>
          <a href={REPO}>Source</a> · Powered by{' '}
          <a className="external" href="https://void.cloud">
            Void
          </a>
        </p>
      </footer>
    </div>
  )
}
