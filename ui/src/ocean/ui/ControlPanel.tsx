import React from 'react';
import { useColony } from '../stores/colony';

const btn: React.CSSProperties = {
  padding: '8px 12px',
  background: 'rgba(20,241,149,0.1)',
  border: '1px solid #14F195',
  color: '#14F195',
  fontFamily: 'monospace',
  fontSize: 11,
  cursor: 'pointer',
  borderRadius: 4,
  pointerEvents: 'auto',
};

const btnDanger: React.CSSProperties = { ...btn, borderColor: '#FF4500', color: '#FF4500', background: 'rgba(255,69,0,0.1)' };
const btnWarn: React.CSSProperties = { ...btn, borderColor: '#FFD700', color: '#FFD700', background: 'rgba(255,215,0,0.1)' };
const btnPurple: React.CSSProperties = { ...btn, borderColor: '#9945FF', color: '#9945FF', background: 'rgba(153,69,255,0.1)' };

export function ControlPanel() {
  const spawn = useColony((s) => s.spawn);
  const crashUsdc = useColony((s) => s.crashUsdc);
  const pumpClawd = useColony((s) => s.pumpClawd);
  const spawnling = useColony((s) => s.spawnling);
  const molt = useColony((s) => s.molt);
  const beach = useColony((s) => s.beach);
  const selectedId = useColony((s) => s.selectedId);
  const togglePause = useColony((s) => s.togglePause);
  const paused = useColony((s) => s.paused);

  return (
    <div style={{
      position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
      background: 'rgba(10,14,39,0.78)', padding: 10, borderRadius: 8,
      border: '1px solid #9945FF', maxWidth: '90vw',
    }}>
      <button style={btn} onClick={() => spawn(1)}>🥚 spawn 1</button>
      <button style={btn} onClick={() => spawn(10)}>🥚 spawn 10</button>
      <button style={btnPurple} onClick={pumpClawd}>🚀 pump $CLAWD</button>
      <button style={btnDanger} onClick={crashUsdc}>💥 crash USDC</button>
      <button
        style={selectedId ? btnWarn : { ...btnWarn, opacity: 0.4, cursor: 'not-allowed' }}
        onClick={() => selectedId && molt(selectedId)}
        disabled={!selectedId}
      >🐚 molt selected</button>
      <button
        style={selectedId ? btnPurple : { ...btnPurple, opacity: 0.4, cursor: 'not-allowed' }}
        onClick={() => selectedId && spawnling(selectedId)}
        disabled={!selectedId}
      >🦐 spawnling</button>
      <button
        style={selectedId ? btnDanger : { ...btnDanger, opacity: 0.4, cursor: 'not-allowed' }}
        onClick={() => selectedId && beach(selectedId)}
        disabled={!selectedId}
      >🪨 beach</button>
      <button style={btn} onClick={togglePause}>{paused ? '▶ resume' : '⏸ pause'}</button>
    </div>
  );
}
