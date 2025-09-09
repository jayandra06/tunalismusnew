"use client";
import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

// Loading component
function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-black bg-opacity-50 p-6 rounded-lg">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-white text-lg font-semibold">Loading globe...</p>
      </div>
    </Html>
  );
}

// 3D Model component with auto-rotation
function Model({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef();
  
  // Rotate the model continuously
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.1; 
    }
  });

  return <primitive ref={modelRef} object={scene} scale={0.5} position={[0, 0, 0]} />;
}

// Main Globe3D component
export default function Globe3D({ modelPath }) {
  return (
    <Canvas
        camera={{ 
          position: [0, 0, 120],
          fov: 50, 
          near: 0.1,
          far: 1000
        }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Model modelPath={modelPath} />
        </Suspense>
      </Canvas>
  );
}