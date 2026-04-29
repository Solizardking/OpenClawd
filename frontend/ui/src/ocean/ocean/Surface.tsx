import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SOLANA_PURPLE, DEEP_SEA } from '../theme/tokens';

/** A semi-transparent water surface high above. Subtle wave shader. */
export function Surface() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const shader = useMemo(() => ({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uPurple: { value: new THREE.Color(SOLANA_PURPLE) },
      uDeep: { value: new THREE.Color(DEEP_SEA) },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 p = position;
        p.z += sin(p.x * 0.6 + uTime * 0.6) * 0.3 + cos(p.y * 0.5 + uTime * 0.4) * 0.2;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uPurple;
      uniform vec3 uDeep;
      varying vec2 vUv;
      void main() {
        float r = length(vUv - vec2(0.5));
        float falloff = smoothstep(0.0, 0.6, r);
        vec3 col = mix(uPurple, uDeep, falloff);
        gl_FragColor = vec4(col, 0.18);
      }
    `,
  }), []);

  useFrame(({ clock }) => {
    if (matRef.current) (matRef.current.uniforms.uTime.value = clock.getElapsedTime());
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
      <planeGeometry args={[120, 120, 32, 32]} />
      <shaderMaterial ref={matRef} args={[shader]} />
    </mesh>
  );
}
