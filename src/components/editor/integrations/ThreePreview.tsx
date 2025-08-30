// src/components/editor/integrations/ThreePreview.tsx
'use client';
import React, { useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

function PlaneWithTexture({ url }: { url: string }) {
  const tex = useLoader(THREE.TextureLoader, url);
  tex.anisotropy = 8;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  const mesh = React.useRef<THREE.Mesh>(null!);
  useFrame((state) => { mesh.current.rotation.y += 0.002; });
  return (
    <mesh ref={mesh} rotation={[-0.1, 0.4, 0]}>
      <planeGeometry args={[2.2, 2.2]} />
      <meshStandardMaterial map={tex} metalness={0.1} roughness={0.9} />
    </mesh>
  );
}

export default function ThreePreview({ dataUrl }: { dataUrl: string }){
  const url = useMemo(() => dataUrl, [dataUrl]);
  return (
    <div className="w-full h-80 rounded-lg overflow-hidden border">
      <Canvas camera={{ position: [0, 0, 4], fov: 35 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 8, 6]} intensity={0.7} />
        {url ? <PlaneWithTexture url={url} /> : null}
      </Canvas>
    </div>
  );
}
