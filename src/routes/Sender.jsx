import { ARCanvas } from '@react-three/xr'
import { useEffect, useReducer, useState } from 'react'
import { createPortal } from 'react-dom'

import { Fullscreen } from '@/components/dom/Fullscreen'
import { AttachToCamera } from '@/components/three/AttachToCamera'
import { FacetrackingSender } from '@/components/three/FacetrackingSender'
import { FacetrackingPreview } from '@/components/three/FacetrackingPreview'
import * as THREE from 'three'
import { proxy, useSnapshot } from 'valtio'
import { useFacetracking } from '@/hooks/useFacetracking'
import { EmailInput } from '@/components/dom/EmailInput'
import { tw } from 'twind'

export const state = {
  needsCalibration: false,
  matrixOffset: new THREE.Matrix4(),
}

export function Sender() {
  const { rootEl, DomOverlay } = useDomOverlay()
  const [email, setEmail] = useState()
  return (
    <Fullscreen>
      {email ? (
        <>
          <ARCanvas
            sessionInit={{
              requiredFeatures: ['worldSensing', 'dom-overlay'],
              domOverlay: { root: rootEl },
            }}
            camera={{ fov: 35 }}
            style={{ background: 'black' }}
          >
            <FacetrackingSender email={email} />
            <FacetrackingCalibrator />
            <AttachToCamera>
              <FacetrackingPreview />
              <directionalLight position={3} />
              <ambientLight intensity={0.5} />
            </AttachToCamera>
          </ARCanvas>
          <DomOverlay>
            <div style={{ position: 'absolute', inset: 0 }}>
              <button
                className={tw`bg-blue-500 px-2 py-1 rounded text-white font-semibold m-4`}
                onClick={() => (state.needsCalibration = true)}
              >
                Calibrate
              </button>
            </div>
          </DomOverlay>
        </>
      ) : (
        <EmailInput onChange={(v) => setEmail(v)} />
      )}
    </Fullscreen>
  )
}

function FacetrackingCalibrator() {
  useFacetracking((blendShapes, matrix) => {
    if (state.needsCalibration) {
      state.matrixOffset.fromArray(matrix).invert()
      state.needsCalibration = false
    }
  })
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
