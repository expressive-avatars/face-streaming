import { ARManager } from '@/objects/ARManager'
import { Box, Environment } from '@react-three/drei'
import { Suspense, useRef, useState } from 'react'
import { ARCanvas } from './ARCanvas'
import { AttachToCamera } from './AttachToCamera'
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
          <group position-z={-3}>
            <Spin>
              <Box>
                <meshNormalMaterial />
              </Box>
            </Spin>
          </group>
        </AttachToCamera>
      </Suspense>
    </ARCanvas>
  )
}
