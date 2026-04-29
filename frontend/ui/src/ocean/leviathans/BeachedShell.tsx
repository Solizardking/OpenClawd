import React from 'react';
import * as THREE from 'three';
import type { Leviathan } from '../stores/colony';

/** A static, dimmed husk on the seafloor. */
export function BeachedShell({ lev }: { lev: Leviathan }) {
  return (
    <group position={lev.pos} rotation={[Math.PI / 2 + Math.sin(lev.id.length) * 0.5, 0, 0]}>
      <mesh>
        <capsuleGeometry args={[0.32, 0.85, 6, 10]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} metalness={0.1} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
