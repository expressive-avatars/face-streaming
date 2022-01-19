import { useCredentials } from '@/hooks/useCredentials'
import { useFacetracking } from '@/hooks/useFacetracking'
import { useSocket } from '@/hooks/useSocket'
import { state } from '@/routes/Sender'
import * as THREE from 'three'

const mat4 = new THREE.Matrix4()

/**
 * Sends blend shapes to socket.io server
 * Should be placed within an <ARCanvas />
 */
export function FacetrackingSender({ socket }) {
  useFacetracking((blendShapes, headOrientation) => {
    // TODO : apply calibration in the FacetrackingProvider?
    // mat4.fromArray(matrix).multiply(state.matrixOffset)
    socket.volatile.emit('face', { blendShapes, headOrientation: headOrientation.toArray() })
  })
  return null
}
