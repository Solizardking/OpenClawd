import { Link } from '@tanstack/react-router'
import { getSiteName } from '../lib/site'

export function Footer() {
  const siteName = getSiteName()
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-divider" aria-hidden="true" />
        <div className="site-footer-row">
          <div className="site-footer-copy">
            {siteName} · A{' '}
            <a href="https://openclawd.net" target="_blank" rel="noreferrer">
              OpenClawd
            </a>{' '}
            project · Powered by{' '}
            <a href="https://www.convex.dev" target="_blank" rel="noreferrer">
              Convex
            </a>{' '}
            ·{' '}
            <a
              href="https://github.com/x402agent/OpenClawd"
              target="_blank"
              rel="noreferrer"
            >
              Open source (MIT)
            </a>
            .
          </div>
          <div className="site-footer-legal">
            <Link to="/about">About</Link>
            <Link to="/news">News</Link>
            <Link to="/staking">Staking</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/copyright">Copyright</Link>
            <Link to="/license">License</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
