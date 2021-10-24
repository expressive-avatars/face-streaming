import { useEffect } from 'react'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { io } from 'socket.io-client'

export function Receiver() {
  return (
    <Canvas camera={{ fov: 35, position: [0, 0, 3] }}>
      <color attach="background" args={['black']} />
      <Suspense fallback={null}>
        <OrbitControls />
        <Model />
        <Environment preset="warehouse" background />
      </Suspense>
    </Canvas>
  )
}

const avatarURL = 'https://d1a370nemizbjq.cloudfront.net/54a8ca1e-1759-4cf9-ab76-bec155d6c83c.glb'

function Model() {
  const { scene, nodes } = useGLTF(avatarURL)
  /** @type {THREE.Mesh} */
  const face = nodes.Wolf3D_Head

  /** @type {THREE.Mesh} */
  const teeth = nodes.Wolf3D_Teeth

  useStreamedShapes((blendShapes) => {
    for (let key in blendShapes) {
      const i = face.morphTargetDictionary[key]
      face.morphTargetInfluences[i] = blendShapes[key]
      teeth.morphTargetInfluences[i] = blendShapes[key]
    }
  })
  return <primitive object={scene} position={[0, -2.4, 0]} scale={4} />
}

function useStreamedShapes(fn) {
  useEffect(() => {
    const socket = io('https://matt-backend.ngrok.io/')
    const onConnect = () => {
      console.log('connected to socket.io server')
    }
    const onBlendShapes = (blendShapes) => fn(blendShapes)
    socket.on('connect', onConnect)
    socket.on('blendShapes', onBlendShapes)
    return () => {
      socket.off('connect', onConnect)
      socket.off('blendShapes', onBlendShapes)
    }
  }, [])
}
