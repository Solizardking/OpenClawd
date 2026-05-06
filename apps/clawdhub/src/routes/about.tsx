import { createFileRoute, Link } from '@tanstack/react-router'
import { trackHubEvent } from '../lib/analytics'
import { getNanoHubSiteUrl } from '../lib/site'

export const Route = createFileRoute('/about')({
  head: () => {
    const url = `${getNanoHubSiteUrl()}/about`
    const title = 'About OpenClawd | Solana-Native Agent Infrastructure'
    const description =
      'OpenClawd is a Solana-native agent runtime with wallet control, Metaplex agent registration, staking primitives, skills, market data, and operator surfaces.'

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
  component: AboutPage,
})

const STACK = [
  ['Agent runtime', 'Terminal, gateway, mobile, extension, Telegram, dashboard, and TUI surfaces for local-first operation.'],
  ['Metaplex agents', 'Agent assets can be minted with Metaplex Core and registered through the Metaplex Agent Registry.'],
  ['Agent staking', 'Devnet staking locks Core agent transferability by adding a frozen FreezeDelegate plugin.'],
  ['Skill economy', 'OpenClawd Hub publishes versioned AgentSkills bundles that can be installed by compatible agent terminals.'],
  ['Operator data', 'Live Solana market views, wallet panels, tracker views, strategy builder, and risk-oriented command surfaces.'],
  ['Open source', 'MIT-licensed repository, public npm packages, setup guides, and deployable gateway services.'],
]

const INTEGRATION_POINTS = [
  'Agent minting via Metaplex Core',
  'Agent registration via Metaplex Agent Registry',
  'Staking state visible on /staking',
  'Wallet-gated agent actions',
  'Policy checks in the OpenClawd backend',
  'Staking status indexing for dashboards and future rewards',
  'Admin runbooks for emergency unlocks',
]

function AboutPage() {
  return (
    <main className="solana-legal-page">
      <section className="hero solana-legal-hero">
        <div className="hero-inner solana-legal-hero-inner">
          <div className="hero-copy">
            <span className="hero-badge">About OpenClawd</span>
            <h1 className="hero-title">
              Solana-native agent infrastructure.
              <span className="solana-legal-hero-accent"> Runtime, registry, staking, and skills.</span>
            </h1>
            <p className="hero-subtitle">
              OpenClawd is a control plane for autonomous Solana agents. It joins wallet control,
              Metaplex agent identity, skill distribution, market intelligence, and the new agent
              staking primitive into one operator-facing stack.
            </p>
            <div className="solana-legal-meta-strip">
              <div className="solana-legal-meta-chip">
                <span>Network</span>
                <strong>Solana devnet + mainnet-ready surfaces</strong>
              </div>
              <div className="solana-legal-meta-chip">
                <span>License</span>
                <strong>MIT</strong>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
              <Link
                to="/staking"
                className="btn btn-primary"
                onClick={() => trackHubEvent('about_cta_click', { cta: 'staking' })}
              >
                Open staking
              </Link>
              <Link
                to="/news"
                className="btn"
                onClick={() => trackHubEvent('about_cta_click', { cta: 'news' })}
              >
                Latest news
              </Link>
              <a
                href="https://github.com/x402agent/OpenClawd"
                target="_blank"
                rel="noreferrer"
                className="btn"
                onClick={() => trackHubEvent('about_cta_click', { cta: 'github' })}
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">What OpenClawd ships</h2>
        <p className="section-subtitle">
          The stack is built as a set of interoperable packages and routes rather than a single
          closed app.
        </p>
        <div className="grid">
          {STACK.map(([title, body]) => (
            <article key={title} className="card">
              <span className="tag solana-legal-tag">OpenClawd</span>
              <h3 style={{ marginTop: 10 }}>{title}</h3>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="card openclawd-home-cta" style={{ borderLeft: '3px solid #14f195' }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Agent Staking Protocol is live on devnet
            </h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              Agent owners can lock a Metaplex Core asset in place with a frozen FreezeDelegate
              plugin, then later unstake by unfreezing and removing that plugin. The asset remains
              in the owner wallet while the program tracks global staking state.
            </p>
          </div>
          <div className="openclawd-home-cta-actions">
            <Link to="/staking" className="btn btn-primary">
              Read staking docs
            </Link>
            <Link to="/setup/metaplex" className="btn">
              Metaplex setup
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">How staking fits in</h2>
        <div className="card solana-legal-card">
          <div className="solana-legal-list">
            {INTEGRATION_POINTS.map((item) => (
              <div key={item} className="solana-legal-list-item">
                <span className="solana-legal-bullet">&#x25C6;</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
