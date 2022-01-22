import { useFacetracking } from '@/hooks/useFacetracking'
import { store } from '@/store'
import { useEffect } from 'react'

/**
 * Sends blend shapes to socket.io server
 * Should be placed within an <ARCanvas />
 */
export function FacetrackingSender({ socket }) {
  // Listen for action requests
  useEffect(() => {
    const listener = (type) => {
      switch (type) {
        case 'calibrate':
          store.calibrate()
          break
        case 'pause':
          store.togglePause()
          break
      }
    }
    socket.on('action', listener)
    return () => socket.removeListener('action', listener)
  }, [socket])

  useFacetracking((blendShapes, headOrientation) => {
    // TODO : apply calibration in the FacetrackingProvider?
    // mat4.fromArray(matrix).multiply(state.matrixOffset)
    socket.volatile.emit('face', { blendShapes, headOrientation: headOrientation.toArray() })
  })
  return null
}
