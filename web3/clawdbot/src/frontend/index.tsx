import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const queryClient = new QueryClient();

interface OpenClawdConfig {
  agentId?: string;
  apiBase?: string;
  gatewayBase?: string;
  tokenMint?: string;
}

declare global {
  interface Window {
    OPENCLAWD_CONFIG?: OpenClawdConfig;
  }
}

const CLAWD_MINT = '8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump';

const capabilities = [
  { label: 'Solana RPC', value: 'Helius / mainnet', tone: 'green' },
  { label: 'DEX route', value: 'Jupiter ready', tone: 'purple' },
  { label: 'Market data', value: 'Birdeye optional', tone: 'cyan' },
  { label: 'Channel', value: 'Telegram bot', tone: 'orange' },
];

const setupSteps = [
  'Copy .env.example to .env and add provider keys',
  'Start read-only with HELIUS_API_KEY and BIRDEYE_API_KEY',
  'Add TELEGRAM_BOT_TOKEN when the channel is ready',
  'Add SOLANA_PRIVATE_KEY only after gated execution tests pass',
];

function shortId(value: string) {
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function ClawdBotDashboard() {
  const config = window.OPENCLAWD_CONFIG ?? {};
  const agentId = config.agentId ?? 'local-clawdbot';
  const apiBase = config.apiBase ?? 'http://localhost:3000';
  const gatewayBase = config.gatewayBase ?? 'https://solanaclawd.com/gateway';
  const tokenMint = config.tokenMint ?? CLAWD_MINT;

  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <main className="shell">
        <section className="hero" aria-label="ClawdBot status">
          <div className="hero-copy">
            <div className="eyebrow">$CLAWD starter template</div>
            <h1>ClawdBot</h1>
            <p>
              A Solana-native OpenClawd agent template for market monitoring, wallet-aware
              workflows, Telegram operations, and permission-gated trade execution.
            </p>
            <div className="hero-actions">
              <a className="button primary" href={apiBase}>
                Open API
              </a>
              <a className="button" href={gatewayBase}>
                Gateway
              </a>
            </div>
          </div>

          <div className="network-panel" aria-label="Network topology">
            <div className="core-node">
              <span>OpenClawd</span>
              <strong>{shortId(agentId)}</strong>
            </div>
            <div className="orbit orbit-a" />
            <div className="orbit orbit-b" />
            <div className="node node-a">Jupiter</div>
            <div className="node node-b">Helius</div>
            <div className="node node-c">Birdeye</div>
            <div className="node node-d">Telegram</div>
          </div>
        </section>

        <section className="status-grid" aria-label="Capabilities">
          {capabilities.map((item) => (
            <article className={`metric ${item.tone}`} key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        <section className="workspace">
          <div className="panel">
            <div className="panel-header">
              <span>Configuration</span>
              <strong>Public-safe defaults</strong>
            </div>
            <dl className="config-list">
              <div>
                <dt>Agent</dt>
                <dd>{agentId}</dd>
              </div>
              <div>
                <dt>Token mint</dt>
                <dd>{tokenMint}</dd>
              </div>
              <div>
                <dt>API base</dt>
                <dd>{apiBase}</dd>
              </div>
              <div>
                <dt>Gateway</dt>
                <dd>{gatewayBase}</dd>
              </div>
            </dl>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span>First run</span>
              <strong>Read-only first</strong>
            </div>
            <ol className="steps">
              {setupSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </QueryClientProvider>
  );
}

export interface AgentPanel {
  name: string;
  path: string;
  component: React.ComponentType<{ agentId: string }>;
  icon?: string;
  public?: boolean;
  shortLabel?: string;
}

const PanelComponent: React.FC<{ agentId: string }> = ({ agentId }) => <ClawdBotDashboard />;

export const panels: AgentPanel[] = [
  {
    name: 'ClawdBot',
    path: 'clawdbot',
    component: PanelComponent,
    icon: 'Bot',
    public: true,
    shortLabel: 'Bot',
  },
];

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<ClawdBotDashboard />);
}

export * from './utils';
