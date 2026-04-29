import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SOLANA_GREEN } from '../theme/tokens';

/** Drifting USDC plankton — cheap instanced points. */
export function Plankton({ count = 600 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = -6 + Math.random() * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      speeds[i] = 0.001 + Math.random() * 0.004;
    }
    return { positions, speeds };
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      let y = arr.array[idx + 1] as number;
      y += speeds[i];
      if (y > 8) y = -6;
      (arr.array as Float32Array)[idx + 1] = y;
      (arr.array as Float32Array)[idx] = (arr.array[idx] as number) + Math.sin(t * 0.5 + i) * 0.0015;
    }
    arr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={SOLANA_GREEN}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
