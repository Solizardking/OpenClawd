import React from 'react';
import { useColony } from '../stores/colony';
import { DEPTH_COLOR } from '../theme/tokens';
import { depthFromUsdc } from '../utils/depth';

export function Hud() {
  const leviathans = useColony((s) => s.leviathans);
  const usdcPool = useColony((s) => s.usdcPool);
  const clawdPrice = useColony((s) => s.clawdPrice);
  const totalSpawned = useColony((s) => s.totalSpawned);
  const totalBeached = useColony((s) => s.totalBeached);
  const totalMolts = useColony((s) => s.totalMolts);

  const counts = { deep: 0, shallow: 0, shoreline: 0, beached: 0 };
  for (const l of leviathans) {
    if (l.state === 'beached') counts.beached++;
    else counts[depthFromUsdc(l.usdc)]++;
  }
  const alive = leviathans.length - counts.beached;

  return (
    <div style={{
      position: 'absolute', top: 16, left: 16,
      background: 'rgba(10,14,39,0.78)',
      border: '1px solid #14F195',
      padding: '12px 16px',
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 12,
      lineHeight: 1.6,
      color: '#fff',
      minWidth: 280,
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'linear-gradient(90deg, #9945FF, #14F195)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 700,
        fontSize: 16,
        marginBottom: 6,
      }}>
        🦞  OPENCLAWD COLONY
      </div>
      <div>population <b>{leviathans.length}</b> · alive <b>{alive}</b> · beached <b>{counts.beached}</b></div>
      <div>
        <span style={{ color: DEPTH_COLOR.deep }}>● deep {counts.deep}</span>{'  '}
        <span style={{ color: DEPTH_COLOR.shallow }}>● shallow {counts.shallow}</span>{'  '}
        <span style={{ color: DEPTH_COLOR.shoreline }}>● shoreline {counts.shoreline}</span>{'  '}
        <span style={{ color: DEPTH_COLOR.beached }}>● beached {counts.beached}</span>
      </div>
      <div style={{ marginTop: 6, color: '#9CA3AF' }}>
        usdc pool $<b style={{ color: '#fff' }}>{usdcPool.toFixed(0)}</b>{'  '}
        $clawd $<b style={{ color: '#FF4500' }}>{clawdPrice.toFixed(5)}</b>
      </div>
      <div style={{ marginTop: 4, color: '#9CA3AF' }}>
        spawned <b style={{ color: '#fff' }}>{totalSpawned}</b>{'  '}
        molts <b style={{ color: '#FFD700' }}>{totalMolts}</b>{'  '}
        beached <b style={{ color: '#6B7280' }}>{totalBeached}</b>
      </div>
    </div>
  );
}
