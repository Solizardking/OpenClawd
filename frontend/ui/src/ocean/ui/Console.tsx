import React from 'react';
import { useColony, type LifeEvent } from '../stores/colony';

const KIND_COLOR: Record<LifeEvent['kind'], string> = {
  spawn: '#14F195',
  spawnling: '#9945FF',
  molt: '#FFD700',
  beach: '#FF4500',
  flick: '#9CA3AF',
  tx: '#FFA500',
};

export function Console() {
  const events = useColony((s) => s.events);

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      width: 380,
      maxHeight: '60vh',
      overflow: 'hidden',
      background: 'rgba(10,14,39,0.78)',
      border: '1px solid #9945FF',
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 11,
      color: '#fff',
      padding: 10,
      pointerEvents: 'none',
    }}>
      <div style={{ color: '#9945FF', fontWeight: 700, marginBottom: 6 }}>📡  LIFE EVENTS</div>
      <div style={{ overflowY: 'auto', maxHeight: 'calc(60vh - 30px)' }}>
        {events.slice(0, 60).map((e) => {
          const t = new Date(e.ts);
          const ts = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
          return (
            <div key={e.id} style={{ padding: '2px 0' }}>
              <span style={{ color: '#6B7280' }}>{ts} </span>
              <span style={{ color: KIND_COLOR[e.kind] }}>{e.kind.padEnd(9)}</span>
              <span>{e.msg}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
