import { ARCanvas } from '@react-three/xr'
import { Suspense } from 'react'

import { Fullscreen } from '@/components/dom/Fullscreen'
import { AttachToCamera } from '@/components/three/AttachToCamera'
import Avatar from '@/components/three/Avatar'

export function Sender() {
  return (
    <Fullscreen>
      <ARCanvas sessionInit={{ requiredFeatures: ['worldSensing'] }} camera={{ fov: 35 }}>
        <Suspense fallback={null}>
          <AttachToCamera>
            <group position={[0, -0.6, -1]}>
              <Avatar />
              <directionalLight position={3} />
              <ambientLight intensity={0.5} />
            </group>
          </AttachToCamera>
        </Suspense>
      </ARCanvas>
    </Fullscreen>
  )
}
