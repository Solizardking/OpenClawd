import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import { Hud } from './ui/Hud';
import { Console } from './ui/Console';
import { ControlPanel } from './ui/ControlPanel';
import { Inspector } from './ui/Inspector';
import { Banner } from './ui/Banner';
import { Examples } from './ui/Examples';

export function App() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ position: [0, 6, 22], fov: 55 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>
      <Hud />
      <Console />
      <Inspector />
      <ControlPanel />
      <Examples />
      <Banner />
    </div>
  );
}
