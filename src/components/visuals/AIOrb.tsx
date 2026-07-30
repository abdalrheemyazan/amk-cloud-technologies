"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, MeshWobbleMaterial } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function IntelligenceCore({ isThinking }: { isThinking: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !coreRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * (isThinking ? 3 : 0.8);
    meshRef.current.rotation.z = t * (isThinking ? 1.5 : 0.4);
    coreRef.current.scale.setScalar(1 + Math.sin(t * 4) * 0.1);
  });

  return (
    <group>
      {/* Outer Intelligence Shell (Light) */}
      <Sphere ref={meshRef} args={[1, 120, 120]} scale={1.8}>
        <MeshDistortMaterial
          color={isThinking ? "#3b82f6" : "#ffffff"}
          distort={isThinking ? 0.7 : 0.4}
          speed={isThinking ? 5 : 2}
          roughness={0}
          metalness={0.1}
          transparent
          opacity={0.7}
          emissive={isThinking ? "#3b82f6" : "#ffffff"}
          emissiveIntensity={isThinking ? 2 : 0.5}
        />
      </Sphere>

      {/* Inner Energy Core */}
      <Sphere ref={coreRef} args={[1, 64, 64]} scale={0.8}>
        <MeshWobbleMaterial
          color="#3b82f6"
          factor={isThinking ? 1 : 0.2}
          speed={10}
          emissive="#3b82f6"
          emissiveIntensity={2}
        />
      </Sphere>
      
      {/* Orbital Glow */}
      <pointLight distance={10} intensity={isThinking ? 15 : 5} color="#3b82f6" />
    </group>
  );
}

export default function AIOrb({ isThinking = false }: { isThinking?: boolean }) {
  return (
    <div className="w-full h-full min-h-[300px] lg:min-h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#3b82f6" />
        
        <Float speed={5} rotationIntensity={1} floatIntensity={1}>
          <IntelligenceCore isThinking={isThinking} />
        </Float>
      </Canvas>
    </div>
  );
}
