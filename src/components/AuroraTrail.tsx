/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Trail } from '@react-three/drei';

interface AuroraTrailProps {
  position: THREE.Vector3;
  color: string;
  isLocal?: boolean;
}

export function AuroraTrail({ position, color, isLocal = false }: AuroraTrailProps) {
  const groupRef = useRef<THREE.Group>(null);
  const baseColor = useMemo(() => new THREE.Color(color), [color]);
  
  // Create variations for the aurora "curtains"
  const curtains = useMemo(() => [
    { offset: 0, width: 0.8, length: 40, opacity: 0.4, colorShift: 0 },
    { offset: 0.5, width: 0.6, length: 35, opacity: 0.3, colorShift: 0.1 },
    { offset: -0.5, width: 0.6, length: 35, opacity: 0.3, colorShift: -0.1 },
    { offset: 1.2, width: 0.4, length: 30, opacity: 0.2, colorShift: 0.2 },
    { offset: -1.2, width: 0.4, length: 30, opacity: 0.2, colorShift: -0.2 },
  ], []);

  const dummyRefs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Smoothly follow the target position
    groupRef.current.position.lerp(position, isLocal ? 0.5 : 0.2);

    // Update each curtain's dummy position with some noise/wave
    dummyRefs.current.forEach((dummy, i) => {
      if (!dummy) return;
      const curtain = curtains[i];
      
      // Vertical waving effect
      const wave = Math.sin(time * 2 + i) * 0.3;
      const horizontalWave = Math.cos(time * 1.5 + i) * 0.2;
      
      dummy.position.set(horizontalWave, curtain.offset + wave, 0);
    });
  });

  return (
    <group ref={groupRef}>
      {curtains.map((curtain, i) => {
        const curtainColor = baseColor.clone();
        if (curtain.colorShift !== 0) {
          // Shift hue slightly for aurora variety
          const hsl = { h: 0, s: 0, l: 0 };
          curtainColor.getHSL(hsl);
          curtainColor.setHSL((hsl.h + curtain.colorShift + 1) % 1, hsl.s, hsl.l);
        }

        return (
          <Trail
            key={i}
            width={curtain.width}
            length={curtain.length}
            color={curtainColor}
            attenuation={(t) => t * t * (1 - t)} // Fades at both ends slightly
          >
            <group 
              ref={(el) => { if (el) dummyRefs.current[i] = el; }} 
              position={[0, curtain.offset, 0]}
            />
          </Trail>
        );
      })}
      
      {/* Core glow at cursor */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <mesh scale={3}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
