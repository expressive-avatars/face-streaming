import { ARManager } from '@/objects/ARManager'
import { Box, Environment } from '@react-three/drei'
import { Suspense, useRef, useState } from 'react'
import { ARCanvas } from './ARCanvas'
import { AttachToCamera } from './AttachToCamera'
import { FacelessAvatar } from './FacelessAvatar'
import { Spin } from './Spin'

export function ThreeApp() {
  const [ar] = useState(() => new ARManager())

  /** @param {import('@react-three/fiber').RootState} state */
  const onCreated = (state) => {
    ar.renderer = state.gl
    ar.sessionInit.requiredFeatures = ['worldSensing']
    ar.start()
  }

  return (
    <ARCanvas onCreated={onCreated}>
      <Suspense fallback={null}>
        <Environment preset="apartment" background />
        <AttachToCamera>
          <group position-z={-5} scale={10}>
            <group position={[0, -0.6, 0]}>
              <FacelessAvatar />
            </group>
          </group>
        </AttachToCamera>
      </Suspense>
    </ARCanvas>
  )
}
