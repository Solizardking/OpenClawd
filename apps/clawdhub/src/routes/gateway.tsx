import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/gateway')({
  component: GatewayRoute,
})

function GatewayRoute() {
  return (
    <main className="section">
      <div className="hero">
        <div className="hero-copy">
          <span className="hero-badge">solanaclawd.com / gateway</span>
          <h1 className="hero-title">OpenClawd Gateway</h1>
          <p className="hero-subtitle">
            The OpenClawd gateway bridges Seeker, terminal, and operator surfaces to the OpenClawd runtime.
          </p>
          <div className="hero-actions">
            <Link to="/console" className="btn btn-primary">
              🦞 Open Live Console
            </Link>
            <Link to="/setup/gateway" className="btn">
              Install Gateway
            </Link>
            <Link to="/hub" className="btn">
              Browse Hub
            </Link>
          </div>
          <p className="hero-subtitle" style={{ marginTop: 18, fontSize: 13.5 }}>
            <strong>Got the gateway running?</strong> Open the live console — token cards, wallet
            portfolios, and the agent runtime, all wired to your local <code>http://127.0.0.1:8788</code>{' '}
            (or any remote gateway URL).
          </p>
        </div>
      </div>
    </main>
  )
}
