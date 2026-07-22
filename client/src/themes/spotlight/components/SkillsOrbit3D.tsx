import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Text } from '@react-three/drei';
import type { Group } from 'three';
import type { SkillItem } from '@/types';
import { skillLevelPercent } from '../motion';

function SkillNode({
  name,
  level,
  angle,
  radius,
  color,
}: {
  name: string;
  level?: string;
  angle: number;
  radius: number;
  color: string;
}) {
  const ref = useRef<Group>(null);
  const size = 0.18 + (skillLevelPercent(level) / 100) * 0.22;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = Math.sin(angle * 2) * 0.35;

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.15;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.35}>
      <group ref={ref} position={[x, y, z]}>
        <mesh>
          <sphereGeometry args={[size, 24, 24]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.25} emissive={color} emissiveIntensity={0.15} />
        </mesh>
        <Text
          position={[0, size + 0.22, 0]}
          fontSize={0.16}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.4}
          outlineWidth={0.012}
          outlineColor="#000000"
        >
          {name}
        </Text>
      </group>
    </Float>
  );
}

function OrbitScene({ skills, primary }: { skills: SkillItem[]; primary: string }) {
  const nodes = useMemo(() => {
    const list = [...skills].sort((a, b) => a.order - b.order).slice(0, 12);
    return list.map((skill, i) => ({
      skill,
      angle: (i / list.length) * Math.PI * 2,
      radius: 1.55 + (i % 3) * 0.22,
    }));
  }, [skills]);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 2]} intensity={1.1} />
      <pointLight position={[-3, -2, -4]} intensity={0.4} color={primary} />
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.7, 0.008, 8, 96]} />
        <meshBasicMaterial color={primary} transparent opacity={0.35} />
      </mesh>
      {nodes.map(({ skill, angle, radius }) => (
        <SkillNode
          key={skill.name}
          name={skill.name}
          level={skill.level}
          angle={angle}
          radius={radius}
          color={primary}
        />
      ))}
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.55} maxPolarAngle={Math.PI * 0.72} minPolarAngle={Math.PI * 0.28} />
    </>
  );
}

/** Lazy-loaded WebGL skills orbit — desktop / fine pointer only. */
export default function SkillsOrbit3D({ skills }: { skills: SkillItem[] }) {
  const primary =
    typeof window !== 'undefined'
      ? getComputedStyle(document.querySelector('[data-portfolio-theme="spotlight"]') || document.documentElement)
          .getPropertyValue('--primary')
          .trim() || '249 115 22'
      : '249 115 22';
  const color = `rgb(${primary})`;

  return (
    <div className="spotlight-skills-3d">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.4, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <OrbitScene skills={skills} primary={color} />
        </Suspense>
      </Canvas>
      <p className="text-[10px] text-center text-subtle mt-2">Drag to orbit · auto-rotates</p>
    </div>
  );
}
