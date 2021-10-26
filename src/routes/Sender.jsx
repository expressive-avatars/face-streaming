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

export const state = {
  needsCalibration: false,
  matrixOffset: new THREE.Matrix4(),
}

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
        <FacetrackingSender />
        <FacetrackingCalibrator />
        <AttachToCamera>
          <FacetrackingPreview />
          <directionalLight position={3} />
          <ambientLight intensity={0.5} />
        </AttachToCamera>
      </ARCanvas>
      <DomOverlay>
        <div style={{ position: 'absolute', inset: 0 }}>
          <div>Hello Overlay!</div>
          <button onClick={() => (state.needsCalibration = true)}>Calibrate</button>
        </div>
      </DomOverlay>
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

function RotatingMesh() {
  const snap = useSnapshot(state)
  return (
    <mesh position-z={-4} rotation-x={snap.calibrationKey * 0.1}>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
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
