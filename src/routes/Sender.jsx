import { ARCanvas } from '@react-three/xr'
import { useReducer, useState } from 'react'
import { createPortal } from 'react-dom'

import { Fullscreen } from '@/components/dom/Fullscreen'
import { AttachToCamera } from '@/components/three/AttachToCamera'
import { FacetrackingSender } from '@/components/three/FacetrackingSender'
import { FacetrackingPreview } from '@/components/three/FacetrackingPreview'

export function Sender() {
  const { rootEl, DomOverlay } = useDomOverlay()
  const [key, inc] = useReducer((x) => x + 1, 0)
  console.log(key)
  return (
    <Fullscreen>
      <ARCanvas
        sessionInit={{
          requiredFeatures: ['worldSensing', 'dom-overlay'],
          domOverlay: { root: rootEl },
        }}
        camera={{ fov: 35 }}
      >
        {/* <FacetrackingSender /> */}
        <AttachToCamera>
          <LogProps calibrationKey={key} />
          <FacetrackingPreview calibrationKey={key} />
          <directionalLight position={3} />
          <ambientLight intensity={0.5} />
        </AttachToCamera>
      </ARCanvas>
      <DomOverlay>
        <div style={{ position: 'absolute', inset: 0 }}>
          <div>Hello Overlay!</div>
          <button onClick={inc}>Calibrate</button>
          <p>Key: {key}</p>
        </div>
      </DomOverlay>
    </Fullscreen>
  )
}

function LogProps({ children, ...props }) {
  console.log('props', props)
  return null
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
