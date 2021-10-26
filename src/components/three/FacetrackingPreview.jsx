import { useFacetracking } from '@/hooks/useFacetracking'
import { state } from '@/routes/Sender'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useSnapshot } from 'valtio'

const quaternion = new THREE.Quaternion()
const mat4 = new THREE.Matrix4()

export function FacetrackingPreview() {
  /** @type {React.RefObject<THREE.Mesh>} */
  const mesh = useRef()
  const calibrate = useFacetracking((blendShapes, transform) => {
    mesh.current.quaternion.setFromRotationMatrix(transform)
  })
  const snap = useSnapshot(state)
  useEffect(() => {
    calibrate()
  }, [snap.calibrationKey])
  return (
    <group position-z={-4}>
      <mesh ref={mesh}>
        <boxGeometry />
        <meshNormalMaterial />
      </mesh>
    </group>
  )
}
