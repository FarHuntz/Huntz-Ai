/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { AuroraTrail } from './AuroraTrail';

function PlayerCursor({ position, color }: { position: THREE.Vector3; color: string }) {
  return <AuroraTrail position={position} color={color} />;
}

export function LocalCursor({ mousePosRef }: { mousePosRef: React.MutableRefObject<THREE.Vector3 | null> }) {
  const myColor = useGameStore((state) => state.myColor);

  if (!myColor || !mousePosRef.current) return null;

  return <AuroraTrail position={mousePosRef.current} color={myColor} isLocal />;
}

export function OtherPlayers() {
  const players = useGameStore((state) => state.players);

  return (
    <>
      {Object.values(players).map((player) => {
        if (!player.position) return null;
        const pos = new THREE.Vector3(player.position.x, player.position.y, player.position.z);
        return <PlayerCursor key={player.id} position={pos} color={player.color} />;
      })}
    </>
  );
}
