import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { SOLANA_GREEN, SOLANA_PURPLE, LOBSTER_RED } from '../theme/tokens';

/** The $CLAWD core — the mint at the center of the ocean. */
export function SolanaCore() {
  const ring = useRef<THREE.Mesh>(null);
  const orb = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring.current) ring.current.rotation.z = t * 0.3;
    if (orb.current) {
      const s = 1 + Math.sin(t * 1.2) * 0.05;
      orb.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Bloom core */}
      <mesh ref={orb}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial
          color={SOLANA_PURPLE}
          emissive={SOLANA_GREEN}
          emissiveIntensity={1.4}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      <pointLight color={SOLANA_GREEN} intensity={2.5} distance={20} />

      {/* Solana ring */}
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.04, 16, 64]} />
        <meshBasicMaterial color={SOLANA_GREEN} />
      </mesh>

      {/* Counter-rotating ring */}
      <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]}>
        <torusGeometry args={[1.9, 0.025, 12, 48]} />
        <meshBasicMaterial color={SOLANA_PURPLE} />
      </mesh>

      {/* $CLAWD label */}
      <Text
        position={[0, -2.3, 0]}
        fontSize={0.4}
        color={LOBSTER_RED}
        anchorX="center"
        anchorY="middle"
      >
        $CLAWD
      </Text>
      <Text
        position={[0, -2.7, 0]}
        fontSize={0.18}
        color={SOLANA_GREEN}
        anchorX="center"
        anchorY="middle"
      >
        8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump
      </Text>
    </group>
  );
}
