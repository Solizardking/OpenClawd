import { createFileRoute, Link } from '@tanstack/react-router'
import { getNanoHubSiteUrl } from '../lib/site'

export const Route = createFileRoute('/staking')({
  head: () => {
    const url = `${getNanoHubSiteUrl()}/staking`
    const title = 'OpenClawd Agent Staking Protocol | Devnet'
    const description =
      'OpenClawd Agent Staking is an Anchor program for locking Metaplex Core agent assets on Solana with a frozen FreezeDelegate plugin.'

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
  component: StakingPage,
})

const DEVNET = [
  ['Program ID', 'D5MLxrKAnppBVLuukKQzQGTMSfEwBqWCDPGAhGhthdLP'],
  ['Global pool PDA', 'EyDhP1HU3yqCmqCpKkQHFuX3wMD6sJF1kK8eeRwmTr1K'],
  ['MPL Core', 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'],
  ['Cluster', 'devnet'],
]

const DOES = [
  'Initializes a global staking pool PDA with an admin authority.',
  'Stakes a Metaplex Core asset by adding FreezeDelegate { frozen: true }.',
  'Unstakes by updating FreezeDelegate to frozen: false, then removing it.',
  'Tracks total_agents_staked in the global pool.',
  'Allows normal unstake by owner and emergency unstake by the configured admin.',
  'Provides CLI commands for init, stake, lock, unstake, and unlock.',
]

const DOES_NOT = [
  'It does not issue token rewards.',
  'It does not create per-position accounts.',
  'It does not enforce lock durations, tiers, or reward weights.',
  "It does not escrow the agent asset; the asset remains in the owner's wallet.",
]

const SAFETY = [
  'This is a lock and unlock primitive, not a yield product.',
  'The admin can emergency-unstake assets only through the program constraints.',
  'Use a dedicated deployer and program upgrade authority.',
  'Public RPC is not reliable enough for production.',
  'Keep the collection address pinned in frontend and backend config.',
  'Run anchor keys sync after changing the program keypair.',
]

function StakingPage() {
  return (
    <main className="solana-legal-page">
      <section className="hero solana-legal-hero">
        <div className="hero-inner solana-legal-hero-inner">
          <div className="hero-copy">
            <span className="hero-badge">OpenClawd Agent Staking Protocol</span>
            <h1 className="hero-title">
              Lock Solana-native agent assets.
              <span className="solana-legal-hero-accent"> Keep custody in the owner wallet.</span>
            </h1>
            <p className="hero-subtitle">
              OpenClawd Agent Staking is an Anchor program and frontend-ready transaction surface
              for staking Metaplex Core agent assets on Solana. It locks transferability by adding
              a frozen FreezeDelegate plugin, then later unstakes by unfreezing and removing it.
            </p>
            <div className="solana-legal-meta-strip">
              <div className="solana-legal-meta-chip">
                <span>Cluster</span>
                <strong>devnet</strong>
              </div>
              <div className="solana-legal-meta-chip">
                <span>Frontend route</span>
                <strong>/staking</strong>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
              <a
                href="https://explorer.solana.com/address/D5MLxrKAnppBVLuukKQzQGTMSfEwBqWCDPGAhGhthdLP?cluster=devnet"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                View program
              </a>
              <Link to="/setup/metaplex" className="btn">
                Metaplex setup
              </Link>
              <Link to="/about" className="btn">
                About OpenClawd
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Live devnet deployment</h2>
        <div className="grid">
          {DEVNET.map(([label, value]) => (
            <article key={label} className="card">
              <span className="tag solana-legal-tag">{label}</span>
              <p className="section-subtitle" style={{ marginTop: 12, wordBreak: 'break-all' }}>
                <code>{value}</code>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="card openclawd-home-cta" style={{ borderLeft: '3px solid #14f195' }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Frontend transaction surface
            </h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              The site builds wallet-signed transactions for initialize, stakeAgent, and
              unstakeAgent. It also reads the global pool PDA and inspects the Core asset
              FreezeDelegate state.
            </p>
          </div>
          <div className="openclawd-home-cta-actions">
            <a href="#stake-flow" className="btn btn-primary">
              User flow
            </a>
            <a href="#admin-flow" className="btn">
              Admin flow
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="grid">
          <InfoList title="What it does" tag="Scope" items={DOES} />
          <InfoList title="What it does not do yet" tag="Future layers" items={DOES_NOT} />
        </div>
      </section>

      <section className="section" id="stake-flow">
        <h2 className="section-title">User flow</h2>
        <div className="card solana-legal-card">
          <div className="solana-legal-list">
            {[
              'Connect a Solana wallet.',
              'Paste a Metaplex Core agent asset address.',
              'Paste or preconfigure the agent collection address.',
              'Inspect the asset to confirm owner, collection, and freeze status.',
              'Click stake to add the frozen FreezeDelegate.',
              'Click unstake to unfreeze and remove the delegate.',
            ].map((item) => (
              <div key={item} className="solana-legal-list-item">
                <span className="solana-legal-bullet">&#x25C6;</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="admin-flow">
        <h2 className="section-title">Admin recovery flow</h2>
        <div className="card solana-legal-card">
          <div className="solana-legal-list">
            {[
              'Connect the admin wallet.',
              'Paste the asset address and collection.',
              'Paste the real asset owner into the owner override field.',
              'Submit unstake.',
            ].map((item) => (
              <div key={item} className="solana-legal-list-item">
                <span className="solana-legal-bullet">&#x25C6;</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Safety notes</h2>
        <InfoList title="Mainnet gate" tag="Safety" items={SAFETY} />
      </section>
    </main>
  )
}

function InfoList({ title, tag, items }: { title: string; tag: string; items: string[] }) {
  return (
    <article className="card solana-legal-card">
      <span className="tag solana-legal-tag">{tag}</span>
      <h2 className="section-title" style={{ marginTop: 12, marginBottom: 12 }}>
        {title}
      </h2>
      <div className="solana-legal-list">
        {items.map((item) => (
          <div key={item} className="solana-legal-list-item">
            <span className="solana-legal-bullet">&#x25C6;</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </article>
  )
}
