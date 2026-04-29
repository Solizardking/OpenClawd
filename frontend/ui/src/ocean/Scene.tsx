import React from 'react';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Floor } from './ocean/Floor';
import { Surface } from './ocean/Surface';
import { Plankton } from './ocean/Plankton';
import { LightShafts } from './ocean/LightShafts';
import { SolanaCore } from './chain/SolanaCore';
import { TxStreams } from './chain/TxStreams';
import { Colony } from './leviathans/Colony';

export function Scene() {
  return (
    <>
      <color attach="background" args={['#050818']} />
      <fog attach="fog" args={['#050818', 18, 70]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 20, 5]} intensity={0.8} color="#9945FF" castShadow />
      <directionalLight position={[-10, 8, -5]} intensity={0.4} color="#14F195" />

      <Stars radius={80} depth={50} count={1200} factor={3} fade speed={0.5} />

      <Floor />
      <Surface />
      <LightShafts />
      <Plankton count={500} />

      <SolanaCore />
      <TxStreams />
      <Colony />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.4}
        minDistance={6}
        maxDistance={45}
        enablePan={false}
      />

      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.4} luminanceSmoothing={0.4} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </>
  );
}
