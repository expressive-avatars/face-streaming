import { useFacetracking } from '@/hooks/useFacetracking'
import { useSocket } from '@/hooks/useSocket'
import { state } from '@/routes/Sender'
import * as THREE from 'three'

const mat4 = new THREE.Matrix4()

/**
 * Sends blend shapes to socket.io server
 * Should be placed within an <ARCanvas />
 */
export function FacetrackingSender() {
  const socket = useSocket('https://matt-backend.ngrok.io')
  useFacetracking((blendShapes, matrix) => {
    mat4.fromArray(matrix).multiply(state.matrixOffset)
    socket.volatile.emit('face', { blendShapes, matrix: mat4.toArray() })
  })
  return null
}
