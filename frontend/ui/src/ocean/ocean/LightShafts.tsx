import React from 'react';
import { SOLANA_GREEN, SOLANA_PURPLE } from '../theme/tokens';

/** Volumetric-ish light shafts faked with translucent cones. */
export function LightShafts() {
  return (
    <group>
      {[0, 1, 2, 3].map((i) => {
        const x = (i - 1.5) * 6;
        return (
          <mesh key={i} position={[x, 4, (i % 2 === 0 ? -3 : 3)]} rotation={[0.1, i * 0.2, 0]}>
            <coneGeometry args={[1.5, 12, 16, 1, true]} />
            <meshBasicMaterial
              color={i % 2 ? SOLANA_GREEN : SOLANA_PURPLE}
              transparent
              opacity={0.05}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
