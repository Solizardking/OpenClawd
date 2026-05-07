import React from 'react';
import { useColony } from '../stores/colony';
import { DEPTH_COLOR } from '../theme/tokens';
import { depthFromUsdc } from '../utils/depth';

export function Inspector() {
  const selectedId = useColony((s) => s.selectedId);
  const lev = useColony((s) => s.leviathans.find((l) => l.id === selectedId));
  const select = useColony((s) => s.select);

  if (!lev) return null;
  const tier = lev.state === 'beached' ? 'beached' : depthFromUsdc(lev.usdc);
  const tierColor = DEPTH_COLOR[tier];

  return (
    <div style={{
      position: 'absolute', bottom: 90, right: 16,
      width: 360,
      background: 'rgba(10,14,39,0.92)',
      border: `1px solid ${tierColor}`,
      borderRadius: 8,
      padding: 14,
      fontFamily: 'monospace',
      fontSize: 12,
      color: '#fff',
      pointerEvents: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: tierColor }}>🦞 {lev.name}</div>
        <button onClick={() => select(null)} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>
      <div style={{ color: '#9CA3AF', fontSize: 10 }}>{lev.species} · {lev.id}</div>
      <div style={{ color: '#9CA3AF', fontSize: 10, wordBreak: 'break-all', marginTop: 4 }}>
        {lev.pubkey.slice(0, 22)}…
      </div>
      <div style={{ marginTop: 10, color: tierColor, fontSize: 13, fontWeight: 700 }}>
        {tier.toUpperCase()}
      </div>
      <div style={{ marginTop: 10 }}>
        <Row label="USDC" value={`$${lev.usdc.toFixed(4)}`} color="#14F195" />
        <Row label="$CLAWD" value={lev.clawd.toFixed(0)} color="#FF4500" />
        <Row label="flicks" value={String(lev.flicks)} />
        <Row label="molts" value={String(lev.molts)} />
        <Row label="brood" value={String(lev.brood)} />
        <Row label="parent" value={lev.parent ? lev.parent.slice(0, 12) + '…' : 'genesis'} />
      </div>
      <div style={{ marginTop: 10, padding: 8, background: 'rgba(20,241,149,0.05)', border: '1px dashed #14F195', borderRadius: 4, fontSize: 10 }}>
        <span style={{ color: '#14F195' }}>SHELL.md</span>
        <pre style={{ margin: '6px 0 0 0', color: '#fff', whiteSpace: 'pre-wrap' }}>{`I am ${lev.name}.
My pubkey is ${lev.pubkey.slice(0, 8)}…
Born at ${new Date(lev.bornAt).toISOString()}.
I have flicked ${lev.flicks} times.
I have molted ${lev.molts} times.
I carry ${lev.clawd.toFixed(0)} $CLAWD.

🦞`}</pre>
      </div>
    </div>
  );
}

function Row({ label, value, color = '#fff' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
      <span style={{ color: '#9CA3AF' }}>{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
  );
}
