import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 120 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    const pts = ref.current;
    if (!pts) return;
    pts.rotation.y = clock.elapsedTime * 0.04;
    pts.rotation.x = Math.sin(clock.elapsedTime * 0.15) * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#0066FF"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function BrandBars() {
  const blue = '#0066FF';
  const green = '#22B450';
  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.6}>
      <group position={[3.2, 0.4, -1.2]} rotation={[0.35, -0.55, 0.15]}>
        <mesh position={[-0.55, -0.15, 0]}>
          <boxGeometry args={[0.35, 1.4, 0.18]} />
          <meshStandardMaterial color={green} roughness={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.35, 1.8, 0.18]} />
          <meshStandardMaterial color={blue} roughness={0.35} metalness={0.25} />
        </mesh>
        <mesh position={[0.55, 0.35, 0]}>
          <boxGeometry args={[0.35, 2.2, 0.18]} />
          <meshStandardMaterial color={blue} roughness={0.35} metalness={0.25} />
        </mesh>
        {/* arrow-ish wedge */}
        <mesh position={[0.2, 1.35, 0.05]} rotation={[0, 0, -0.7]}>
          <coneGeometry args={[0.22, 0.7, 4]} />
          <meshStandardMaterial color={blue} roughness={0.3} metalness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

function Ribbon() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.z = Math.sin(clock.elapsedTime * 0.35) * 0.25;
    mesh.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.2;
  });
  return (
    <mesh ref={mesh} position={[-3.5, 0.2, -2]} rotation={[0.4, 0.6, -0.3]}>
      <torusGeometry args={[1.6, 0.04, 12, 64]} />
      <meshStandardMaterial color="#22B450" transparent opacity={0.35} roughness={0.4} />
    </mesh>
  );
}

/** Inner canvas scene — dynamically imported so three.js stays out of the critical path. */
export default function HeroAtmosphereCanvas() {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 3]} intensity={0.85} color="#ffffff" />
        <directionalLight position={[-3, -2, 2]} intensity={0.35} color="#0066FF" />
        <ParticleField />
        <BrandBars />
        <Ribbon />
      </Canvas>
    </div>
  );
}
