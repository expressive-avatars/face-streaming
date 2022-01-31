import { useState, useRef, Suspense } from 'react'
import * as THREE from 'three'

import { ARManager } from '@/utils/ARManager'
import { useFacetracking } from '@/hooks/useFacetracking'

import { ARCanvas } from './ARCanvas'
import { AttachToCamera } from './AttachToCamera'
import { FacetrackingManager } from './FacetrackingManager'
import { store } from '@/store'
import { createPortal } from 'react-dom'

export function FacetrackingDebugger() {
  const [ar] = useState(() => new ARManager())
  const onCreated = (state) => {
    ar.renderer = state.gl
    ar.sessionInit.optionalFeatures = ['worldSensing']
    ar.start()
  }
  return (
    <>
      <ARCanvas onCreated={onCreated}>
        <Scene />
      </ARCanvas>
      {createPortal(<Overlay />, ar.domOverlay.root)}
    </>
  )
}

function Scene() {
  /** @type {React.RefObject<THREE.Object3D>} */
  const head = useRef()
  const eye = useRef()

  useFacetracking(({ headOrientation, eyeOrientation }) => {
    head.current.quaternion.copy(headOrientation)
    eye.current.quaternion.copy(eyeOrientation)
  })

  return (
    <group>
      <FacetrackingManager />
      <AttachToCamera>
        <group position-z={-3}>
          <group ref={head}>
            <mesh>
              <boxGeometry />
              <meshNormalMaterial />
              <axesHelper />
            </mesh>
            <mesh ref={eye} scale={0.3} position={[0, 0, 0.5]}>
              <boxGeometry />
              <meshNormalMaterial />
              <axesHelper />
            </mesh>
          </group>
        </group>
      </AttachToCamera>
    </group>
  )
}

function Overlay() {
  return (
    <div>
      <button className="bg-blue-600 text-2xl rounded text-white" onClick={() => store.calibrate()}>
        Calibrate
      </button>
    </div>
  )
}
