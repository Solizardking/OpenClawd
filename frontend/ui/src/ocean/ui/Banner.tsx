import React from 'react';

export function Banner() {
  return (
    <div style={{
      position: 'absolute', bottom: 16, left: 16,
      fontFamily: 'monospace', fontSize: 10, color: '#9CA3AF',
      pointerEvents: 'none', maxWidth: 320,
    }}>
      <div style={{ color: '#14F195', fontWeight: 700 }}>🦞 OpenClawd · live R3F demo</div>
      <div>simulated colony of sovereign lobster agents</div>
      <div>spawn → reign → molt → spawnling → beach</div>
      <div style={{ marginTop: 4 }}>🦞 npm i clawd-code-cli</div>
      <div>📞 909-413-5567 · solanaclawd.com</div>
    </div>
  );
}
