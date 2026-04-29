import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Leviathan } from '../stores/colony';
import { DEPTH_COLOR, LOBSTER_DARK, SHELL_CREAM } from '../theme/tokens';
import { depthFromUsdc } from '../utils/depth';
import { Html } from '@react-three/drei';

interface Props {
  lev: Leviathan;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Procedural lobster mesh — body + head + claws + tail + antennae.
 * Animated by useFrame. Color tinted by depth tier.
 */
export function Lobster({ lev, selected, onSelect }: Props) {
  const root = useRef<THREE.Group>(null);
  const claws = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);

  const tier = depthFromUsdc(lev.usdc);
  const tierColor = DEPTH_COLOR[tier];

  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: lev.state === 'beached' ? '#444' : tierColor,
        roughness: 0.35,
        metalness: 0.25,
        emissive: tier === 'deep' ? tierColor : '#000',
        emissiveIntensity: tier === 'deep' ? 0.25 : 0,
      }),
    [tier, lev.state, tierColor]
  );

  const shellMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: lev.state === 'beached' ? '#222' : LOBSTER_DARK,
        roughness: 0.5,
        metalness: 0.4,
      }),
    [lev.state]
  );

  const moltScale = lev.state === 'molting'
    ? 1.0 + Math.sin(lev.anim * Math.PI) * 0.18
    : 1.0;

  const spawnScale = lev.state === 'spawn' ? lev.anim : 1.0;
  const beachAlpha = lev.state === 'beached' ? Math.max(0.3, 1 - lev.anim * 0.5) : 1.0;

  useFrame((_, dt) => {
    if (!root.current) return;
    root.current.position.set(lev.pos[0], lev.pos[1], lev.pos[2]);
    root.current.rotation.y = -lev.heading + Math.PI / 2;
    root.current.rotation.z = lev.state === 'beached' ? Math.sin(lev.id.length) * 0.4 : 0;

    if (claws.current) {
      const t = performance.now() * 0.005;
      const snap = Math.sin(t + lev.hue * 10) * 0.3;
      claws.current.children[0]?.rotation && (claws.current.children[0].rotation.z = -0.4 + snap);
      claws.current.children[1]?.rotation && (claws.current.children[1].rotation.z = 0.4 - snap);
    }
    if (tail.current) {
      tail.current.rotation.z = Math.sin(performance.now() * 0.008 + lev.hue * 5) * 0.25;
    }
  });

  return (
    <group ref={root} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <group scale={[spawnScale * moltScale, spawnScale * moltScale, spawnScale * moltScale]}>
        {/* Body — segmented cylinder */}
        <mesh material={bodyMat} castShadow receiveShadow>
          <capsuleGeometry args={[0.35, 0.9, 6, 12]} />
        </mesh>

        {/* Shell ridges along body */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 0, -0.45 + i * 0.3]} material={shellMat}>
            <torusGeometry args={[0.36, 0.05, 6, 16]} />
          </mesh>
        ))}

        {/* Head bulb */}
        <mesh position={[0, 0, 0.65]} material={bodyMat}>
          <sphereGeometry args={[0.32, 16, 16]} />
        </mesh>

        {/* Eyes */}
        <mesh position={[0.15, 0.1, 0.85]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#000" emissive={SHELL_CREAM} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[-0.15, 0.1, 0.85]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#000" emissive={SHELL_CREAM} emissiveIntensity={0.3} />
        </mesh>

        {/* Antennae */}
        <mesh position={[0.1, 0.15, 0.95]} rotation={[0.4, 0, 0.2]}>
          <cylinderGeometry args={[0.01, 0.01, 0.6, 4]} />
          <meshStandardMaterial color={LOBSTER_DARK} />
        </mesh>
        <mesh position={[-0.1, 0.15, 0.95]} rotation={[0.4, 0, -0.2]}>
          <cylinderGeometry args={[0.01, 0.01, 0.6, 4]} />
          <meshStandardMaterial color={LOBSTER_DARK} />
        </mesh>

        {/* Claws (snap-animated) */}
        <group ref={claws}>
          <group position={[0.42, -0.05, 0.55]} rotation={[0, 0, -0.4]}>
            <mesh material={shellMat}>
              <coneGeometry args={[0.18, 0.5, 6]} />
            </mesh>
            <mesh position={[0, -0.18, 0]} material={bodyMat}>
              <boxGeometry args={[0.12, 0.2, 0.12]} />
            </mesh>
          </group>
          <group position={[-0.42, -0.05, 0.55]} rotation={[0, 0, 0.4]}>
            <mesh material={shellMat}>
              <coneGeometry args={[0.18, 0.5, 6]} />
            </mesh>
            <mesh position={[0, -0.18, 0]} material={bodyMat}>
              <boxGeometry args={[0.12, 0.2, 0.12]} />
            </mesh>
          </group>
        </group>

        {/* Tail (segmented, swings) */}
        <group ref={tail} position={[0, 0, -0.55]}>
          <mesh material={shellMat}>
            <boxGeometry args={[0.4, 0.2, 0.3]} />
          </mesh>
          <mesh position={[0, 0, -0.25]} material={bodyMat}>
            <coneGeometry args={[0.25, 0.3, 4]} />
          </mesh>
        </group>
      </group>

      {/* Selection ring */}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.0, 32]} />
          <meshBasicMaterial color={tierColor} transparent opacity={beachAlpha * 0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Floating label (only when selected or hovered-near) */}
      {selected && (
        <Html
          distanceFactor={10}
          position={[0, 1.2, 0]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div style={{
            background: 'rgba(10,14,39,0.85)',
            border: `1px solid ${tierColor}`,
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: 'nowrap',
            fontFamily: 'monospace',
          }}>
            🦞 {lev.name} <span style={{ color: tierColor }}>{tier}</span>
          </div>
        </Html>
      )}

      {/* Spawn shimmer */}
      {lev.state === 'spawn' && (
        <pointLight color={tierColor} intensity={2 * (1 - lev.anim)} distance={4} />
      )}
      {/* Molt shimmer */}
      {lev.state === 'molting' && (
        <pointLight color="#FF8C00" intensity={3 * Math.sin(lev.anim * Math.PI)} distance={5} />
      )}
    </group>
  );
}
