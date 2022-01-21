import { ARManager } from '@/utils/ARManager'
import { Environment } from '@react-three/drei'
import { Suspense, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/dom/Button'

import { ARCanvas } from '@/components/three/ARCanvas'
import { AttachToCamera } from '@/components/three/AttachToCamera'
import { FacelessAvatar } from '@/components/three/FacelessAvatar'
import { FacetrackingSender } from '@/components/three/FacetrackingSender'
import { Spin } from '@/components/three/Spin'
import { ReadyPlayerMeAvatar } from '@/components/three/ReadyPlayerMeAvatar'
import { FacetrackingManager } from '@/components/three/FacetrackingManager'

import { useCredentials } from '@/hooks/useCredentials'
import { useSocket } from '@/hooks/useSocket'

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

  return (
    <>
      <ARCanvas onCreated={onCreated}>
        <ThreeScene socket={socket} />
      </ARCanvas>
      {createPortal(
        <div className="fixed bottom-0 flex justify-center w-full">
          <div className="bg-white rounded-t-lg shadow-lg w-[450px] mx-8 p-8 flex flex-col items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-2">
                <StatusDot color={hubName ? 'green' : 'orange'} size={10} />
                {hubName ? 'Connected' : 'Waiting for connection...'}
              </span>
              <p className="text-hubs-gray">{hubName ?? 'Join a compatible room on Hubs desktop'}</p>
            </div>
            <span className="flex gap-4">
              <Button>Recenter</Button>
              <Button>Pause</Button>
            </span>
          </div>
        </div>,
        ar.domOverlay.root
      )}
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
  return (
    <Suspense fallback={null}>
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
