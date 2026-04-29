import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Lobster } from './Lobster';
import { BeachedShell } from './BeachedShell';
import { useColony } from '../stores/colony';

export function Colony() {
  const leviathans = useColony((s) => s.leviathans);
  const selectedId = useColony((s) => s.selectedId);
  const select = useColony((s) => s.select);
  const tick = useColony((s) => s.tick);

  useFrame((_, dt) => tick(dt));

  return (
    <group>
      {leviathans.map((l) =>
        l.state === 'beached' && l.anim >= 1 ? (
          <BeachedShell key={l.id} lev={l} />
        ) : (
          <Lobster
            key={l.id}
            lev={l}
            selected={selectedId === l.id}
            onSelect={() => select(l.id === selectedId ? null : l.id)}
          />
        )
      )}
    </group>
  );
}
