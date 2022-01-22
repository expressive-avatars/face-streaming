import { useFacetracking } from '@/hooks/useFacetracking'

/**
 * Sends blend shapes to socket.io server
 * Should be placed within an <ARCanvas />
 */
export function FacetrackingSender({ socket }) {
  useFacetracking((blendShapes, headOrientation) => {
    socket.volatile.emit('face', { blendShapes, headOrientation: headOrientation.toArray() })
  })
  return null
}
