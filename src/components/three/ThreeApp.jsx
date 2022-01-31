import { ARManager } from '@/utils/ARManager'
import { Environment } from '@react-three/drei'
import { Suspense, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { SwitchCameraPrompt } from '@/components/dom/SwitchCameraPrompt'
import { TrackingPanel } from '@/components/dom/TrackingPanel'

import { ARCanvas } from '@/components/three/ARCanvas'
import { AttachToCamera } from '@/components/three/AttachToCamera'
import { FacetrackingSender } from '@/components/three/FacetrackingSender'
import { Spin } from '@/components/three/Spin'
import { ReadyPlayerMeAvatar } from '@/components/three/ReadyPlayerMeAvatar'
import { FacetrackingManager } from '@/components/three/FacetrackingManager'

import { useAspect } from '@/hooks/useAspect'
import { useStore, store } from '@/store'
import { Curtain } from './Curtain'

export function ThreeApp() {
  const [ar] = useState(() => new ARManager())

  /** @param {import('@react-three/fiber').RootState} state */
  const onCreated = (state) => {
    ar.renderer = state.gl
    ar.sessionInit.optionalFeatures = ['worldSensing']
    ar.start()
  }

  // Begin socket connection
  useEffect(() => {
    store.initSocket()
  }, [])

  return (
    <>
      <ARCanvas onCreated={onCreated}>
        <ThreeScene />
      </ARCanvas>
      {createPortal(<Overlay />, ar.domOverlay.root)}
    </>
  )
}

function Overlay() {
  const snap = useStore()
  return (
    <>
      {snap.previewHidden && (
        <div className="fixed w-screen h-screen grid text-center place-content-center gap-4">
          <p className="text-hubs-gray">(Preview hidden)</p>
          <p className="text-xl text-black">
            Facetracking is <b className="text-black underline">{snap.paused ? 'PAUSED' : 'ACTIVE'}</b>
          </p>
        </div>
      )}
      {snap.trackingStarted ? <TrackingPanel hubName={snap.hubName} /> : <SwitchCameraPrompt />}
    </>
  )
}

function ThreeScene() {
  const snap = useStore()

  const aspect = useAspect()
  const landscape = aspect > 1

  const hideScene = snap.previewHidden || !snap.trackingStarted

  return (
    <>
      {hideScene && <Curtain color="white" />}
      <Suspense fallback={null}>
        <Environment preset="apartment" background />
        <FacetrackingManager />
        <FacetrackingSender />
        <AttachToCamera>
          <group position-z={landscape ? -6 : -5} scale={10}>
            <group position={[0, -0.6, 0]} scale-x={-1}>
              <ReadyPlayerMeAvatar path={snap.avatarURL} />
            </group>
          </group>
        </AttachToCamera>
      </Suspense>
    </>
  )
}
