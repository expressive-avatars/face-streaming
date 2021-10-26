import { useFacetracking } from '@/hooks/useFacetracking'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const quaternion = new THREE.Quaternion()
const mat4 = new THREE.Matrix4()

export function FacetrackingPreview({ calibrationKey = 0 }) {
  /** @type {React.RefObject<THREE.Mesh>} */
  const mesh = useRef()
  const calibrate = useFacetracking((blendShapes, transform) => {
    mesh.current.quaternion.setFromRotationMatrix(transform)
  })
  console.log('calibrationKey', calibrationKey)
  useEffect(() => {
    console.log('calibrating')
    calibrate()
  }, [calibrationKey])
  return (
    <group position-z={-4}>
      <mesh ref={mesh}>
        <boxGeometry />
        <meshNormalMaterial />
      </mesh>
    </group>
  )
}
