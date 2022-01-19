import { FacetrackingProvider } from '@/context/FacetrackingContext'
import { ARManager } from '@/objects/ARManager'
import { Box, Environment } from '@react-three/drei'
import { Suspense, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/dom/Button'

import { ARCanvas } from '@/components/three/ARCanvas'
import { AttachToCamera } from '@/components/three/AttachToCamera'
import { FacelessAvatar } from '@/components/three/FacelessAvatar'
import { FacetrackingSender } from '@/components/three/FacetrackingSender'
import { Spin } from '@/components/three/Spin'

export function ThreeApp() {
  const [ar] = useState(() => new ARManager())

  /** @param {import('@react-three/fiber').RootState} state */
  const onCreated = (state) => {
    ar.renderer = state.gl
    ar.sessionInit.requiredFeatures = ['worldSensing']
    ar.start()
  }

  return (
    <>
      <ARCanvas onCreated={onCreated}>
        <FacetrackingProvider>
          <Suspense fallback={null}>
            <Environment preset="apartment" background />
            <FacetrackingSender />
            <AttachToCamera>
              <group position-z={-5} scale={10}>
                <group position={[0, -0.6, 0]}>
                  <FacelessAvatar />
                </group>
              </group>
            </AttachToCamera>
          </Suspense>
        </FacetrackingProvider>
      </ARCanvas>
      {createPortal(
        <Overlay>
          <div className="fixed bottom-0 flex justify-center w-full">
            <div className="bg-white rounded-t-lg shadow-lg p-8 flex flex-col items-center gap-4">
              <div className="flex flex-col items-center">
                <span className="flex items-center gap-2">
                  <StatusDot color="orange" size={10} />
                  Waiting for connection...
                </span>
                <p className="text-hubs-gray">Join a compatible room on Hubs desktop</p>
              </div>
              <span className="flex gap-4">
                <Button>Recenter</Button>
                <Button>Pause</Button>
              </span>
            </div>
          </div>
        </Overlay>,
        ar.domOverlay.root
      )}
    </>
  )
}

function StatusDot({ color = 'green', size = 10 }) {
  const style = {
    display: 'inline-block',
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: 9999,
  }
  return <div style={style} />
}

function Overlay({ children }) {
  return <div className="absolute inset-0">{children}</div>
}
