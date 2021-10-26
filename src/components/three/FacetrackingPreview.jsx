import { useFacetracking } from '@/hooks/useFacetracking'
import { state } from '@/routes/Sender'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const quaternion = new THREE.Quaternion()
const mat4 = new THREE.Matrix4()

export function FacetrackingPreview() {
  /** @type {React.RefObject<THREE.Mesh>} */
  const mesh = useRef()
  useFacetracking((blendShapes, matrix) => {
    mat4.fromArray(matrix).multiply(state.matrixOffset)
    mesh.current.quaternion.setFromRotationMatrix(mat4)
  })
  return (
    <group position-z={-4}>
      <mesh ref={mesh}>
        <boxGeometry />
        <meshNormalMaterial />
      </mesh>
    </group>
  )
}
