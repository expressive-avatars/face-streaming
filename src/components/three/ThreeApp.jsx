import { ARManager } from '@/utils/ARManager'
import { Environment } from '@react-three/drei'
import { Suspense, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/dom/Button'
import { SwitchCameraPrompt } from '@/components/dom/SwitchCameraPrompt'
import { TrackingPanel } from '@/components/dom/TrackingPanel'

import { ARCanvas } from '@/components/three/ARCanvas'
import { AttachToCamera } from '@/components/three/AttachToCamera'
import { FacelessAvatar } from '@/components/three/FacelessAvatar'
import { FacetrackingSender } from '@/components/three/FacetrackingSender'
import { Spin } from '@/components/three/Spin'
import { ReadyPlayerMeAvatar } from '@/components/three/ReadyPlayerMeAvatar'
import { FacetrackingManager } from '@/components/three/FacetrackingManager'

import { useCredentials } from '@/hooks/useCredentials'
import { useSocket } from '@/hooks/useSocket'
import { useStore } from '@/store'
import { Curtain } from './Curtain'

export function ThreeApp() {
  const [ar] = useState(() => new ARManager())

  /** @param {import('@react-three/fiber').RootState} state */
  const onCreated = (state) => {
    ar.renderer = state.gl
    ar.sessionInit.optionalFeatures = ['worldSensing']
    ar.start()
  }

  const { token } = useCredentials()
  const socket = useSocket(import.meta.env.VITE_BACKEND + '/provider', {
    query: { token },
  })

  // Listen for hub name
  const [hubName, setHubName] = useState()
  useEffect(() => {
    const listener = (val) => setHubName(val)
    socket.on('hub_name', listener)
    return () => socket.removeListener('hub_name', listener)
  }, [socket])

  const snap = useStore()

  return (
    <>
      <ARCanvas onCreated={onCreated}>
        <ThreeScene socket={socket} />
      </ARCanvas>
      {createPortal(snap.trackingStarted ? <TrackingPanel hubName={hubName} /> : <SwitchCameraPrompt />, ar.domOverlay.root)}
    </>
  )
}

function ThreeScene({ socket }) {
  // Listen for hub name
  const [avatarURL, setAvatarURL] = useState()
  useEffect(() => {
    const listener = (val) => setAvatarURL(val)
    socket.on('avatar_url', listener)
    return () => socket.removeListener('avatar_url', listener)
  }, [socket])
  const snap = useStore()
  return (
    <Suspense fallback={null}>
      {!snap.trackingStarted && <Curtain color="white" />}

      <Environment preset="apartment" background />
      <FacetrackingManager />
      <FacetrackingSender socket={socket} />
      <AttachToCamera>
        <group position-z={-5} scale={10}>
          <group position={[0, -0.6, 0]} scale-x={-1}>
            {avatarURL ? <ReadyPlayerMeAvatar path={avatarURL} /> : <FacelessAvatar />}
          </group>
        </group>
      </AttachToCamera>
    </Suspense>
  )
}
