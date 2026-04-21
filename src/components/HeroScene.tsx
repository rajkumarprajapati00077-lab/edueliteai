import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Mesh } from "three";

function GlowingKnot() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.15;
    ref.current.rotation.y += delta * 0.2;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref} scale={1.6}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#3b6dff"
          emissive="#7c3aff"
          emissiveIntensity={0.6}
          distort={0.45}
          speed={2}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>
    </Float>
  );
}

function Nodes() {
  const group = useRef<any>(null);
  useFrame((_, d) => {
    if (group.current) group.current.rotation.y += d * 0.08;
  });
  return (
    <group ref={group}>
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const r = 3.2;
        return (
          <mesh key={i} position={[Math.cos(a) * r, Math.sin(a * 2) * 0.6, Math.sin(a) * r]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#a78bff" emissive="#7c3aff" emissiveIntensity={2} />
          </mesh>
        );
      })}
    </group>
  );
}

export const HeroScene = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#3b6dff" />
        <pointLight position={[-5, -3, -3]} intensity={1.2} color="#a855f7" />
        <GlowingKnot />
        <Nodes />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
};