import { useRef } from 'react'
import { Environment, OrbitControls, TorusKnot, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense } from 'react'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'

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
  const { scene } = useGLTF('/facecap.glb', true, true, (loader) => {
    const ktx2Loader = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(gl)
    loader.setKTX2Loader(ktx2Loader)
  })
  return <primitive object={scene} />
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
