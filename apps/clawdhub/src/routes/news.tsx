import { createFileRoute, Link } from '@tanstack/react-router'
import { getNanoHubSiteUrl } from '../lib/site'

export const Route = createFileRoute('/news')({
  head: () => {
    const url = `${getNanoHubSiteUrl()}/news`
    const title = 'OpenClawd News | Agent Staking, Dark Clawd, and Runtime Updates'
    const description =
      'Latest OpenClawd updates: Agent Staking Protocol on devnet, Dark Clawd npm package readiness, and Solana-native agent runtime work.'

    return {
      links: [{ rel: 'canonical', href: url }],
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: url },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
    }
  },
  component: NewsPage,
})

const NEWS = [
  {
    date: 'May 6, 2026',
    label: 'Protocol',
    title: 'OpenClawd Agent Staking Protocol is live on devnet',
    body:
      'The staking program now exposes a frontend-ready transaction surface for Metaplex Core agent assets. It initializes a global pool PDA, stakes by adding a frozen FreezeDelegate plugin, and unstakes by unfreezing then removing that plugin.',
    link: '/staking',
    cta: 'View staking route',
  },
  {
    date: 'May 6, 2026',
    label: 'Release',
    title: 'Dark Clawd npm package is publish-ready',
    body:
      '@openclawdsolana/dark-clawd packages the Bloomberg-style autonomous Solana intelligence TUI with dark-clawd and clawd-dark bin aliases. Dry-run packaging verified a 1.3 MB tarball with five release files.',
    link: 'https://github.com/x402agent/OpenClawd/tree/main/dark-clawd',
    cta: 'Open source',
    external: true,
  },
  {
    date: 'May 6, 2026',
    label: 'Runtime',
    title: 'OpenClawd Hub now documents the current agent economy surface',
    body:
      'The site now presents the runtime, Metaplex agent registration, staking, wallet-gated actions, skills, dashboards, and future reward indexing as one Solana-native agent economy.',
    link: '/about',
    cta: 'Read about OpenClawd',
  },
]

function NewsPage() {
  return (
    <main className="solana-legal-page">
      <section className="hero solana-legal-hero">
        <div className="hero-inner solana-legal-hero-inner">
          <div className="hero-copy">
            <span className="hero-badge">OpenClawd News</span>
            <h1 className="hero-title">
              Latest release notes.
              <span className="solana-legal-hero-accent"> Staking, npm, and runtime updates.</span>
            </h1>
            <p className="hero-subtitle">
              Current project updates for the OpenClawd Solana-native agent stack, including the
              new agent staking protocol and package release work.
            </p>
            <div className="solana-legal-meta-strip">
              <div className="solana-legal-meta-chip">
                <span>Latest update</span>
                <strong>May 6, 2026</strong>
              </div>
              <div className="solana-legal-meta-chip">
                <span>Primary route</span>
                <strong>/staking</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="grid">
          {NEWS.map((item) => (
            <article key={item.title} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <span className="tag solana-legal-tag">{item.label}</span>
                <span className="stat">{item.date}</span>
              </div>
              <h2 className="section-title" style={{ marginTop: 14, marginBottom: 10 }}>
                {item.title}
              </h2>
              <p className="section-subtitle">{item.body}</p>
              {item.external ? (
                <a href={item.link} target="_blank" rel="noreferrer" className="btn">
                  {item.cta}
                </a>
              ) : (
                <Link to={item.link as '/'} className="btn">
                  {item.cta}
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
