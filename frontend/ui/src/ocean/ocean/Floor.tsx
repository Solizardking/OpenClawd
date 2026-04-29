import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DEEP_SEA, SOLANA_GREEN, SOLANA_PURPLE } from '../theme/tokens';

/**
 * Animated ocean floor with caustics + Solana gradient.
 */
export function Floor() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const shader = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uPurple: { value: new THREE.Color(SOLANA_PURPLE) },
      uGreen: { value: new THREE.Color(SOLANA_GREEN) },
      uDeep: { value: new THREE.Color(DEEP_SEA) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorld;
      void main() {
        vUv = uv;
        vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uPurple;
      uniform vec3 uGreen;
      uniform vec3 uDeep;
      varying vec2 vUv;
      varying vec3 vWorld;

      // Cheap caustics — animated cosine bands
      float caustics(vec2 p, float t) {
        float a = sin(p.x * 4.0 + t * 0.6) * 0.5 + 0.5;
        float b = cos(p.y * 4.0 - t * 0.5) * 0.5 + 0.5;
        float c = sin((p.x + p.y) * 6.0 + t * 0.9) * 0.5 + 0.5;
        return pow(a * b * c, 1.5);
      }

      void main() {
        vec2 p = vWorld.xz * 0.05;
        float c = caustics(p, uTime);
        float radial = smoothstep(0.0, 60.0, length(vWorld.xz));
        vec3 base = mix(uPurple, uDeep, radial);
        vec3 col = base + uGreen * c * 0.35;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  }), []);

  useFrame(({ clock }) => {
    if (matRef.current) (matRef.current.uniforms.uTime.value = clock.getElapsedTime());
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -7, 0]} receiveShadow>
      <planeGeometry args={[200, 200, 64, 64]} />
      <shaderMaterial ref={matRef} args={[shader]} />
    </mesh>
  );
}
