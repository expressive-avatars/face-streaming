import { useEffect, useRef } from 'react'
import { Environment, OrbitControls, TorusKnot, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense } from 'react'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'
import { io } from 'socket.io-client'

export default function App() {
  return (
    <Canvas>
      <color attach="background" args={['black']} />
      <Suspense fallback={null}>
        <OrbitControls />
        <Model />
        <Environment preset="warehouse" background />
      </Suspense>
    </Canvas>
  )
}

function Model() {
  const { gl } = useThree()
  const { scene, nodes } = useGLTF('/facecap.glb', true, true, (loader) => {
    const ktx2Loader = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(gl)
    loader.setKTX2Loader(ktx2Loader)
  })
  /** @type {THREE.Mesh} */
  const face = nodes['mesh_2']
  useStreamedShapes((blendShapes) => {
    // console.log(blendShapes.jawOpen)
    for (let key in blendShapes) {
      const i = face.morphTargetDictionary[key]
      face.morphTargetInfluences[i] = blendShapes[key]
    }
  })
  return <primitive object={scene} />
}

function useStreamedShapes(fn) {
  useEffect(() => {
    const socket = io()
    socket.on('connect', () => {
      console.log('connected to socket.io server')
    })
    socket.on('blendShapes', (blendShapes) => {
      fn(blendShapes)
    })
  }, [])
}

function Thing() {
  const ref = useRef()
  useFrame(() => (ref.current.rotation.y += 0.01))
  return (
    <TorusKnot ref={ref} args={[1, 0.3, 128, 16]}>
      <meshNormalMaterial />
    </TorusKnot>
  )
}
