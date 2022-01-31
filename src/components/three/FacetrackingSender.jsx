import { useFacetracking } from '@/hooks/useFacetracking'
import { store } from '@/store'

/**
 * Sends blend shapes to socket.io server
 * Should be placed within an <ARCanvas />
 */
export function FacetrackingSender() {
  useFacetracking(({ blendShapes, headOrientation, eyeOrientation }) => {
    store.socket.volatile.emit('face', {
      blendShapes,
      headOrientation: headOrientation.toArray(),
      eyeOrientation: eyeOrientation.toArray(),
    })
  })
  return null
}
