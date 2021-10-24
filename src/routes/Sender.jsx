import { ARCanvas } from '@react-three/xr'
import { Suspense, useState } from 'react'
import { createPortal } from 'react-dom'

import { Fullscreen } from '@/components/dom/Fullscreen'
import { AttachToCamera } from '@/components/three/AttachToCamera'
import Avatar from '@/components/three/Avatar'

export function Sender() {
  const { rootEl, DomOverlay } = useDomOverlay()
  return (
    <Fullscreen>
      <ARCanvas
        sessionInit={{
          requiredFeatures: ['worldSensing', 'dom-overlay'],
          domOverlay: { root: rootEl },
        }}
        camera={{ fov: 35 }}
      >
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
      <DomOverlay>
        <div style={{ position: 'absolute', inset: 0 }}>
          <div>Hello Overlay!</div>
        </div>
      </DomOverlay>
    </Fullscreen>
  )
}

function useDomOverlay() {
  const [rootEl] = useState(() => {
    const overlayElement = document.createElement('div')
    document.body.appendChild(overlayElement)
    return overlayElement
  })
  function DomOverlay({ children }) {
    return createPortal(children, rootEl)
  }
  return { rootEl, DomOverlay }
}
