import { useFacetracking } from '@/hooks/useFacetracking'
import { useSocket } from '@/hooks/useSocket'

/**
 * Sends blend shapes to socket.io server
 * Should be placed within an <ARCanvas />
 */
export function FacetrackingSender() {
  const socket = useSocket('https://matt-backend.ngrok.io')
  useFacetracking((blendShapes) => {
    socket.volatile.emit('blendShapes', blendShapes)
  })
  return null
}
