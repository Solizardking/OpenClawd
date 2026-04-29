import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useColony } from '../stores/colony';
import { SOLANA_GREEN } from '../theme/tokens';

/**
 * Particle stream from each living leviathan to the SolanaCore origin.
 * Visualises pulse / tx activity.
 */
export function TxStreams() {
  const leviathans = useColony((s) => s.leviathans);
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds, owners } = useMemo(() => {
    const PER = 6;
    const total = 60 * PER; // up to 60 leviathans × PER particles
    const pos = new Float32Array(total * 3);
    const sp = new Float32Array(total);
    const own = new Uint16Array(total);
    for (let i = 0; i < total; i++) {
      sp[i] = 0.005 + Math.random() * 0.02;
    }
    return { positions: pos, speeds: sp, owners: own };
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const data = arr.array as Float32Array;
    const PER = 6;
    for (let i = 0; i < leviathans.length && i < 60; i++) {
      const l = leviathans[i];
      if (l.state !== 'alive') continue;
      for (let j = 0; j < PER; j++) {
        const idx = (i * PER + j) * 3;
        // progress 0..1 along the line from leviathan → core
        let t = (data[idx] || 0) + speeds[i * PER + j];
        if (t > 1) t = 0;
        data[idx] = t;
        data[idx + 1] = (1 - t);
        data[idx + 2] = 0;
      }
    }
    arr.needsUpdate = true;
  });

  // We render two passes: invisible storage for `t` + a CustomGeom for actual lines.
  // Simpler: re-derive positions per frame.

  return (
    <group>
      {leviathans.slice(0, 60).map((l, i) => (
        l.state === 'alive' ? <Stream key={l.id} from={l.pos} /> : null
      ))}
    </group>
  );
}

function Stream({ from }: { from: [number, number, number] }) {
  const ref = useRef<THREE.Points>(null);
  const PER = 4;
  const positions = useMemo(() => new Float32Array(PER * 3), []);
  const offsets = useMemo(() => Array.from({ length: PER }, (_, i) => i / PER), []);

  useFrame(() => {
    if (!ref.current) return;
    const t = (performance.now() % 2000) / 2000;
    for (let i = 0; i < PER; i++) {
      const p = (offsets[i] + t) % 1;
      positions[i * 3] = from[0] * (1 - p);
      positions[i * 3 + 1] = from[1] * (1 - p);
      positions[i * 3 + 2] = from[2] * (1 - p);
    }
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    (attr.array as Float32Array).set(positions);
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PER}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color={SOLANA_GREEN}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
