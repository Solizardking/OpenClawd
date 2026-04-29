import React, { useState } from 'react';
import { LOBSTER_RED, SOLANA_GREEN, SOLANA_PURPLE, STATUS_DIM } from '../theme/tokens';

interface Example {
  file: string;
  title: string;
  category: 'agents' | 'wallet' | 'trading' | 'payments' | 'research' | 'infra';
  desc: string;
  cmd: string;
}

export const EXAMPLES: Example[] = [
  {
    file: 'blockchain-buddies-demo.ts',
    title: 'Blockchain Buddies',
    category: 'agents',
    desc: 'Solana-native trading companions with unique wallets and trading styles.',
    cmd: 'npx tsx examples/blockchain-buddies-demo.ts',
  },
  {
    file: 'listen-wallet.ts',
    title: 'Listen Wallet',
    category: 'wallet',
    desc: 'Real-time wallet monitor — balance changes + parsed Helius tx history.',
    cmd: 'npx tsx examples/listen-wallet.ts <WALLET>',
  },
  {
    file: 'ooda-loop.ts',
    title: 'OODA Loop',
    category: 'trading',
    desc: 'One full Observe → Orient → Decide → Act → Learn cycle. No keys needed.',
    cmd: 'npx tsx examples/ooda-loop.ts',
  },
  {
    file: 'x402-solana.ts',
    title: 'x402 Solana',
    category: 'payments',
    desc: 'Solana USDC micropayments for agent API access. The 402 → pay → forward flow.',
    cmd: 'npx tsx examples/x402-solana.ts',
  },
  {
    file: 'auto-research-client.ts',
    title: 'AutoResearch',
    category: 'research',
    desc: 'Karpathy-style self-improving research Wiki API client.',
    cmd: 'npx tsx examples/auto-research-client.ts',
  },
  {
    file: 'lobster-trader.ts',
    title: 'Lobster Trader',
    category: 'trading',
    desc: 'pump.fun bonding curve math, graduation probability, trade simulation.',
    cmd: 'npx tsx examples/lobster-trader.ts',
  },
  {
    file: 'orchestrator-client.ts',
    title: 'Orchestrator',
    category: 'infra',
    desc: 'OpenClawd Orchestrator API: wallets, agent launches, MCP tools, Metaplex.',
    cmd: 'npx tsx examples/orchestrator-client.ts',
  },
  {
    file: 'clawd-wallet-demo.ts',
    title: 'Clawd Wallet SDK',
    category: 'wallet',
    desc: 'Privy-embedded Solana wallet + AgenticWallet (Grok 4.20) + SwapService.',
    cmd: 'npx tsx examples/clawd-wallet-demo.ts',
  },
  {
    file: 'x402-payment-demo.ts',
    title: 'x402 Agent Payments',
    category: 'payments',
    desc: '@openclawd/agents-x402 — agent-to-agent USDC micropayments on Solana.',
    cmd: 'npx tsx examples/x402-payment-demo.ts',
  },
];

const CAT_COLOR: Record<Example['category'], string> = {
  agents:  LOBSTER_RED,
  wallet:  SOLANA_GREEN,
  trading: '#FFD700',
  payments: SOLANA_PURPLE,
  research: '#FFA500',
  infra: '#9CA3AF',
};

export function Examples() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Example | null>(null);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'absolute',
          top: 16,
          right: 410,
          background: 'rgba(10,14,39,0.85)',
          border: `1px solid ${SOLANA_PURPLE}`,
          color: SOLANA_PURPLE,
          fontFamily: 'monospace',
          fontSize: 11,
          padding: '8px 12px',
          borderRadius: 4,
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      >
        📚 examples ({EXAMPLES.length})
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 56,
          right: 410,
          width: 360,
          maxHeight: '70vh',
          overflowY: 'auto',
          background: 'rgba(10,14,39,0.92)',
          border: `1px solid ${SOLANA_PURPLE}`,
          borderRadius: 8,
          padding: 12,
          fontFamily: 'monospace',
          fontSize: 11,
          color: '#fff',
          pointerEvents: 'auto',
        }}>
          <div style={{ color: SOLANA_PURPLE, fontWeight: 700, marginBottom: 6 }}>
            🦞  RUNNABLE EXAMPLES
          </div>
          <div style={{ color: STATUS_DIM, marginBottom: 8 }}>
            openclawd-framework/examples/
          </div>
          {EXAMPLES.map((e) => (
            <div
              key={e.file}
              onClick={() => setSelected(selected?.file === e.file ? null : e)}
              style={{
                marginBottom: 6,
                padding: 8,
                borderRadius: 4,
                background: selected?.file === e.file ? 'rgba(153,69,255,0.15)' : 'transparent',
                border: `1px solid ${selected?.file === e.file ? SOLANA_PURPLE : 'rgba(255,255,255,0.06)'}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>{e.title}</span>
                <span style={{ color: CAT_COLOR[e.category], fontSize: 10 }}>● {e.category}</span>
              </div>
              <div style={{ color: STATUS_DIM, fontSize: 10, marginTop: 2 }}>{e.desc}</div>
              {selected?.file === e.file && (
                <div style={{
                  marginTop: 6,
                  padding: 6,
                  background: 'rgba(20,241,149,0.06)',
                  border: '1px dashed #14F195',
                  borderRadius: 3,
                  color: SOLANA_GREEN,
                  fontSize: 11,
                  wordBreak: 'break-all',
                }}>$ {e.cmd}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
